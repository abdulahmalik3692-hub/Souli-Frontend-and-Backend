import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  connectDb,
  createOrUpdateUnverifiedUser,
  verifyUserCodeDb,
  verifyUserLogin,
  getUserByEmail,
  moodLogs,
  users
} from './db.js';
import { EMOTION_MOOD_SCORES } from './constants.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*', // Allow all origins for local/Vite development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Human readable mappings of emotions for reports
const HUMAN_EMOTION_LABELS = {
  'joy': 'Joyful',
  'excitement': 'Excited',
  'love': 'Loving',
  'amusement': 'Amused',
  'pride': 'Proud',
  'optimism': 'Optimistic',
  'gratitude': 'Grateful',
  'relief': 'Relieved',
  'caring': 'Caring',
  'admiration': 'Inspired',
  'approval': 'Approved',
  'desire': 'Desirous',
  'neutral': 'Calm',
  'realization': 'Reflective',
  'curiosity': 'Curious',
  'surprise': 'Surprised',
  'confusion': 'Puzzled',
  'embarrassment': 'Self-Conscious',
  'disapproval': 'Dissatisfied',
  'annoyance': 'Irritated',
  'disappointment': 'Disappointed',
  'nervousness': 'Anxious',
  'anger': 'Agitated',
  'fear': 'Fearful',
  'disgust': 'Disgusted',
  'sadness': 'Reflective',
  'remorse': 'Remorseful',
  'grief': 'Mournful'
};

// ── Health Check ────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'soulify-node-auth-reports-backend'
  });
});

app.get('/', (req, res) => {
  res.json({ status: 'Soulify Node.js Auth/Reports API is running on port 5000' });
});

// ── Authentication Endpoints ──────────────────────────────────────────

app.post('/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({ status: 'error', message: 'Missing required parameters' });
  }

  try {
    if (!users) {
      return res.json({
        status: 'error',
        message: 'Database is currently unavailable. Please check your MongoDB Atlas IP Whitelist.'
      });
    }

    const existing = await getUserByEmail(email);
    if (existing && existing.verified) {
      return res.json({
        status: 'error',
        message: 'An account with this email address already exists.'
      });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));

    const success = await createOrUpdateUnverifiedUser(name, email, password, code);
    if (!success) {
      return res.json({
        status: 'error',
        message: 'Failed to initiate signup. Please try again.'
      });
    }

    // SMTP Fallback output to stdout
    console.log("\n" + "=".repeat(80));
    console.log(`📧 [DEVELOPMENT MAIL FALLBACK]`);
    console.log(`To: ${email}`);
    console.log(`Verification Code: ${code}`);
    console.log("=".repeat(80) + "\n");

    res.json({
      status: 'success',
      message: 'Verification code sent to your email.'
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.json({ status: 'error', message: 'An internal signup error occurred.' });
  }
});

app.post('/auth/verify', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.json({ status: 'error', message: 'Missing parameters' });
  }

  try {
    if (!users) {
      return res.json({
        status: 'error',
        message: 'Database is currently unavailable. Please check your MongoDB Atlas IP Whitelist.'
      });
    }

    const [success, message] = await verifyUserCodeDb(email, code);
    if (!success) {
      return res.json({ status: 'error', message: message });
    }

    res.json({
      status: 'success',
      message: 'Your email address has been successfully verified! You can now log in.'
    });
  } catch (error) {
    console.error("Verify error:", error);
    res.json({ status: 'error', message: 'Verification process failed.' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ status: 'error', message: 'Missing parameters' });
  }

  try {
    if (!users) {
      return res.json({
        status: 'error',
        message: 'Database is currently unavailable. Please check your MongoDB Atlas IP Whitelist.'
      });
    }

    const [authenticated, isVerified, userData] = await verifyUserLogin(email, password);
    if (!authenticated) {
      return res.json({
        status: 'error',
        message: 'Invalid email address or password.'
      });
    }

    if (!isVerified) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const userRecord = await getUserByEmail(email);
      await createOrUpdateUnverifiedUser(
        userRecord?.name || 'User',
        email,
        password,
        code
      );

      console.log("\n" + "=".repeat(80));
      console.log(`📧 [DEVELOPMENT MAIL FALLBACK - UNVERIFIED LOGIN]`);
      console.log(`To: ${email}`);
      console.log(`Verification Code: ${code}`);
      console.log("=".repeat(80) + "\n");

      return res.json({
        status: 'unverified',
        message: 'Your email is not verified. A new verification code has been sent.'
      });
    }

    res.json({
      status: 'success',
      message: 'Login successful.',
      user: userData
    });
  } catch (error) {
    console.error("Login error:", error);
    res.json({ status: 'error', message: 'An internal login error occurred.' });
  }
});

// ── Dynamic Reporting & Mood Insights Endpoint ────────────────────────

app.get('/report', async (req, res) => {
  const { user_id, duration } = req.query;
  const activeDuration = duration || '1w';

  if (!user_id) {
    return res.status(400).json({ status: 'error', message: 'Missing user_id parameter' });
  }

  let days = 7;
  if (activeDuration === '2w') days = 14;
  else if (activeDuration === '3w') days = 21;
  else if (activeDuration === '1m') days = 30;

  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Fetch mood logs from DB
    const logs = await moodLogs.find({
      user_id: user_id,
      timestamp: { $gte: since }
    }).sort({ timestamp: 1 }).toArray();

    if (logs.length === 0) {
      return res.json({
        label: getDurationLabel(activeDuration),
        avgMood: 6.0,
        calmIncrease: 0,
        dominant: "Calm",
        insights: "You've just begun your journey with Soulify. As you check in and share your thoughts in the chat interface, this section will analyze your emotional baseline and synthesize personalized mindfulness tips.",
        chartData: getEmptyChartData(activeDuration)
      });
    }

    // 1. Calculate Average Mood Score
    let scoreSum = 0;
    logs.forEach(log => {
      const score = EMOTION_MOOD_SCORES[log.emotion] || 6.0;
      scoreSum += score;
    });
    const avgMood = parseFloat((scoreSum / logs.length).toFixed(1));

    // 2. Calculate Dominant Emotion
    const emotionCounts = {};
    logs.forEach(log => {
      emotionCounts[log.emotion] = (emotionCounts[log.emotion] || 0) + 1;
    });

    let dominantEmotion = 'neutral';
    let maxCount = 0;
    for (const [em, count] of Object.entries(emotionCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantEmotion = em;
      }
    }
    const dominantLabel = HUMAN_EMOTION_LABELS[dominantEmotion] || 'Calm';

    // 3. Calculate Calm/Positive trend increase percentage
    let calmIncrease = 0;
    if (logs.length >= 2) {
      const mid = Math.floor(logs.length / 2);
      const firstHalf = logs.slice(0, mid);
      const secondHalf = logs.slice(mid);

      const getHalfAvg = (halfLogs) => {
        const sum = halfLogs.reduce((acc, log) => acc + (EMOTION_MOOD_SCORES[log.emotion] || 6.0), 0);
        return sum / halfLogs.length;
      };

      const firstAvg = getHalfAvg(firstHalf);
      const secondAvg = getHalfAvg(secondHalf);

      if (firstAvg > 0) {
        const pctDiff = ((secondAvg - firstAvg) / firstAvg) * 100;
        calmIncrease = Math.max(0, Math.round(pctDiff));
      }
    } else {
      calmIncrease = 8; // Small default improvement factor
    }

    // 4. Generate Chart Points for Recharts
    const chartData = compileChartPoints(logs, activeDuration);

    // 5. Query Groq for Dynamic AI Summary Analysis
    let insightsText = "";
    try {
      const recentLogsSummary = logs.slice(-12).map(l => {
        const dateStr = l.timestamp instanceof Date ? l.timestamp.toISOString().split('T')[0] : new Date(l.timestamp).toISOString().split('T')[0];
        return `${dateStr}: ${l.emotion} ("${l.message_preview || ''}")`;
      }).join('\n');

      const apiKey = process.env.GROQ_API_KEY || '';
      if (apiKey) {
        const groq = new Groq({ apiKey });
        const analysisPrompt = `
We are generating a psychological & spiritual mood analysis report for the user.
Timeframe: ${getDurationLabel(activeDuration)}.
User average mood score: ${avgMood}/10 (where 10 is absolute bliss and 1 is grief/sorrow).
Dominant emotional state: ${dominantLabel}.
Timeline logs:
${recentLogsSummary}

Write a brief, emotionally intelligent, and comforting behavioral insight report. Focus on positive trends, mindfulness observations, and spiritual progress.
Keep it strictly under 3 sentences, extremely warm and friendly. Do NOT mention clinical diagnoses, medications, or therapeutic jargon. Speak in the first person plural as a caring presence ("We observe...", "Your practice...").
`;
        const response = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: analysisPrompt }],
          temperature: 0.8,
          max_tokens: 150,
        });
        insightsText = response.choices[0].message.content.trim();
      }
    } catch (e) {
      console.error("Failed to query Groq for dynamic insights:", e);
    }

    // Fallback if Groq query failed
    if (!insightsText) {
      insightsText = `We notice a steady pattern of self-reflection over the last ${getDurationLabel(activeDuration)}. Your dominant state is ${dominantLabel}, indicating a grounded presence. Continuing your regular breathing practices will help sustain this ${avgMood}/10 baseline.`;
    }

    res.json({
      label: getDurationLabel(activeDuration),
      avgMood,
      calmIncrease,
      dominant: dominantLabel,
      insights: insightsText,
      chartData
    });

  } catch (error) {
    console.error("Failed to generate report:", error);
    res.status(500).json({ error: 'Failed to compile mood insights report.' });
  }
});

// Helper utility maps/functions for reporting
function getDurationLabel(duration) {
  if (duration === '1w') return "1 Week";
  if (duration === '2w') return "2 Weeks";
  if (duration === '3w') return "3 Weeks";
  if (duration === '1m') return "1 Month";
  return "Custom";
}

function getEmptyChartData(duration) {
  if (duration === '1w') {
    return [
      { day: "Mon", mood: 6 }, { day: "Tue", mood: 6 },
      { day: "Wed", mood: 6 }, { day: "Thu", mood: 6 },
      { day: "Fri", mood: 6 }, { day: "Sat", mood: 6 },
      { day: "Sun", mood: 6 }
    ];
  }
  if (duration === '2w') {
    return [
      { day: "W1-M", mood: 6 }, { day: "W1-W", mood: 6 },
      { day: "W1-F", mood: 6 }, { day: "W1-S", mood: 6 },
      { day: "W2-M", mood: 6 }, { day: "W2-W", mood: 6 },
      { day: "W2-F", mood: 6 }, { day: "W2-S", mood: 6 }
    ];
  }
  if (duration === '3w') {
    return [
      { day: "W1", mood: 6 }, { day: "W1.5", mood: 6 },
      { day: "W2", mood: 6 }, { day: "W2.5", mood: 6 },
      { day: "W3", mood: 6 }, { day: "W3.5", mood: 6 }
    ];
  }
  return [
    { day: "Week 1", mood: 6 },
    { day: "Week 2", mood: 6 },
    { day: "Week 3", mood: 6 },
    { day: "Week 4", mood: 6 }
  ];
}

function compileChartPoints(logs, duration) {
  const result = [];
  const now = Date.now();

  if (duration === '1w') {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(now - i * 24 * 60 * 60 * 1000);
      const label = weekdays[targetDate.getDay()];

      const dayLogs = logs.filter(l => {
        const d = new Date(l.timestamp);
        return d.getFullYear() === targetDate.getFullYear() &&
          d.getMonth() === targetDate.getMonth() &&
          d.getDate() === targetDate.getDate();
      });

      let moodVal = 6.0;
      if (dayLogs.length > 0) {
        const sum = dayLogs.reduce((acc, log) => acc + (EMOTION_MOOD_SCORES[log.emotion] || 6.0), 0);
        moodVal = parseFloat((sum / dayLogs.length).toFixed(1));
      } else {
        moodVal = result.length > 0 ? result[result.length - 1].mood : 6.0;
      }
      result.push({ day: label, mood: moodVal });
    }
    return result;
  }

  if (duration === '2w') {
    const labels = ["W1-M", "W1-W", "W1-F", "W1-S", "W2-M", "W2-W", "W2-F", "W2-S"];
    const binMs = (14 * 24 * 60 * 60 * 1000) / 8;
    const startMs = now - 14 * 24 * 60 * 60 * 1000;

    for (let i = 0; i < 8; i++) {
      const binStart = startMs + i * binMs;
      const binEnd = binStart + binMs;

      const binLogs = logs.filter(l => {
        const t = new Date(l.timestamp).getTime();
        return t >= binStart && t < binEnd;
      });

      let moodVal = 6.0;
      if (binLogs.length > 0) {
        const sum = binLogs.reduce((acc, log) => acc + (EMOTION_MOOD_SCORES[log.emotion] || 6.0), 0);
        moodVal = parseFloat((sum / binLogs.length).toFixed(1));
      } else {
        moodVal = result.length > 0 ? result[result.length - 1].mood : 6.0;
      }
      result.push({ day: labels[i], mood: moodVal });
    }
    return result;
  }

  if (duration === '3w') {
    const labels = ["W1", "W1.5", "W2", "W2.5", "W3", "W3.5"];
    const binMs = (21 * 24 * 60 * 60 * 1000) / 6;
    const startMs = now - 21 * 24 * 60 * 60 * 1000;

    for (let i = 0; i < 6; i++) {
      const binStart = startMs + i * binMs;
      const binEnd = binStart + binMs;

      const binLogs = logs.filter(l => {
        const t = new Date(l.timestamp).getTime();
        return t >= binStart && t < binEnd;
      });

      let moodVal = 6.0;
      if (binLogs.length > 0) {
        const sum = binLogs.reduce((acc, log) => acc + (EMOTION_MOOD_SCORES[log.emotion] || 6.0), 0);
        moodVal = parseFloat((sum / binLogs.length).toFixed(1));
      } else {
        moodVal = result.length > 0 ? result[result.length - 1].mood : 6.0;
      }
      result.push({ day: labels[i], mood: moodVal });
    }
    return result;
  }

  // 1m -> 4 intervals
  const labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
  const binMs = (30 * 24 * 60 * 60 * 1000) / 4;
  const startMs = now - 30 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < 4; i++) {
    const binStart = startMs + i * binMs;
    const binEnd = binStart + binMs;

    const binLogs = logs.filter(l => {
      const t = new Date(l.timestamp).getTime();
      return t >= binStart && t < binEnd;
    });

    let moodVal = 6.0;
    if (binLogs.length > 0) {
      const sum = binLogs.reduce((acc, log) => acc + (EMOTION_MOOD_SCORES[log.emotion] || 6.0), 0);
      moodVal = parseFloat((sum / binLogs.length).toFixed(1));
    } else {
      moodVal = result.length > 0 ? result[result.length - 1].mood : 6.0;
    }
    result.push({ day: labels[i], mood: moodVal });
  }
  return result;
}

// ── Database Connection and Initialization ───────────────────────────

async function startServer() {
  try {
    await connectDb();

    app.listen(PORT, () => {
      console.log(`======================================================================`);
      console.log(`🚀 SOULIFY AUTH/REPORTS NODE BACKEND RUNNING ON PORT ${PORT}`);
      console.log(`======================================================================`);
    });
  } catch (error) {
    console.error("Server startup database connection failed:");
    console.error(">>> IT LOOKS LIKE YOUR IP ADDRESS IS NOT WHITELISTED IN MONGODB ATLAS. <<<");
    console.error(">>> Please go to MongoDB Atlas -> Network Access and add your current IP address. <<<");
    // We will still start the server so the frontend doesn't get a 'connection refused' error,
    // but database operations will fail until the IP is whitelisted.
    app.listen(PORT, () => {
      console.log(`======================================================================`);
      console.log(`⚠️ SOULIFY AUTH/REPORTS NODE BACKEND RUNNING ON PORT ${PORT} (WITHOUT DB)`);
      console.log(`======================================================================`);
    });
  }
}

startServer();
