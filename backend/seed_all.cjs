const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });

const templateLogs = [
  { daysAgo: 6, hour: 9, minute: 15, emotion: "fear", message_preview: "I am feeling extremely overwhelmed by my upcoming deadlines. I don't know where to start." },
  { daysAgo: 6, hour: 19, minute: 30, emotion: "sadness", message_preview: "I just feel so exhausted today. Everything seems like a massive effort." },
  { daysAgo: 5, hour: 8, minute: 45, emotion: "nervousness", message_preview: "I have that presentation later today. My heart is racing and my palms are sweating." },
  { daysAgo: 5, hour: 20, minute: 15, emotion: "relief", message_preview: "The presentation went surprisingly well. I'm so glad it's finally over." },
  { daysAgo: 4, hour: 10, minute: 0, emotion: "anger", message_preview: "My coworker took credit for the project we've been working on. I'm furious right now." },
  { daysAgo: 4, hour: 21, minute: 45, emotion: "calm", message_preview: "I took your advice and went for a long walk. I feel much more centered now." },
  { daysAgo: 3, hour: 11, minute: 20, emotion: "confusion", message_preview: "I'm really torn about this new job offer. It pays more but the hours are terrible." },
  { daysAgo: 3, hour: 18, minute: 30, emotion: "optimism", message_preview: "After writing out the pros and cons, I think I have a clear path forward. I feel good about it." },
  { daysAgo: 2, hour: 9, minute: 10, emotion: "neutral", message_preview: "Just checking in today. Nothing major going on, just a regular morning." },
  { daysAgo: 2, hour: 22, minute: 5, emotion: "gratitude", message_preview: "Had dinner with my family tonight. It's nice to just be around people who care." },
  { daysAgo: 1, hour: 13, minute: 40, emotion: "curiosity", message_preview: "I started reading that book you suggested about mindfulness. It's actually really interesting." },
  { daysAgo: 1, hour: 20, minute: 50, emotion: "joy", message_preview: "I hit a new personal best at the gym today! I feel so energetic and proud." },
  { daysAgo: 0, hour: 8, minute: 30, emotion: "calm", message_preview: "Doing my morning breathing exercises. Starting the day feeling very peaceful." },
  { daysAgo: 0, hour: 19, minute: 20, emotion: "pride", message_preview: "Looking back at my week, I handled stress much better than I used to. Thanks for being here." }
];

(async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('soulify_db');
    
    // Get ALL users
    const users = await db.collection('users').find({}).toArray();
    let allNewLogs = [];
    
    for (const u of users) {
      const uid = u._id.toString();
      // Remove any existing mock logs for this user to avoid duplicates
      await db.collection('mood_logs').deleteMany({
        user_id: uid,
        message_preview: { $in: templateLogs.map(log => log.message_preview) }
      });
      
      const userLogs = templateLogs.map(log => {
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - log.daysAgo);
        timestamp.setHours(log.hour, log.minute, 0, 0);
        return {
          user_id: uid,
          timestamp: timestamp,
          emotion: log.emotion,
          message_preview: log.message_preview
        };
      });
      allNewLogs = allNewLogs.concat(userLogs);
    }
    
    if (allNewLogs.length > 0) {
      await db.collection('mood_logs').insertMany(allNewLogs);
      console.log(`Seeded ${allNewLogs.length} logs across ${users.length} users successfully!`);
    } else {
      console.log("No users found to seed.");
    }

  } catch (err) {
    console.error("Error seeding:", err);
  } finally {
    await client.close();
  }
})();
