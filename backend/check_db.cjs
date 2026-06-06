const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });

(async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('soulify_db');
    
    console.log("--- USERS ---");
    const users = await db.collection('users').find({}).toArray();
    users.forEach(u => console.log(u.email, u._id.toString()));

    console.log("\n--- MOOD LOGS ---");
    const logs = await db.collection('mood_logs').find({}).toArray();
    console.log(`Total logs: ${logs.length}`);
    if (logs.length > 0) {
      console.log("Sample log:", JSON.stringify(logs[0], null, 2));
      console.log("Type of timestamp:", typeof logs[0].timestamp, logs[0].timestamp instanceof Date ? "Date Object" : "Not Date Object");
      console.log("user_id:", logs[0].user_id);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
})();
