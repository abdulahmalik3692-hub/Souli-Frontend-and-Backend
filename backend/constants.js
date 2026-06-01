// Soulify Shared Constants

export const NEGATIVE_EMOTIONS = new Set([
  'sadness', 'grief', 'remorse', 'fear', 'nervousness',
  'anger', 'annoyance', 'disgust', 'disappointment', 'confusion',
  'disapproval', 'embarrassment'
]);

export const ALL_EMOTIONS = new Set([
  'admiration', 'amusement', 'anger', 'annoyance', 'approval', 'caring', 
  'confusion', 'curiosity', 'desire', 'disappointment', 'disapproval', 
  'disgust', 'embarrassment', 'excitement', 'fear', 'gratitude', 'grief', 
  'joy', 'love', 'nervousness', 'optimism', 'pride', 'realization', 
  'relief', 'remorse', 'sadness', 'surprise', 'neutral'
]);

// 1-10 scale mapping for all 28 GoEmotions to support insights charts and aggregates
export const EMOTION_MOOD_SCORES = {
  'joy': 9,
  'excitement': 9,
  'love': 10,
  'amusement': 8,
  'pride': 8,
  'optimism': 8,
  'gratitude': 9,
  'relief': 8,
  'caring': 8,
  'admiration': 8,
  'approval': 7,
  'desire': 7,
  'neutral': 6,
  'realization': 6,
  'curiosity': 6,
  'surprise': 6,
  'confusion': 4,
  'embarrassment': 4,
  'disapproval': 4,
  'annoyance': 3,
  'disappointment': 3,
  'nervousness': 3,
  'anger': 2,
  'fear': 2,
  'disgust': 2,
  'sadness': 2,
  'remorse': 2,
  'grief': 1
};

// Detection Tuning
export const NEGATIVE_OVERRIDE_THRESHOLD = 0.25;
export const SMOOTHING_BOOST = 1.20;
export const KEYWORD_BOOST = 0.12;
export const CONTEXT_WEIGHT = 0.10;

// Session Config
export const SESSION_TTL_MINUTES = 60;
export const MAX_HISTORY_TURNS = 10;

// Quote Config
export const QUOTE_CONFIDENCE_THRESHOLD = 0.85;
export const QUOTE_COOLDOWN_TURNS = 3;

// ===========================================================================
//  TYPING SPEED MODIFIER CONSTANTS
// ===========================================================================

// Emotions that get boosted when user types FAST (>7 cps)
export const FAST_BOOST_EMOTIONS = new Set(['anger', 'annoyance', 'fear', 'nervousness', 'excitement']);

// Emotions that get boosted when user types SLOW (<3 cps)
export const SLOW_BOOST_EMOTIONS = new Set(['sadness', 'grief', 'remorse', 'disappointment']);

// Slow typing + positive emotion = likely masking distress
export const SLOW_TYPING_SUSPICION_THRESHOLD = 3.0;      // cps
export const SLOW_TYPING_CONFIDENCE_PENALTY = 0.25;      // Reduce confidence

// Fast typing + neutral/calm emotion = likely hidden agitation
export const FAST_TYPING_OVERRIDE_EMOTIONS = new Set(['neutral', 'realization', 'curiosity', 'surprise']);
export const FAST_TYPING_OVERRIDE_CONFIDENCE = 0.55;
