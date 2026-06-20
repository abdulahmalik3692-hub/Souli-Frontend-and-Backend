import { MongoClient } from 'mongodb';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = process.env.DB_NAME || 'soulify_db';

if (!MONGODB_URI) {
  console.warn("WARNING: MONGODB_URI is not set in .env file.");
}

const client = new MongoClient(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  autoSelectFamily: false,
  tls: true,
  tlsAllowInvalidCertificates: true
});

let db;
export let moodLogs;
export let users;
export let chatSessions;

export async function connectDb() {
  try {
    await client.connect();
    db = client.db(DB_NAME);
    
    moodLogs = db.collection('mood_logs');
    users = db.collection('users');
    chatSessions = db.collection('chat_sessions');

    // Performance optimization indexes
    await users.createIndex({ email: 1 }, { unique: true });
    await moodLogs.createIndex({ user_id: 1, timestamp: -1 });
    await chatSessions.createIndex({ user_id: 1, updated_at: -1 });
    await chatSessions.createIndex({ user_id: 1, session_id: 1 });
    
    console.log(`Connected to MongoDB database: ${DB_NAME}`);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    // Don't crash the server, so frontend doesn't get connection refused
  }
}

// ── Secure Password Hashing & Encryption Helpers (Compatible with Python db.py) ───────────────────

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const pwdHash = crypto.pbkdf2Sync(
    password,
    salt,
    100000,
    32, // 32 bytes (256-bit)
    'sha256'
  );
  return `${salt}:${pwdHash.toString('hex')}`;
}

export function verifyPassword(storedPassword, providedPassword) {
  try {
    const [salt, storedHash] = storedPassword.split(':');
    const pwdHash = crypto.pbkdf2Sync(
      providedPassword,
      salt,
      100000,
      32,
      'sha256'
    );
    return pwdHash.toString('hex') === storedHash;
  } catch (e) {
    return false;
  }
}

// ── User Account Operations & Authentication ────────────────────────

export async function getUserByEmail(email) {
  try {
    const emailClean = email.toLowerCase().trim();
    return await users.findOne({ email: emailClean });
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

export async function createOrUpdateUnverifiedUser(name, email, password, code) {
  try {
    const emailClean = email.toLowerCase().trim();
    const pwdHash = hashPassword(password);
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);
    
    const existing = await getUserByEmail(emailClean);
    if (existing && existing.verified) {
      return false;
    }

    await users.updateOne(
      { email: emailClean },
      {
        $set: {
          name: name,
          password_hash: pwdHash,
          verified: false,
          verification_code: code,
          verification_expires: expires,
          updated_at: new Date()
        }
      },
      { upsert: true }
    );
    return true;
  } catch (error) {
    console.error("Error creating/updating unverified user:", error);
    return false;
  }
}

export async function verifyUserCodeDb(email, code) {
  try {
    const emailClean = email.toLowerCase().trim();
    const user = await getUserByEmail(emailClean);
    if (!user) {
      return [false, "User not found"];
    }
    if (user.verified) {
      return [true, "User is already verified"];
    }
    
    const storedCode = user.verification_code;
    const expires = user.verification_expires ? new Date(user.verification_expires) : null;
    
    if (!storedCode || String(storedCode).trim() !== String(code).trim()) {
      return [false, "Invalid verification code"];
    }
    
    if (expires && new Date() > expires) {
      return [false, "Verification code has expired"];
    }
    
    await users.updateOne(
      { email: emailClean },
      {
        $set: {
          verified: true,
          verification_code: null,
          verification_expires: null,
          updated_at: new Date()
        }
      }
    );
    return [true, "Successfully verified"];
  } catch (error) {
    return [false, `Verification failed: ${error.message}`];
  }
}

export async function verifyUserLogin(email, password) {
  try {
    const emailClean = email.toLowerCase().trim();
    const user = await getUserByEmail(emailClean);
    if (!user) {
      return [false, false, null];
    }
    
    const storedHash = user.password_hash;
    if (!storedHash || !verifyPassword(storedHash, password)) {
      return [false, false, null];
    }
    
    const isVerified = !!user.verified;
    const userData = {
      id: user._id.toString(),  // serializable string ID for localStorage
      name: user.name,
      email: user.email
    };
    return [true, isVerified, userData];
  } catch (error) {
    console.error("Error verifying user login:", error);
    return [false, false, null];
  }
}

// ── Chat Session Persistence ──────────────────────────────────────

/**
 * Upsert a chat session. Each session_id is one conversation.
 * title is auto-derived from the first user message if not provided.
 */
export async function saveChatSession(userId, sessionId, messages, title) {
  try {
    if (!chatSessions) return false;
    const sessionTitle = title || (messages[0]?.text?.slice(0, 50) || 'New Session');
    await chatSessions.updateOne(
      { user_id: userId, session_id: sessionId },
      {
        $set: {
          user_id: userId,
          session_id: sessionId,
          title: sessionTitle,
          messages: messages,
          updated_at: new Date()
        },
        $setOnInsert: {
          created_at: new Date()
        }
      },
      { upsert: true }
    );
    return true;
  } catch (error) {
    console.error("Error saving chat session:", error);
    return false;
  }
}

/**
 * Get a lightweight list of recent sessions for the sidebar (no messages).
 */
export async function getChatSessionList(userId, limit = 20) {
  try {
    if (!chatSessions) return [];
    const sessions = await chatSessions
      .find({ user_id: userId })
      .sort({ updated_at: -1 })
      .limit(limit)
      .project({ messages: 0 })  // don't send full messages in list
      .toArray();
    return sessions;
  } catch (error) {
    console.error("Error fetching chat session list:", error);
    return [];
  }
}

/**
 * Load a single full session (with all messages) by session_id.
 */
export async function getChatSessionById(userId, sessionId) {
  try {
    if (!chatSessions) return null;
    return await chatSessions.findOne({ user_id: userId, session_id: sessionId });
  } catch (error) {
    console.error("Error fetching chat session by id:", error);
    return null;
  }
}

/**
 * Reassign all chat sessions from a guest or legacy id to the logged-in user's MongoDB id.
 */
export async function migrateChatSessions(fromUserId, toUserId) {
  try {
    if (!chatSessions) return 0;
    if (!fromUserId || !toUserId || fromUserId === toUserId) {
      return 0;
    }
    
    // Migrate chat sessions
    const result = await chatSessions.updateMany(
      { user_id: fromUserId },
      { $set: { user_id: toUserId } }
    );
    
    // Migrate mood logs
    if (moodLogs) {
      await moodLogs.updateMany(
        { user_id: fromUserId },
        { $set: { user_id: toUserId } }
      );
    }
    
    return result.modifiedCount ?? 0;
  } catch (error) {
    console.error("Error migrating chat sessions:", error);
    return 0;
  }
}

export async function savePasswordResetCodeDb(email, code) {
  try {
    const emailClean = email.toLowerCase().trim();
    const user = await getUserByEmail(emailClean);
    if (!user) {
      return [false, "No account exists with this email address."];
    }
    
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);
    
    await users.updateOne(
      { email: emailClean },
      {
        $set: {
          reset_code: code,
          reset_expires: expires,
          updated_at: new Date()
        }
      }
    );
    return [true, "Reset code generated"];
  } catch (error) {
    console.error("Error saving password reset code:", error);
    return [false, "Failed to initiate password reset."];
  }
}

export async function resetPasswordWithCodeDb(email, code, newPassword) {
  try {
    const emailClean = email.toLowerCase().trim();
    const user = await getUserByEmail(emailClean);
    if (!user) {
      return [false, "User not found."];
    }
    
    const storedCode = user.reset_code;
    const expires = user.reset_expires ? new Date(user.reset_expires) : null;
    
    if (!storedCode || String(storedCode).trim() !== String(code).trim()) {
      return [false, "Invalid reset code."];
    }
    
    if (expires && new Date() > expires) {
      return [false, "Reset code has expired. Please request a new one."];
    }
    
    const newPwdHash = hashPassword(newPassword);
    
    await users.updateOne(
      { email: emailClean },
      {
        $set: {
          password_hash: newPwdHash,
          reset_code: null,
          reset_expires: null,
          updated_at: new Date()
        }
      }
    );
    return [true, "Password successfully updated."];
  } catch (error) {
    console.error("Error resetting password:", error);
    return [false, `Reset password process failed: ${error.message}`];
  }
}
