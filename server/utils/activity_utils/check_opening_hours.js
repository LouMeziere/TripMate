// Helper to parse Foursquare "HH:mm" or "HHmm" time string to minutes since midnight
function parseTimeString(timeStr) {
  if (!timeStr) return null;
  if (timeStr.includes(':')) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  } else if (timeStr.length === 4) {
    return Number(timeStr.slice(0,2)) * 60 + Number(timeStr.slice(2));
  }
  return null;
}

// Helper to convert minutes since midnight to "HH:mm" string
function minutesToTimeString(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
}
// ...existing code...

// Helper to assign a time to a place (no open/close check)
function assignTimeToPlace(places, targetTime) {
  if (places && places.length) {
    return { ...places[0], time: minutesToTimeString(targetTime) };
  }
  return null;
}

// Typical times in minutes since midnight
const typicalTimes = {
  breakfast: 8 * 60, // 08:00
  activity1: 10 * 60, // 10:00
  lunch: 12 * 60 + 30, // 12:30
  activity2: 14 * 60, // 14:00
  dinner: 19 * 60, // 19:00
};

module.exports = {
  minutesToTimeString,
  typicalTimes
};
