import uuid from 'react-native-uuid';

// Use UUID v4 for all IDs
export function generateId(): string {
  return uuid.v4() as string;
}

// Sequential quote numbers: SQ-YYYYMM-XXXXX
// Uses a simple counter approach via timestamp for uniqueness
let lastSequence = 0;
let lastDateStr = '';

export function generateQuoteNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const dateStr = `${y}${m}`;

  if (dateStr === lastDateStr) {
    lastSequence++;
  } else {
    lastSequence = 1;
    lastDateStr = dateStr;
  }

  const seq = String(lastSequence).padStart(5, '0');
  return `SQ-${dateStr}-${seq}`;
}
