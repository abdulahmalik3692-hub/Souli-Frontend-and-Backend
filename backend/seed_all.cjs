const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });

const templateLogs = [
  { timestamp: new Date("2026-05-30T09:15:00Z"), emotion: "fear", message_preview: "I am feeling extremely overwhelmed by my upcoming deadlines. I don't know where to start." },
  { timestamp: new Date("2026-05-30T19:30:00Z"), emotion: "sadness", message_preview: "I just feel so exhausted today. Everything seems like a massive effort." },
  { timestamp: new Date("2026-05-31T08:45:00Z"), emotion: "nervousness", message_preview: "I have that presentation later today. My heart is racing and my palms are sweating." },
  { timestamp: new Date("2026-05-31T20:15:00Z"), emotion: "relief", message_preview: "The presentation went surprisingly well. I'm so glad it's finally over." },
  { timestamp: new Date("2026-06-01T10:00:00Z"), emotion: "anger", message_preview: "My coworker took credit for the project we've been working on. I'm furious right now." },
  { timestamp: new Date("2026-06-01T21:45:00Z"), emotion: "calm", message_preview: "I took your advice and went for a long walk. I feel much more centered now." },
  { timestamp: new Date("2026-06-02T11:20:00Z"), emotion: "confusion", message_preview: "I'm really torn about this new job offer. It pays more but the hours are terrible." },
  { timestamp: new Date("2026-06-02T18:30:00Z"), emotion: "optimism", message_preview: "After writing out the pros and cons, I think I have a clear path forward. I feel good about it." },
  { timestamp: new Date("2026-06-03T09:10:00Z"), emotion: "neutral", message_preview: "Just checking in today. Nothing major going on, just a regular morning." },
  { timestamp: new Date("2026-06-03T22:05:00Z"), emotion: "gratitude", message_preview: "Had dinner with my family tonight. It's nice to just be around people who care." },
  { timestamp: new Date("2026-06-04T13:40:00Z"), emotion: "curiosity", message_preview: "I started reading that book you suggested about mindfulness. It's actually really interesting." },
  { timestamp: new Date("2026-06-04T20:50:00Z"), emotion: "joy", message_preview: "I hit a new personal best at the gym today! I feel so energetic and proud." },
  { timestamp: new Date("2026-06-05T08:30:00Z"), emotion: "calm", message_preview: "Doing my morning breathing exercises. Starting the day feeling very peaceful." },
  { timestamp: new Date("2026-06-05T19:20:00Z"), emotion: "pride", message_preview: "Looking back at my week, I handled stress much better than I used to. Thanks for being here." }
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
      await db.collection('mood_logs').deleteMany({ user_id: uid, emotion: "curiosity", message_preview: /mindfulness/ });
      await db.collection('mood_logs').deleteMany({ user_id: uid, emotion: "pride", message_preview: /Looking back at my week/ });
      
      const userLogs = templateLogs.map(log => ({
        user_id: uid,
        timestamp: log.timestamp,
        emotion: log.emotion,
        message_preview: log.message_preview
      }));
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
