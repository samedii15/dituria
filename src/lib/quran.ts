export const AYAH_COUNT_MISMATCH_MESSAGE = "Numri i ajeteve ne arabisht dhe ne shqip nuk perputhet.";

export function splitIntoAyahLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function buildAyahsFromFullSurah(arabicFullText: string, albanianFullText: string) {
  const arabicLines = splitIntoAyahLines(arabicFullText);
  const albanianLines = splitIntoAyahLines(albanianFullText);

  if (arabicLines.length === 0 || albanianLines.length === 0) {
    throw new Error("Nuk u gjet asnje ajet i vlefshem.");
  }

  if (arabicLines.length !== albanianLines.length) {
    throw new Error(AYAH_COUNT_MISMATCH_MESSAGE);
  }

  return arabicLines.map((arabicText, index) => {
    const text = albanianLines[index];

    if (!arabicText || !text) {
      throw new Error("Nuk lejohen ajete bosh.");
    }

    return {
      number: index + 1,
      arabicText,
      text,
    };
  });
}