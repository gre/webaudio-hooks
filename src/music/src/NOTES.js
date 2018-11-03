export const NOTES = {};
const toneSymbols = "CcDdEFfGgAaB";
for (let octave = 0; octave <= 10; ++octave) {
  for (let t = 0; t < 12; ++t) {
    NOTES[octave * 12 + t] = NOTES[
      toneSymbols[t] + octave
    ] = calcMIDINoteToFrequency(octave * 12 + t);
  }
}

export function calcMIDINoteToFrequency(note) {
  return Math.pow(2, (note - 57) / 12) * 440;
}
