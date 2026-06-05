import { BRAND } from "./brand";

export const EMOTION_BG = {
  sadness: "#F5EDE6",
  grief: "#F5EDE6",
  remorse: "#F5EDE6",
  fear: "#E4F2EE",
  nervousness: "#E4F2EE",
  anger: "#FCE8E8",
  annoyance: "#FCE8E8",
  disgust: "#F5EBEB",
  disapproval: "#F0EBEB",
  confusion: "#F0EBF8",
  disappointment: "#E8F0F2",
  embarrassment: "#FCEEF5",
  joy: "#FFF6E6",
  excitement: "#FFF0E0",
  amusement: "#FFF8EB",
  love: "#FCEEF4",
  desire: "#FCE8F0",
  caring: "#F5EEF8",
  admiration: "#EEEAF8",
  approval: "#E8EEF8",
  gratitude: "#E6F4EE",
  optimism: "#E8F5EC",
  pride: "#E6F2EA",
  curiosity: "#F0EBFA",
  realization: "#EDE8F8",
  surprise: "#F2EBFA",
  relief: "#E6F4F0",
  neutral: BRAND.bg,
};

export const EMOTION_ACCENT = {
  sadness: "#C4A574",
  grief: "#C4A574",
  remorse: "#B8956A",
  fear: "#5A9A88",
  nervousness: "#6BA896",
  anger: "#C97A7A",
  annoyance: "#B86B6B",
  disgust: "#9A7A7A",
  disapproval: "#8A7A8A",
  confusion: "#9A82B8",
  disappointment: "#6A9098",
  embarrassment: "#C88AA8",
  joy: "#D4A84A",
  excitement: "#E09850",
  amusement: "#D4B060",
  love: "#C87898",
  desire: "#B86A90",
  caring: "#A878B0",
  admiration: "#7A6AB8",
  approval: "#6A7AB8",
  gratitude: "#5A9A78",
  optimism: "#5AAA70",
  pride: "#4A9870",
  curiosity: "#8A72C0",
  realization: "#7A68B0",
  surprise: "#9070C8",
  relief: "#5A9A90",
  neutral: BRAND.primary,
};

export const EMOTION_LABEL = {
  sadness: "Healing Gold",
  grief: "Healing Gold",
  remorse: "Healing Gold",
  fear: "Grounding Mint",
  nervousness: "Grounding Mint",
  anger: "Cooling Rose",
  annoyance: "Cooling Rose",
  disgust: "Cooling Rose",
  disapproval: "Cooling Rose",
  confusion: "Clarity Lavender",
  disappointment: "Ocean Teal Perspective",
  embarrassment: "Compassion Pink",
  joy: "Vibrant Celebration",
  excitement: "Vibrant Celebration",
  amusement: "Vibrant Celebration",
  love: "Deep Connection",
  desire: "Deep Connection",
  caring: "Deep Connection",
  admiration: "Royal Indigo Respect",
  approval: "Royal Indigo Respect",
  gratitude: "Emerald Flourishing",
  optimism: "Emerald Flourishing",
  pride: "Emerald Flourishing",
  curiosity: "Curious Purple",
  realization: "Realization Violet",
  surprise: "Surprise Violet",
  relief: "Relief Teal",
  neutral: "Neutral Balance",
};

export const DEFAULT_THEME = {
  bg: BRAND.bg,
  laser: BRAND.primary,
  accent: `from-[${BRAND.primary}] to-[${BRAND.bg}]`,
  text: "text-[#2A5565]",
  glow: "rgba(42, 85, 101, 0.12)",
  label: "Neutral Balance",
};

export function getThemeForEmotion(emotion, apiTheme) {
  const accent = apiTheme?.accent || EMOTION_ACCENT[emotion] || BRAND.primary;
  const bg = EMOTION_BG[emotion] || BRAND.bg;
  const label =
    EMOTION_LABEL[emotion] ||
    (emotion ? emotion.charAt(0).toUpperCase() + emotion.slice(1) : "Neutral Balance");

  return {
    bg,
    laser: accent,
    accent: `from-[${accent}] to-[${BRAND.bg}]`,
    text: "text-[#2A5565]",
    glow: `${accent}33`,
    label,
    rawAccent: accent,
  };
}
