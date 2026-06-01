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

export async function connectDb() {
  try {
    await client.connect();
    db = client.db(DB_NAME);
    
    moodLogs = db.collection('mood_logs');
    users = db.collection('users');
    
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
    
    if (!storedCode || storedCode !== code) {
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
      name: user.name,
      email: user.email
    };
    return [true, isVerified, userData];
  } catch (error) {
    console.error("Error verifying user login:", error);
    return [false, false, null];
  }
}
