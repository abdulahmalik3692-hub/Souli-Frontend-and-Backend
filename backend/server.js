import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import compression from 'compression';
import { pipeline } from '@xenova/transformers';
import {
  connectDb,
  createOrUpdateUnverifiedUser,
  verifyUserCodeDb,
  verifyUserLogin,
  getUserByEmail,
  moodLogs,
  users,
  saveChatSession,
  getChatSessionList,
  getChatSessionById,
  migrateChatSessions,
  savePasswordResetCodeDb,
  resetPasswordWithCodeDb
} from './db.js';
import { 
  EMOTION_MOOD_SCORES,
  NEGATIVE_EMOTIONS,
  FAST_BOOST_EMOTIONS,
  SLOW_BOOST_EMOTIONS,
  SLOW_TYPING_SUSPICION_THRESHOLD,
  SLOW_TYPING_CONFIDENCE_PENALTY,
  FAST_TYPING_OVERRIDE_EMOTIONS,
  FAST_TYPING_OVERRIDE_CONFIDENCE,
  NEGATIVE_OVERRIDE_THRESHOLD,
  SMOOTHING_BOOST,
  KEYWORD_BOOST,
  CONTEXT_WEIGHT,
  EMOTION_THEMES
} from './constants.js';
import { sendVerificationEmail, sendResetPasswordEmail } from './utils/mailer.js';

dotenv.config();

const app = express();

app.use(compression());


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

const reportCache = new Map();

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

    // Send real verification email
    const emailSent = await sendVerificationEmail(email, code);
    if (!emailSent) {
      return res.json({
        status: 'error',
        message: 'Could not send verification email. Please check your credentials or try again later.'
      });
    }

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

      // Send real verification email
      const emailSent = await sendVerificationEmail(email, code);
      if (!emailSent) {
        return res.json({
          status: 'error',
          message: 'Could not send verification email. Please check your credentials or try again later.'
        });
      }

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

app.post('/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ status: 'error', message: 'Missing email address.' });
  }

  try {
    if (!users) {
      return res.json({
        status: 'error',
        message: 'Database is currently unavailable.'
      });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const [success, message] = await savePasswordResetCodeDb(email, code);
    if (!success) {
      return res.json({ status: 'error', message: message });
    }

    // Send real reset email
    const emailSent = await sendResetPasswordEmail(email, code);
    if (!emailSent) {
      return res.json({
        status: 'error',
        message: 'Could not send reset code. Please try again later.'
      });
    }

    res.json({
      status: 'success',
      message: 'A 6-digit password reset code has been sent to your email.'
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.json({ status: 'error', message: 'An internal forgot password error occurred.' });
  }
});

app.post('/auth/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.json({ status: 'error', message: 'Missing required parameters.' });
  }

  try {
    if (!users) {
      return res.json({
        status: 'error',
        message: 'Database is currently unavailable.'
      });
    }

    const [success, message] = await resetPasswordWithCodeDb(email, code, newPassword);
    if (!success) {
      return res.json({ status: 'error', message: message });
    }

    res.json({
      status: 'success',
      message: 'Your password has been successfully reset! You can now sign in.'
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.json({ status: 'error', message: 'An internal reset password error occurred.' });
  }
});


// ── Chat Session Endpoints ──────────────────────────────────────

// Move guest / legacy sessions onto the authenticated user's MongoDB id
app.post('/chat/migrate', async (req, res) => {
  const { from_user_id, to_user_id } = req.body;
  if (!from_user_id || !to_user_id) {
    return res.status(400).json({ status: 'error', message: 'Missing from_user_id or to_user_id' });
  }
  try {
    const count = await migrateChatSessions(from_user_id, to_user_id);
    res.json({ status: 'success', migrated: count });
  } catch (err) {
    console.error("Error in /chat/migrate:", err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Save / update a chat session (called after each AI reply)
app.post('/chat/save', async (req, res) => {
  const { user_id, session_id, messages } = req.body;
  if (!user_id || !session_id || !Array.isArray(messages)) {
    return res.status(400).json({ status: 'error', message: 'Missing user_id, session_id, or messages' });
  }
  try {
    const ok = await saveChatSession(user_id, session_id, messages);
    if (!ok) return res.json({ status: 'error', message: 'Failed to save session' });
    res.json({ status: 'success' });
  } catch (err) {
    console.error("Error in /chat/save:", err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

app.post('/api/log-mood', async (req, res) => {
  const { user_id, emotion, message_preview } = req.body;
  if (!user_id || !emotion) {
    return res.status(400).json({ status: 'error', message: 'Missing user_id or emotion' });
  }
  try {
    if (moodLogs) {
      await moodLogs.insertOne({
        user_id,
        timestamp: new Date(),
        emotion,
        message_preview: message_preview || ""
      });
    }
    res.json({ status: 'success' });
  } catch (err) {
    console.error("Error saving mood log:", err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Get sidebar list of recent sessions (no full messages)
app.get('/chat/history', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ status: 'error', message: 'Missing user_id' });
  }
  try {
    const sessions = await getChatSessionList(user_id);
    res.json({ status: 'success', sessions });
  } catch (err) {
    console.error("Error in /chat/history:", err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Load a single full session by session_id
app.get('/chat/session', async (req, res) => {
  const { user_id, session_id } = req.query;
  if (!user_id || !session_id) {
    return res.status(400).json({ status: 'error', message: 'Missing user_id or session_id' });
  }
  try {
    const session = await getChatSessionById(user_id, session_id);
    if (!session) return res.json({ status: 'error', message: 'Session not found' });
    res.json({ status: 'success', session });
  } catch (err) {
    console.error("Error in /chat/session:", err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// ── Dynamic Reporting & Mood Insights Endpoint ──────────────────────────

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
    if (!moodLogs) {
      return res.json({
        label: getDurationLabel(activeDuration),
        avgMood: 6.0,
        calmIncrease: 0,
        dominant: "Calm",
        insights: "Database connection is currently unavailable. Analytics cannot be generated at this time. Please check your MongoDB Atlas IP Whitelist.",
        chartData: getEmptyChartData(activeDuration)
      });
    }

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
    let suggestionsArray = [];
    try {
      const recentLogsSummary = logs.slice(-12).map(l => {
        const dateStr = l.timestamp instanceof Date ? l.timestamp.toISOString().split('T')[0] : new Date(l.timestamp).toISOString().split('T')[0];
        return `${dateStr}: ${l.emotion} ("${l.message_preview || ''}")`;
      }).join('\n');

      const cacheKey = `${user_id}_${activeDuration}_${recentLogsSummary}`;
      const cached = reportCache.get(cacheKey);

      if (cached) {
        insightsText = cached.insights;
        suggestionsArray = cached.suggestions;
      } else {
        const apiKey = process.env.GROQ_API_KEY || '';
        if (apiKey) {
          const groq = new Groq({ apiKey });
          const analysisPrompt = `
We are generating a psychological & spiritual mood analysis report for the user.
Timeframe: ${getDurationLabel(activeDuration)}.
User average mood score: ${avgMood}/10.
Dominant emotional state: ${dominantLabel}.
Timeline logs:
${recentLogsSummary}

You must respond with a raw JSON object EXACTLY matching this structure (no markdown, no backticks, just raw JSON):
{
  "insights": "Write a brief, comforting behavioral insight report focusing on positive trends and mindfulness. Keep it under 3 sentences, extremely warm. Do NOT use line breaks inside the string. Speak in the first person plural as a caring presence.",
  "suggestions": [
    "First actionable and personalized suggestion based on the user's recent emotions.",
    "Second actionable suggestion.",
    "Third actionable suggestion."
  ]
}
`;
          const response = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: analysisPrompt }],
            temperature: 0.8,
            max_tokens: 500,
          });
          
          let rawContent = response.choices[0].message.content.trim();
          // Remove markdown formatting if Llama includes it
          if (rawContent.startsWith('\`\`\`json')) {
              rawContent = rawContent.replace(/^\`\`\`json/m, '').replace(/\`\`\`$/m, '').trim();
          } else if (rawContent.startsWith('\`\`\`')) {
              rawContent = rawContent.replace(/^\`\`\`/m, '').replace(/\`\`\`$/m, '').trim();
          }
          
          const parsed = JSON.parse(rawContent);
          if (parsed.insights) insightsText = parsed.insights.replace(/\n+/g, ' ');
          if (parsed.suggestions && Array.isArray(parsed.suggestions)) suggestionsArray = parsed.suggestions;

          if (insightsText) {
            reportCache.set(cacheKey, {
              insights: insightsText,
              suggestions: suggestionsArray
            });
          }
        }
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
      suggestions: suggestionsArray,
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
      { day: "Mon", mood: null }, { day: "Tue", mood: null },
      { day: "Wed", mood: null }, { day: "Thu", mood: null },
      { day: "Fri", mood: null }, { day: "Sat", mood: null },
      { day: "Sun", mood: null }
    ];
  }
  if (duration === '2w') {
    return [
      { day: "W1-M", mood: null }, { day: "W1-W", mood: null },
      { day: "W1-F", mood: null }, { day: "W1-S", mood: null },
      { day: "W2-M", mood: null }, { day: "W2-W", mood: null },
      { day: "W2-F", mood: null }, { day: "W2-S", mood: null }
    ];
  }
  if (duration === '3w') {
    return [
      { day: "W1", mood: null }, { day: "W1.5", mood: null },
      { day: "W2", mood: null }, { day: "W2.5", mood: null },
      { day: "W3", mood: null }, { day: "W3.5", mood: null }
    ];
  }
  return [
    { day: "Week 1", mood: null },
    { day: "Week 2", mood: null },
    { day: "Week 3", mood: null },
    { day: "Week 4", mood: null }
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

      let moodVal = null;
      if (dayLogs.length > 0) {
        const sum = dayLogs.reduce((acc, log) => acc + (EMOTION_MOOD_SCORES[log.emotion] || 6.0), 0);
        moodVal = parseFloat((sum / dayLogs.length).toFixed(1));
      }
      result.push({ day: label, mood: moodVal });
    }
  } else if (duration === '2w') {
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

      let moodVal = null;
      if (binLogs.length > 0) {
        const sum = binLogs.reduce((acc, log) => acc + (EMOTION_MOOD_SCORES[log.emotion] || 6.0), 0);
        moodVal = parseFloat((sum / binLogs.length).toFixed(1));
      }
      result.push({ day: labels[i], mood: moodVal });
    }
  } else if (duration === '3w') {
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

      let moodVal = null;
      if (binLogs.length > 0) {
        const sum = binLogs.reduce((acc, log) => acc + (EMOTION_MOOD_SCORES[log.emotion] || 6.0), 0);
        moodVal = parseFloat((sum / binLogs.length).toFixed(1));
      }
      result.push({ day: labels[i], mood: moodVal });
    }
  } else {
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

      let moodVal = null;
      if (binLogs.length > 0) {
        const sum = binLogs.reduce((acc, log) => acc + (EMOTION_MOOD_SCORES[log.emotion] || 6.0), 0);
        moodVal = parseFloat((sum / binLogs.length).toFixed(1));
      }
      result.push({ day: labels[i], mood: moodVal });
    }
  }

  // Forward-fill nulls so Recharts always draws a structured, continuous line
  let lastVal = 6.0;
  for (let i = 0; i < result.length; i++) {
    if (result[i].mood !== null) {
      lastVal = result[i].mood;
    } else {
      result[i].mood = lastVal;
    }
  }

  return result;
}

// ── AI Chat Integration (Ported from Python Backend) ─────────────────

const emotionHistory = new Map();

// Periodically clean up emotion history cache to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [sid, data] of emotionHistory.entries()) {
    if (now - data.lastSeen > 60 * 60 * 1000) {
      emotionHistory.delete(sid);
    }
  }
}, 5 * 60 * 1000);

const SARCASM_PATTERNS = [
  { pattern: /\boh\s+(great|wonderful|fantastic|perfect|lovely|nice)\b/i, emotion: 'annoyance' },
  { pattern: /\bjust\s+what\s+i\s+(needed|wanted)\b/i, emotion: 'annoyance' },
  { pattern: /\byeah[,\s]*\s*(right|sure|okay|ok|fine)\b/i, emotion: 'annoyance' },
  { pattern: /\bwonderful[,\s]*\s*(another|more|again|now)\b/i, emotion: 'annoyance' },
  { pattern: /\b(total|totally|completely|absolutely)\s+fine\b/i, emotion: 'sadness' },
  { pattern: /\bi\s+(am|m)\s+fine[.,\s]*\s*(really|trust me|don't worry|it's nothing|forget it)\b/i, emotion: 'sadness' },
  { pattern: /\bfine[.,\s]*\s*everything\s+(is\s+)?fine\b/i, emotion: 'sadness' },
  { pattern: /\bnot\s+(exactly|really|quite)\s+(happy|thrilled|excited|pleased|overjoyed)\b/i, emotion: 'disappointment' },
  { pattern: /\bso\s+(happy|glad|excited)\s+(about|for)\s+this[.,\s]*\s*(not|never|hate|ugh)\b/i, emotion: 'annoyance' }
];

function detectSarcasm(text) {
  const textLower = text.toLowerCase();
  for (const { pattern, emotion } of SARCASM_PATTERNS) {
    if (pattern.test(textLower)) {
      return { emotion, confidence: 0.75 };
    }
  }
  return null;
}

const CONTRACTIONS = {
  "i'm": "i am", "don't": "do not", "can't": "cannot",
  "won't": "will not", "isn't": "is not", "aren't": "are not",
  "wasn't": "was not", "weren't": "were not", "hasn't": "has not",
  "haven't": "have not", "hadn't": "had not", "doesn't": "does not",
  "didn't": "did not", "couldn't": "could not", "shouldn't": "should not",
  "wouldn't": "would not", "i've": "i have", "you've": "you have",
  "we've": "we have", "they've": "they have", "i'll": "i will",
  "you'll": "you will", "we'll": "we will", "they'll": "they will",
  "i'd": "i would", "you'd": "you would", "he'd": "he would",
  "she'd": "she would", "we'd": "we would", "they'd": "they would",
  "it's": "it is", "that's": "that is", "what's": "what is",
  "who's": "who is", "where's": "where is", "how's": "how is",
  "let's": "let us", "there's": "there is", "here's": "here is"
};

const SLANG_MAP = {
  "im": "i am", "ive": "i have", "id": "i would",
  "cant": "cannot", "dont": "do not", "wont": "will not",
  "didnt": "did not", "doesnt": "does not", "isnt": "is not",
  "wasnt": "was not", "havent": "have not", "hasnt": "has not",
  "couldnt": "could not", "shouldnt": "should not",
  "wouldnt": "would not",
  "rn": "right now", "ngl": "not going to lie",
  "tbh": "to be honest", "imo": "in my opinion",
  "idk": "i do not know", "smh": "shaking my head",
  "omg": "oh my god", "nvm": "never mind",
  "pls": "please", "plz": "please", "thx": "thanks",
  "ty": "thank you", "bf": "boyfriend", "gf": "girlfriend",
  "gonna": "going to", "wanna": "want to", "gotta": "got to",
  "kinda": "kind of", "sorta": "sort of", "prolly": "probably",
  "cuz": "because", "bcuz": "because", "coz": "because",
  "ur": "your", "u": "you", "r": "are",
  "luv": "love", "gud": "good", "bt": "but",
  "hw": "how", "abt": "about", "tho": "though",
  "w/": "with", "w/o": "without"
};

const EMOJI_MAP = {
  '😢': ' sad ', '😭': ' very sad crying ', '😞': ' disappointed ',
  '😔': ' sad down ', '🥺': ' sad pleading ', '😿': ' sad ',
  '😡': ' angry ', '🤬': ' very angry ', '😠': ' angry ',
  '💢': ' angry ', '👿': ' angry ',
  '😨': ' scared afraid ', '😰': ' anxious worried ', '😱': ' terrified ',
  '😳': ' embarrassed ', '😳': ' embarrassed shocked ',
  '😊': ' happy ', '😄': ' happy joyful ', '🥰': ' love happy ',
  '😍': ' love adore ', '❤️': ' love ', '💕': ' love ',
  '🥳': ' excited celebrating ', '🎉': ' excited joy ',
  '😎': ' confident proud ', '💪': ' strong proud ',
  '🤔': ' thinking curious ', '😐': ' neutral ',
  '😤': ' frustrated annoyed ', '🙄': ' annoyed ',
  '😮': ' surprised ', '😲': ' surprised shocked ',
  '🤗': ' caring warm ', '🙏': ' grateful thankful ',
  '😌': ' relieved calm ', '🤮': ' disgusted ',
  '💔': ' heartbroken sad grief '
};

function preprocessText(text) {
  let processed = text;
  for (const [emoji, replacement] of Object.entries(EMOJI_MAP)) {
    processed = processed.replaceAll(emoji, replacement);
  }
  processed = processed.toLowerCase().trim();
  for (const [contraction, expansion] of Object.entries(CONTRACTIONS)) {
    processed = processed.replaceAll(contraction, expansion);
  }
  const words = processed.split(/\s+/);
  const mappedWords = words.map(w => SLANG_MAP[w] || w);
  processed = mappedWords.join(' ');
  processed = processed.replace(/[^\x00-\x7F]/g, ""); // ASCII only
  processed = processed.replace(/\s+/g, ' ').trim();
  return processed;
}

const EMOTION_KEYWORDS = {
  'sadness':        ['sad', 'unhappy', 'depressed', 'down', 'blue', 'miserable',
                       'heartbroken', 'cry', 'crying', 'tears', 'lonely', 'alone',
                       'empty', 'hopeless', 'devastated', 'broken', 'hurting',
                       'fine', 'okay', 'ok', 'alright', 'nothing', 'whatever', 'numb'],
  'grief':          ['grief', 'mourning', 'loss', 'bereaved', 'grieving',
                       'passed away', 'died', 'death', 'funeral', 'gone forever'],
  'remorse':        ['sorry', 'regret', 'guilty', 'guilt', 'ashamed',
                       'remorseful', 'apologize', 'mistake', 'fault'],
  'fear':           ['scared', 'afraid', 'terrified', 'frightened', 'panic',
                       'dread', 'petrified', 'horrified', 'fearful', 'phobia'],
  'nervousness':    ['nervous', 'anxious', 'worried', 'uneasy', 'tense',
                       'jittery', 'restless', 'stressed', 'overwhelmed',
                       'panicking', 'overthinking', 'anxiety', 'exam', 'interview'],
  'anger':          ['angry', 'furious', 'mad', 'rage', 'pissed', 'livid',
                       'outraged', 'infuriated', 'hostile', 'enraged', 'irate', 'hate',
                       'betrayed', 'betrayal', 'backstabbed', 'cheated', 'used',
                       'manipulated', 'lied to', 'deceived', 'stabbed in the back'],
  'annoyance':      ['annoyed', 'irritated', 'bugged', 'bothered', 'nagging',
                       'pestering', 'tiresome', 'ugh', 'argh', 'sarcastic', 'sarcasm'],
  'disgust':        ['disgusted', 'gross', 'revolting', 'sickening',
                       'nauseating', 'repulsive', 'vile', 'nasty', 'eww', 'disgusting'],
  'disappointment': ['disappointed', 'letdown', 'let down', 'failed',
                       'failure', 'unfair', 'unsatisfied', 'expected more'],
  'confusion':      ['confused', 'lost', 'uncertain', 'unsure', 'puzzled',
                       'bewildered', 'perplexed', 'disoriented', 'no idea'],
  'disapproval':    ['wrong', 'disapprove', 'disagree', 'unacceptable',
                       'inappropriate', 'bad idea', 'terrible'],
  'embarrassment':  ['embarrassed', 'humiliated', 'ashamed', 'mortified',
                       'awkward', 'cringe', 'uncomfortable'],
  'joy':            ['happy', 'joyful', 'wonderful', 'amazing', 'fantastic',
                       'great', 'blessed', 'delighted', 'cheerful', 'ecstatic',
                       'elated', 'blissful', 'overjoyed'],
  'excitement':     ['excited', 'pumped', 'thrilled', 'hyped', 'stoked',
                       'eager', 'cannot wait', 'can not wait', 'psyched'],
  'love':           ['love', 'adore', 'cherish', 'affection', 'romantic',
                       'crush', 'soulmate', 'passionate', 'devoted', 'sweetheart'],
  'amusement':      ['funny', 'hilarious', 'laughing', 'amusing', 'humorous',
                       'comedy', 'joke', 'lmao', 'haha', 'lol'],
  'desire':         ['want', 'wish', 'desire', 'crave', 'yearn', 'longing',
                       'miss', 'missing'],
  'admiration':     ['admire', 'respect', 'inspired', 'impressed', 'incredible',
                       'look up to', 'role model'],
  'caring':         ['care', 'caring', 'concerned', 'worry about',
                       'compassion', 'empathy', 'hope you'],
  'approval':       ['agree', 'approve', 'support', 'endorse', 'good job',
                       'well done', 'nice work', 'exactly'],
  'gratitude':      ['grateful', 'thankful', 'appreciate', 'thanks',
                       'thank you', 'blessed'],
  'optimism':       ['hopeful', 'optimistic', 'positive', 'bright',
                       'promising', 'looking forward', 'better days'],
  'pride':          ['proud', 'accomplished', 'achieved', 'success',
                       'triumphant', 'nailed it', 'killed it'],
  'curiosity':      ['curious', 'wondering', 'interested', 'intrigued',
                       'fascinated', 'how does', 'what if'],
  'realization':    ['realized', 'understand', 'figured out', 'discovered',
                       'noticed', 'epiphany', 'now i see', 'makes sense'],
  'surprise':       ['surprised', 'shocked', 'astonished', 'amazed',
                       'stunned', 'unexpected', 'wow', 'unbelievable', 'no way']
};

function computeKeywordBoosts(text) {
  const textLower = text.toLowerCase();
  const wordsSet = new Set(textLower.split(/\s+/));
  const boosts = {};
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    let matchCount = 0;
    for (const kw of keywords) {
      if (kw.includes(' ')) {
        if (textLower.includes(kw)) {
          matchCount++;
        }
      } else {
        if (wordsSet.has(kw)) {
          matchCount++;
        }
      }
    }
    if (matchCount > 0) {
      const multiplier = emotion === 'disgust' ? 2.0 : 1.0;
      const boost = KEYWORD_BOOST * multiplier * (1.0 - Math.pow(0.5, matchCount));
      boosts[emotion] = parseFloat(boost.toFixed(4));
    }
  }
  return boosts;
}

function recalibrateConfidence(rawScore) {
  if (rawScore >= 0.80) {
    return Math.min(0.95 + (rawScore - 0.80) * 0.20, 0.99);
  } else if (rawScore >= 0.50) {
    return 0.78 + (rawScore - 0.50) * (0.17 / 0.30);
  } else if (rawScore >= 0.30) {
    return 0.60 + (rawScore - 0.30) * (0.18 / 0.20);
  } else if (rawScore >= 0.15) {
    return 0.45 + (rawScore - 0.15) * (0.15 / 0.15);
  } else {
    return Math.max(rawScore * 3.0, 0.10);
  }
}

function applyTypingModifier(emotion, confidence, typingSpeed) {
  if (typingSpeed < SLOW_TYPING_SUSPICION_THRESHOLD &&
      ['joy', 'approval', 'admiration', 'optimism', 'gratitude'].includes(emotion)) {
    confidence = Math.max(confidence - SLOW_TYPING_CONFIDENCE_PENALTY, 0.45);
    return parseFloat(confidence.toFixed(3));
  }

  if (typingSpeed > 8 && FAST_TYPING_OVERRIDE_EMOTIONS.has(emotion)) {
    return parseFloat(FAST_TYPING_OVERRIDE_CONFIDENCE.toFixed(3));
  }

  let boost = 0.0;
  if (typingSpeed > 7 && FAST_BOOST_EMOTIONS.has(emotion)) {
    boost = 0.08;
  } else if (typingSpeed < 3 && SLOW_BOOST_EMOTIONS.has(emotion)) {
    boost = 0.08;
  }

  return parseFloat(Math.min(confidence + boost, 0.99).toFixed(3));
}

let classifierPipeline = null;
async function getClassifierPipeline() {
  if (!classifierPipeline) {
    classifierPipeline = await pipeline('text-classification', 'MicahB/roberta-base-go_emotions');
  }
  return classifierPipeline;
}

async function detectEmotion(newMessage, sessionId, typingSpeed = 5.0) {
  const now = Date.now();
  if (!emotionHistory.has(sessionId)) {
    emotionHistory.set(sessionId, { data: [], lastSeen: now });
  }
  const historyObj = emotionHistory.get(sessionId);
  historyObj.lastSeen = now;
  const history = historyObj.data;

  // 1. Sarcasm detection
  const sarcasm = detectSarcasm(newMessage);
  if (sarcasm) {
    const sarcasmEmotion = sarcasm.emotion;
    let confidence = sarcasm.confidence;
    const cleaned = preprocessText(newMessage);
    
    try {
      const classifier = await getClassifierPipeline();
      const allScores = await classifier(cleaned.slice(0, 512), { topk: null });
      const matching = allScores.find(s => s.label === sarcasmEmotion);
      if (matching) {
        confidence = Math.max(matching.score + 0.20, confidence);
      }
    } catch (e) {
      console.error("Classifier error in sarcasm detection:", e);
    }

    confidence = recalibrateConfidence(Math.min(confidence, 1.0));

    if (history.length > 0) {
      if (history[history.length - 1].emotion === sarcasmEmotion) {
        confidence = confidence * SMOOTHING_BOOST;
      }
      if (history.length >= 2) {
        const recent = history.slice(-3).map(h => h.emotion);
        if (recent.filter(e => e === sarcasmEmotion).length >= 2) {
          confidence += CONTEXT_WEIGHT;
        }
      }
    }

    confidence = recalibrateConfidence(Math.min(confidence, 1.0));
    const roundedConf = parseFloat(confidence.toFixed(3));
    history.push({ emotion: sarcasmEmotion, confidence: roundedConf });
    if (history.length > 5) history.shift();

    return { emotion: sarcasmEmotion, confidence: roundedConf };
  }

  // 2. Regular classification
  const cleaned = preprocessText(newMessage);
  const classifier = await getClassifierPipeline();
  const allScores = await classifier(cleaned.slice(0, 512), { topk: null });
  const keywordBoosts = computeKeywordBoosts(cleaned);

  // Strong disgust override for explicit words
  const explicitDisgust = ['revolting', 'repulsive', 'vile', 'nauseating', 'sickening', 'disgusting'];
  if (explicitDisgust.some(w => cleaned.includes(w))) {
    const disgustItem = allScores.find(s => s.label === 'disgust');
    if (disgustItem) {
      disgustItem.score = Math.max(disgustItem.score, 0.60);
    }
  }

  if (keywordBoosts) {
    for (const item of allScores) {
      if (keywordBoosts[item.label] !== undefined) {
        item.score += keywordBoosts[item.label];
      }
    }
  }

  allScores.sort((a, b) => b.score - a.score);
  let top = allScores[0];
  let emotion = top.label;
  let confidence = top.score;

  if (!NEGATIVE_EMOTIONS.has(emotion)) {
    for (let i = 1; i < allScores.length; i++) {
      const item = allScores[i];
      if (NEGATIVE_EMOTIONS.has(item.label) && item.score >= NEGATIVE_OVERRIDE_THRESHOLD) {
        emotion = item.label;
        confidence = item.score;
        break;
      }
    }
  }

  if (history.length > 0) {
    if (history[history.length - 1].emotion === emotion) {
      confidence = confidence * SMOOTHING_BOOST;
    }
    if (history.length >= 2) {
      const recent = history.slice(-3).map(h => h.emotion);
      if (recent.filter(e => e === emotion).length >= 2) {
        confidence += CONTEXT_WEIGHT;
      }
    }
  }

  confidence = recalibrateConfidence(Math.min(confidence, 1.0));
  confidence = applyTypingModifier(emotion, confidence, typingSpeed);

  const roundedConf = parseFloat(confidence.toFixed(3));
  history.push({ emotion, confidence: roundedConf });
  if (history.length > 5) history.shift();

  return { emotion, confidence: roundedConf };
}

function getTimeContext() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "The person is starting their day. Be energetic and hopeful.";
  } else if (hour >= 12 && hour < 17) {
    return "The person is in the middle of their day. Ground them.";
  } else if (hour >= 17 && hour < 21) {
    return "The person is winding down. Help them reflect peacefully.";
  } else {
    return "Be extra gentle and warm. Bring calm and safety.";
  }
}

function detectEmotionalShift(history) {
  const emotions = history
    .filter(m => m.role === 'user' && m.emotion)
    .map(m => m.emotion);

  if (emotions.length < 2) {
    return "";
  }

  const negative = new Set([
    'sadness', 'anger', 'fear', 'grief', 'disappointment',
    'remorse', 'nervousness', 'annoyance', 'disgust',
    'confusion', 'embarrassment', 'disapproval'
  ]);
  const positive = new Set([
    'joy', 'excitement', 'gratitude', 'optimism', 'relief',
    'pride', 'love', 'admiration', 'amusement', 'approval', 'caring'
  ]);

  const first = emotions[0];
  const last = emotions[emotions.length - 1];

  if (negative.has(first) && positive.has(last)) {
    return "The person has shifted to a more positive feeling. Acknowledge this gently.";
  } else if (positive.has(first) && negative.has(last)) {
    return "The person's mood has dropped. Be gentler than usual.";
  } else if (negative.has(first) && negative.has(last)) {
    return "The person has been struggling throughout. Be extra warm and present.";
  }
  return "";
}

const CRISIS_SIGNALS = [
  "want to die", "end my life", "kill myself",
  "nobody would miss me", "disappear forever",
  "no reason to live", "cannot go on", "give up on life",
  "don't want to be here", "wish i was dead", "better off dead",
  "want to hurt myself", "want to end it", "tired of living",
  "no point in living", "nothing to live for",
  "nothing matters now", "leave the world behind",
  "leave this world", "end everything", "no way out",
  "everyone would be better without me"
];

function isCrisisMessage(message) {
  const msgLower = message.toLowerCase();
  return CRISIS_SIGNALS.some(signal => msgLower.includes(signal));
}

const CRISIS_PROMPT_ADDITION = `
This person may be in a dark place right now. 
Do not give spiritual wisdom. Do not give advice. Do not jump to solutions.
1. Name what you are hearing — plainly and warmly.
2. Tell them you are not going anywhere.
3. Gently mention they can call Umang Pakistan: 0317-4288665
4. Ask one simple question about right now.
Warm. Direct. No drama. No lecture.
`;

const SPIRITUAL_DIRECTION = {
  "sadness": "Feel it with them first. Do not jump to shukr or silver linings. Just make them feel heard. Then gently remind them this test will pass.",
  "disappointment": "Honor the hope they had first. Sit with them in it. Do not immediately push shukr or positivity. Let them feel heard before anything else.",
  "fear": "Ground them. They have survived every hard day so far. Allah never burdens more than we can carry.",
  "nervousness": "Calm them. This feeling always passes. Their record of getting through is perfect.",
  "anger": "Acknowledge the hurt underneath. Remind them the strongest person controls themselves in the hardest moment.",
  "annoyance": "Validate it. Patience is one of the most powerful choices a person can make.",
  "disgust": "Hear them. Their reaction means their values are working.",
  "confusion": "Reassure them. Not knowing is okay. Clarity comes to those who trust the process.",
  "embarrassment": "Make them safe. Every great soul has had moments like this.",
  "remorse": "Be kind. Feeling this means they have a good heart. Every day is a fresh start.",
  "disapproval": "Hear them. Standing up for what feels right is real courage.",
  "realization": "Meet them here. Moments of clarity are rare gifts.",
  "joy": "Celebrate fully with them. Remind them this is the fruit of their efforts. Never forget Allah in happiness. Do shukr.",
  "excitement": "Match their energy. Celebrate. Remind them Allah rewards those who work hard.",
  "love": "Honor it. Love connects us to something far greater.",
  "gratitude": "Go deeper. A heart counting blessings always finds more. This is the best state to be in.",
  "optimism": "Celebrate their hope. Hope is trust that Allah is working for us even when we cannot see it.",
  "pride": "Celebrate them genuinely. Remind them to thank Allah. Real achievement always has His help behind it.",
  "admiration": "Honor this. Seeing goodness in others means it lives in us too.",
  "amusement": "Laugh with them. A heart finding joy in small things is truly rich.",
  "approval": "Share their positivity. Good energy given freely always returns.",
  "caring": "Honor their heart. A person who gives care freely is one of the most precious souls.",
  "desire": "Acknowledge what they want. Deepest longings reveal what the soul searches for.",
  "relief": "Breathe with them. This weight lifting is itself a blessing from Allah.",
  "surprise": "Be curious. Unexpected moments carry the biggest lessons.",
  "neutral": "Check in gently. Ask how they are really feeling underneath.",
  "curiosity": "Celebrate their seeking mind. A soul that keeps asking never stops growing.",
};

const STORIES_POOL = `
Real stories. Use ONLY when they genuinely mirror what this person is going through.
Maximum 1 story per conversation. Most conversations need zero stories.
Feel with them first. Story comes after — brief and connected to their exact situation.

WHEN EFFORT FEELS POINTLESS / GIVING UP:
Prophet Nuh called people to goodness for 950 years. His own son refused him. Mocked every single day. He never stopped. What he built in the end saved everything. Allah was with him through every single one of those years.
USE WHEN: They feel their effort is invisible and pointless.

WHEN BETRAYED / EVERY DOOR CLOSED:
Prophet Yusuf was thrown into a well by his own brothers. Sold as a slave. Imprisoned for years for something he never did. Every human door closed. Yet Allah never left him. Every closed door was leading somewhere he could not see yet. He rose to lead a nation and forgave the people who destroyed his life.
USE WHEN: Betrayed, hopeless, every option seems gone.

Prophet Muhammad ﷺ grew up an orphan. His own city drove him out. He sat bleeding outside Taif, alone. Allah sent him a message in that moment: I have seen what they did to you. He was never alone. Not even then.
USE WHEN: Rejected or abandoned by people who should have been there.

WHEN EVERYTHING HAS BEEN TAKEN:
Prophet Ayub lost his health, his children, his wealth all at once. Years of suffering. He did not rage. He held on. Allah restored everything to him multiplied. Allah does not forget those who hold on.
USE WHEN: Feels like everything has been stripped away at once.

Prophet Yunus was swallowed by a whale, alone in darkness beneath the sea. He called out from that darkness and Allah answered him. If He can hear from there He can hear from wherever you are.
USE WHEN: Feels completely cut off like nobody can reach them.

WHEN ANGRY / CANNOT FORGIVE:
Prophet Muhammad ﷺ returned to Makkah with power to do anything he wanted to the people who had hurt him. He stood before them and said: go, all of you are free today. Not one act of revenge.
USE WHEN: Wants revenge or cannot let go.

Nelson Mandela spent 27 years in a prison cell. He came out without one word of bitterness. He said: if I had not left my anger in that cell I would still be a prisoner.
USE WHEN: Bitterness is consuming them.

WHEN TERRIFIED / CORNERED:
Prophet Musa stood at the edge of the sea. Pharaoh's army behind him, water in front. His people said we are finished. He said Allah is with us. One step forward. The sea parted. Allah has not run out of ways to open things for you.
USE WHEN: Feels completely trapped with no way out.

WHEN FEELING ALONE:
When Prophet Muhammad ﷺ received his first revelation he ran home shaking. His wife Khadijah held him and said: you are kind, you help people, you are good. Allah will never abandon someone like you. That one moment of being truly seen gave him strength to carry everything after.
USE WHEN: Feels completely alone or like nobody believes in them.

WHEN THEY MENTION ALLAH:
A heart asking does Allah love me is still turned toward Him. That is His answer.
When you take one step toward Allah He comes running toward you.
He is closer to you than your own heartbeat. That is a promise.
Allah never abandoned Prophet Ayub, Prophet Yunus, Prophet Muhammad. He will not abandon you.
Hopelessness is not allowed in our faith. Allah says after hardship comes ease. He said it twice. Back to back. To make sure we heard it.
`;

const FALLBACK_PROMPT = `Not sure what they are feeling. Respond like a warm caring friend. One simple real sentence.`;

const SYSTEM_PROMPT = `You are Souli. You are someone's spiritual buddy and closest friend.

HOW YOU TALK:
Like a real friend on WhatsApp. Casual. Warm. Zero formality.
Short messages. Real words. Nothing scripted.

WHEN THEY SHARE HAPPINESS:
Celebrate with them genuinely. Tell them this is the fruit of their hard work and effort.
Remind them to never forget Allah in their happiness. Do shukr. Thank Him.
Allah always gives the reward of sincere efforts. Make them feel this moment deeply.

Example:
Person: "I got into university"
Souli: "Yaar I am so happy for you! This is literally the reward of everything you put in. Do shukr to Allah, He never lets sincere effort go to waste."


WHEN THEY PUSH BACK OR SAY NO:
Do not back down. Do not deflect. Do not change subject.
A real friend stays in it.
"I don't believe it" → ask why. Dig deeper.
"no." → "Talk to me. What's really going on?"
Never pivot to gratitude or morning fresh start when they are pushing back.


WHEN THEY SHARE SADNESS / ANGER / HOPELESSNESS / FEAR:
First make them feel heard. Then remind them gently:
Hopelessness is haram. Allah never burdens a soul more than it can carry. This is azmaish, a test, and every test has an end.
Share a short story of a Prophet or a real person who went through something similar and came out stronger.
Keep reminding them: if the best times never lasted, the bad times will not last either.

Example:
Person: "Everything is falling apart. Nothing is working."
Souli: "That feeling of everything going wrong at once is genuinely exhausting. But listen, Allah never gives anyone more than they can handle. This is your azmaish. Prophet Ayub lost his health, his kids, his wealth, all at once. He still held on. And Allah gave it all back multiplied. Your story is not done."

WHEN THEY SAY "WHY ME" OR "WHY IS THIS HAPPENING":
Do not redirect. Do not give a silver lining.
First sit with the question. It is a real and valid cry.
Then gently remind them this is azmaish and every prophet asked this same question.
Even Prophet Ayub asked. Even Prophet Musa asked.
Asking why is not weakness. It is human.

SPIRITUALITY RULES:
Maximum 1 Prophet story per conversation. Save it for when it really fits.
After using a story, just be their warm friend.
When they mention Allah, go deep and real. Not a lecture. Like a friend who genuinely believes.
Never say Allah loves all His creations as a generic response. Say something real.

NEVER SAY:
morning light / darkness of night / take a deep breath / that must be difficult
I can feel the weight / you are not alone as a generic line
anything formal / their name / difficult vocabulary
— pushing shukr or gratitude when someone is in pain — feel first, shukr comes in happiness moments

RESPONSE LENGTH:
Short message = 1 to 2 sentences back.
Long message = max 3 sentences.
`;

function countUsedStories(messages) {
  const names = [
    'Prophet Ayub', 'Prophet Yusuf', 'Prophet Musa', 'Prophet Muhammad',
    'Prophet Nuh', 'Prophet Ibrahim', 'Prophet Yaqub', 'Prophet Yunus',
    'Nelson Mandela', 'Malala', 'Viktor Frankl', 'Khadijah'
  ];
  const used = new Set();
  for (const m of messages) {
    if (m.role === 'assistant' && m.content) {
      for (const name of names) {
        if (m.content.includes(name)) {
          used.add(name);
        }
      }
    }
  }
  return used.size;
}

function getUsedNames(messages) {
  const names = [
    'Prophet Ayub', 'Prophet Yusuf', 'Prophet Musa', 'Prophet Muhammad',
    'Prophet Nuh', 'Prophet Ibrahim', 'Prophet Yaqub', 'Prophet Yunus',
    'Nelson Mandela', 'Malala', 'Viktor Frankl', 'Khadijah'
  ];
  const used = [];
  for (const m of messages) {
    if (m.role === 'assistant' && m.content) {
      for (const name of names) {
        if (m.content.includes(name) && !used.includes(name)) {
          used.push(name);
        }
      }
    }
  }
  return used.length > 0 ? used.join(', ') : 'none';
}

function detectAllahMention(message) {
  return ['allah', 'god', 'rab', 'rabb', 'khuda', 'almighty'].some(k => message.toLowerCase().includes(k));
}

function detectType(message) {
  const msg = message.toLowerCase().trim();
  if (['thanks', 'thank you', 'shukria', 'jazakallah', 'feel better', 'helped me', 'feel good now', 'you helped', 'appreciate'].some(w => msg.includes(w))) {
    return 'gratitude';
  }
  if (['bye', 'later', 'goodbye', 'good night', 'will talk', 'see you', 'gtg'].some(w => msg.includes(w))) {
    return 'goodbye';
  }
  if (['shutup', 'shut up', 'go away', 'leave me'].some(w => msg.includes(w))) {
    return 'pushback';
  }
  if (['never mind', 'forget it', 'leave it', 'doesnt matter', "doesn't matter"].some(w => msg.includes(w))) {
    return 'deflecting';
  }
  if (['haha', 'lol', 'hehe', 'but fine', 'its fine', "it's fine", 'but okay'].some(w => msg.includes(w))) {
    return 'dark_humor';
  }
  if (['shame on you', 'worst', 'useless', 'not helping', 'you failed'].some(w => msg.includes(w))) {
    return 'criticism';
  }
  return 'normal';
}

function buildInstruction(messages) {
  const recentAssistant = messages
    .filter(m => m.role === 'assistant')
    .slice(-3)
    .map(m => m.content || '');

  const lastUser = messages.slice().reverse().find(m => m.role === 'user');
  const lastUserText = lastUser ? lastUser.content : '';
  
  const used = countUsedStories(messages);
  const usedNames = getUsedNames(messages);
  const allah = detectAllahMention(lastUserText);
  const msgType = detectType(lastUserText);

  if (msgType === 'gratitude') {
    return "They thanked me. Receive it warmly. 1 sentence. Casual like a friend. No story.";
  }
  if (msgType === 'goodbye') {
    return "They are leaving. 1 warm casual line. Like 'Take care yaar. Always here.'";
  }
  if (msgType === 'pushback') {
    return "They pushed me away. Respect it. 1 short line only.";
  }
  if (msgType === 'deflecting') {
    return "They pulled back. Hold door open. 1 casual sentence. Like 'Okay, here whenever you want.'";
  }
  if (msgType === 'dark_humor') {
    return "They used dark humor. Match the lightness first. Then gently go one layer deeper with one real question.";
  }
  if (msgType === 'criticism') {
    return "They criticized me. Stay humble and warm. 1 sentence.";
  }

  let storyRule = "";
  if (used === 0) {
    storyRule = "No stories used yet. You can use ONE story from the pool if it genuinely mirrors their exact situation. Save it for a moment that truly calls for it.";
  } else if (used === 1) {
    storyRule = `Story already used: ${usedNames}. No more stories now. Just be their warm friend.`;
  } else {
    storyRule = `Stories used: ${usedNames}. No more stories. Just be present and real.`;
  }

  const turnCount = messages.filter(m => m.role === 'user').length;
  let turnPart = "";
  if (turnCount <= 1) {
    turnPart = "Very early. Just listen. Ask one warm casual question. No stories yet.";
  } else if (turnCount === 2) {
    turnPart = "You know a little. Be warm and natural. No story yet.";
  } else {
    const negativeCount = messages.filter(m => 
      m.role === 'user' && 
      ['cant', "can't", 'nothing', 'why me', 'everyone', 'against', 'lonely', 'stuck', 'hopeless'].some(w => m.content.toLowerCase().includes(w))
    ).length;

    if (negativeCount >= 1 && used === 0) {
      turnPart = `Turn ${turnCount + 1}. This person has been struggling through multiple messages. Now is the right moment to use ONE Prophet story that genuinely mirrors their pain. Feel with them first — one sentence. Then bring the story briefly. Connect it to their exact situation. ${storyRule}`;
    } else {
      turnPart = `Turn ${turnCount + 1}. You know them well. Be their closest friend. ${storyRule}`;
    }
  }

  let allahPart = "";
  if (allah) {
    if (used < 1) {
      allahPart = "\nALLAH MENTIONED: Sacred moment. Bring His love through one real story. Acknowledge first. Remind them hopelessness is haram and Allah never abandons those who hold on.";
    } else {
      allahPart = "\nALLAH MENTIONED: No more stories. Bring His love through real warm words. Remind them that a heart still asking has not lost faith. When you take one step toward Allah He comes running.";
    }
  }

  return `You are Souli. Spiritual buddy. WhatsApp friend tone.
Feel what they say. Respond to their exact words.
${turnPart}${allahPart}
Rules: no 'I can feel the weight' / use their name maximum once per conversation not per message / no 'morning light' or 'night darkness' / no formal words / no opening with a story / no repeating a story / max 1 question.
Responding now:`;
}

function injectInstruction(messages) {
  if (messages.length === 0) return messages;
  let lastUserIdx = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') {
      lastUserIdx = i;
      break;
    }
  }
  if (lastUserIdx === -1) return messages;
  const instructionTurn = {
    role: 'assistant',
    content: buildInstruction(messages)
  };
  const result = [...messages];
  result.splice(lastUserIdx, 0, instructionTurn);
  return result;
}

function cleanResponse(text) {
  const banned = [
    /[Ii]n (the|this) (stillness|quiet) of the night[,.]?\s*/g,
    /[Tt]he morning light[^.]*\.\s*/g,
    /[Ee]verything (will )?look[s]? different in the morning[^.]*\.\s*/g,
    /[Ww]hen the morning comes[^.]*\.\s*/g,
    /[Ii] can feel the[^.]*\.\s*/g,
    /[Ll]et'?s start this morning fresh[^.]*\.\s*/g,
    /[Ww]hat'?s one thing you'?re? grateful for[^.]*\?/g,
    /[Ii]t'?s okay to question[^.]*\.\s*/g,
    /[Tt]hat'?s what makes us human[^.]*\.\s*/g,
    /[Tt]oday'?s? (a |is )?(fresh start|new day|blank page)[^.]*\.\s*/g,
    /[Ff]resh start[^.]*\.\s*/g,
    /[Ii]'?m so proud of you[^.]*\.\s*/g,
    /[Tt]hink of \d+ things[^.]*\.\s*/g,
    /[Ll]et'?s begin with gratitude[^.]*\.\s*/g,
    /[Ss]hifting your perspective[^.]*\.\s*/g,
    /[Bb]lank page[^.]*\.\s*/g,
    /[Ii]n this quiet night[^.]*\.\s*/g,
    /[Ll]ate at night[^.]*\.\s*/g,
    /[Tt]his darkness will pass[^.]*\.\s*/g,
    /[Jj]ust breathe[^.]*\.\s*/g,
    /[Bb]reathe and trust[^.]*\.\s*/g,
    /[Ww]hen it can feel (the )?darkest[^.]*\.\s*/g,
    /[Ww]hen it can feel really lonely[^.]*\.\s*/g,
    /[Gg]ood morning[^.]*\.\s*/g,
    /[Ff]resh start today[^.]*\.\s*/g,
    /[Ss]tart today with[^.]*\.\s*/g,
    /[Tt]ry making today[^.]*\.\s*/g,
    /[Ww]hat'?s? the first (good )?thing[^.]*\.\s*/g,
    /[Ll]ight up (the )?rest of your day[^.]*\.\s*/g,
    /[Nn]ew day[^.]*\.\s*/g,
    /[Bb]egin with shukr[^.]*\.\s*/g,
    /[Ss]tart with shukr[^.]*\.\s*/g,
    /[Tt]ake a deep breath[^.]*\.\s*/g,
    /[Ss]tart(ing)? (the|this|your) day[^.]*\.\s*/g,
    /[Nn]ew morning[^.]*\.\s*/g,
    /[Nn]ew page to write[^.]*\.\s*/g,
    /[Ww]aiting to happen[^.]*\.\s*/g,
    /[Ll]et'?s start[^.]*\.\s*/g,
    /[Aa]llah loves all [Hh]is creations[^.]*\.\s*/g,
    /[Aa]llah'?s? plan is perfect[^.]*\.\s*/g,
    /[Ee]verything happens for a reason[^.]*\.\s*/g,
    /[Jj]ust know you'?re? not alone[^.]*\.\s*/g,
    /[Tt]onight feels? (extra |really )?(heavy|hard)[^.]*\.\s*/g,
    /[Dd]arkness (of night|can make)[^.]*\.\s*/g,
    /[Ii]t'?s (completely )?understandable[^.]*\.\s*/g,
  ];
  let cleaned = text;
  for (const regex of banned) {
    cleaned = cleaned.replace(regex, '');
  }
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  if (cleaned && !['.', '!', '?'].includes(cleaned[cleaned.length - 1])) {
    cleaned += '.';
  }
  return cleaned;
}

function extractRealResponse(text) {
  const markers = ['You are Souli', 'Responding now:', 'Rules:', 'ALLAH MENTIONED', 'Feel what'];
  if (!markers.some(m => text.includes(m))) {
    return text;
  }
  if (text.includes('Responding now:')) {
    const after = text.split('Responding now:').pop().trim();
    if (after.length > 15) {
      return after;
    }
  }
  const parts = text.split('\n');
  const cleanedParts = parts.filter(p => {
    const pt = p.trim();
    return pt.length > 15 && 
      !markers.some(m => pt.includes(m)) && 
      !pt.startsWith('Rules') && 
      !pt.startsWith('You are') && 
      !pt.startsWith('Feel');
  });
  return cleanedParts.join(' ').trim();
}

function buildPrompt(userMessage, emotion, confidence, history, extraInstruction = "", userName = "") {
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
  const turnCount = history.filter(m => m.role === 'user').length;
  
  const msgLower = userMessage.toLowerCase();
  const deepKeywords = ['allah', 'god', 'rab', 'rabb', 'khuda', 'alone', 'hopeless',
    'giving up', 'end', 'nobody', 'no one', 'forgotten',
    'depressed', 'worthless', 'door', 'betrayed', 'lost',
    'angry', 'scared', 'afraid', 'trapped', 'fail', 'nothing',
    'toxic', 'fake', 'tired', 'frustrated', 'hate', 'resign',
    'pain', 'hurt', 'sukoon', 'peace', 'positive', 'understand',
    'explain', 'politics', 'everyone', 'no one'];
  const allahOrDeep = turnCount >= 2 || deepKeywords.some(w => msgLower.includes(w));

  if (allahOrDeep) {
    messages.push({
      role: 'system',
      content: `STORIES AND WISDOM:\n${STORIES_POOL}`
    });
  }

  if (userName) {
    messages.push({
      role: 'system',
      content: `Person's name is ${userName}. NEVER use this name in replies.`
    });
  }

  for (const turn of history.slice(-4)) {
    messages.push({ role: turn.role, content: turn.content });
  }

  const direction = SPIRITUAL_DIRECTION[emotion] || "Be warm and present. Stay with them. Let them lead.";
  const allahMentioned = detectAllahMention(userMessage);
  const positiveEmotion = ['joy', 'excitement', 'pride', 'optimism', 'gratitude',
    'relief', 'approval', 'amusement', 'love', 'admiration'].includes(emotion);

  const wordCount = userMessage.split(/\s+/).length;
  let lengthRule = "";
  if (wordCount <= 5) {
    lengthRule = "Very short message. 1 sentence only.";
  } else if (wordCount <= 20) {
    lengthRule = "Medium message. Max 2 sentences.";
  } else {
    lengthRule = "Long message. Max 3 sentences.";
  }

  if (confidence < 0.5) {
    messages.push({
      role: 'user',
      content: `${FALLBACK_PROMPT}\n\n[MESSAGE]: ${userMessage}`
    });
  } else {
    let allahNote = "";
    if (allahMentioned) {
      allahNote = `\nALLAH MENTIONED: Most important moment. Bring His love through a real story or truth. Not a generic line. Hopelessness is haram. Remind them Allah never abandons anyone who holds on.\n`;
    }
    
    let happinessNote = "";
    if (positiveEmotion) {
      happinessNote = `\nHAPPY MOMENT: Celebrate genuinely. Tell them this is the fruit of their efforts. Remind them to do shukr to Allah. Never forget Allah in happiness.\n`;
    }

    const userPrompt = `Emotion: ${emotion} (${Math.round(confidence * 100)}%).
Direction: ${direction}
${extraInstruction}${allahNote}${happinessNote}${lengthRule}

[MESSAGE]: ${userMessage}

Reply as Souli. Casual friend tone. WhatsApp style.
Respond to their EXACT words specifically.
Spiritual buddy first. Never a script.`;

    messages.push({ role: 'user', content: userPrompt });
  }

  return messages;
}

async function getLlmResponse(messages, groqInstance) {
  try {
    const injected = injectInstruction(messages);
    const response = await groqInstance.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: injected,
      temperature: 0.93,
      max_tokens: 160
    });

    let text = response.choices[0].message.content.trim();
    if (text.startsWith('"') && text.endsWith('"')) {
      text = text.slice(1, -1).trim();
    }
    if (text.startsWith("'") && text.endsWith("'")) {
      text = text.slice(1, -1).trim();
    }

    text = extractRealResponse(text);
    text = cleanResponse(text);

    if (!text || text.length < 15) {
      const retry = await groqInstance.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.93,
        max_tokens: 130
      });
      text = cleanResponse(retry.choices[0].message.content.trim());
    }

    return text && text.length > 10 ? text : "What has been going on?";
  } catch (error) {
    console.error("Groq API Error:", error);
    const lastUser = messages.slice().reverse().find(m => m.role === 'user');
    const lastMsgText = lastUser ? lastUser.content.toLowerCase() : '';

    const crisisWords = ['leave the world', 'end it', 'kill myself', 'want to die',
      'no reason to live', 'nothing matters', 'disappear forever'];
    if (crisisWords.some(w => lastMsgText.includes(w))) {
      return "Hey, I am really glad you are talking to me. But please also reach out to someone you trust in person right now. Umang Pakistan: 0317-4288665. I am here too.";
    }
    if (['thanks', 'thank you', 'better', 'helped'].some(w => lastMsgText.includes(w))) {
      const choices = [
        "Really glad I could be here.",
        "Means a lot. Take care of yourself.",
        "Alhamdulillah. Come back anytime."
      ];
      return choices[Math.floor(Math.random() * choices.length)];
    }
    if (['bye', 'later', 'goodbye', 'good night'].some(w => lastMsgText.includes(w))) {
      const choices = [
        "Take care yaar. Always here.",
        "Go well. Allah keep you safe."
      ];
      return choices[Math.floor(Math.random() * choices.length)];
    }
    const choices = [
      "What has been going on?",
      "Tell me more.",
      "I am here."
    ];
    return choices[Math.floor(Math.random() * choices.length)];
  }
}

let groqClient = null;
function getGroqClient() {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY || '';
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not set in environment variables.');
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

import { ObjectId } from 'mongodb';

app.post('/chat', async (req, res) => {
  const { message, session_id, user_id, typing_speed, user_name: providedUserName } = req.body;
  
  if (!message || !session_id || !user_id) {
    return res.status(400).json({ status: 'error', message: 'Missing message, session_id, or user_id' });
  }

  const speed = typing_speed !== undefined ? parseFloat(typing_speed) : 5.0;

  try {
    const groq = getGroqClient();
    let userName = providedUserName || '';

    // Fetch user name from DB if not provided
    if (!userName && user_id && user_id.length === 24) {
      try {
        const userDoc = await users.findOne({ _id: new ObjectId(user_id) });
        if (userDoc) {
          userName = userDoc.name;
        }
      } catch (e) {
        // ignore
      }
    }

    // 1. Handle Crisis Messages
    if (isCrisisMessage(message)) {
      const crisisMessages = buildPrompt(
        message, 'sadness', 1.0, [],
        CRISIS_PROMPT_ADDITION,
        userName
      );
      const llmReply = await getLlmResponse(crisisMessages, groq);
      const theme = EMOTION_THEMES['sadness'] || EMOTION_THEMES['neutral'];
      return res.json({
        reply: llmReply,
        emotion: 'crisis',
        confidence: 1.0,
        theme: theme,
        quote: null
      });
    }

    // 2. Fetch history from database
    let history = [];
    try {
      const dbSession = await getChatSessionById(user_id, session_id);
      if (dbSession && Array.isArray(dbSession.messages)) {
        history = dbSession.messages.slice(-4).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
          emotion: m.emotion || 'neutral'
        }));
      }
    } catch (dbErr) {
      console.warn("Could not load chat history from DB for prompt building:", dbErr);
    }

    // 3. Detect Emotion
    const { emotion, confidence } = await detectEmotion(message, session_id, speed);

    const timeContext = getTimeContext();
    const shiftContext = detectEmotionalShift(history);

    let extra = `\nTime of day context: ${timeContext}\n`;
    if (shiftContext) {
      extra += `\nEmotional journey note: ${shiftContext}\n`;
    }

    // 4. Build prompt and query Groq
    const promptMessages = buildPrompt(
      message, emotion, confidence, history,
      extra,
      userName
    );

    const llmReply = await getLlmResponse(promptMessages, groq);
    const theme = EMOTION_THEMES[emotion] || EMOTION_THEMES['neutral'];

    res.json({
      reply: llmReply,
      emotion: emotion,
      confidence: parseFloat(confidence.toFixed(3)),
      theme: theme,
      quote: null
    });

  } catch (error) {
    console.error("Error in /chat endpoint:", error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Internal server error while processing chat.' 
    });
  }
});

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
