import fs from "fs";

const audioDir = "./audio";
const outputFile = "./data.js";
const leftOffset = 75;

// Color pairs to cycle through — add more if you have more audio files than colors
const colorPalette = [
  { backgroundColor: "var(--lime)", highlightedColor: "var(--green)" },
  { backgroundColor: "var(--orange)", highlightedColor: "var(--dark-orange)" },
  { backgroundColor: "var(--yellow)", highlightedColor: "var(--dark-yellow)" },
  { backgroundColor: "var(--red)", highlightedColor: "var(--dark-red)" },
  { backgroundColor: "var(--magenta)", highlightedColor: "var(--dark-magenta)" },
  { backgroundColor: "var(--blue)", highlightedColor: "var(--dark-blue)" },
  { backgroundColor: "var(--purple)", highlightedColor: "var(--dark-purple)" },
  { backgroundColor: "var(--cyan)", highlightedColor: "var(--dark-cyan)" },
];

const files = fs
  .readdirSync(audioDir)
  .filter((f) => /\.(wav|mp3)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })); // natural sort

const MAX_DOTS = 8;

if (files.length > MAX_DOTS) {
  throw new Error(
    `Found ${files.length} audio files in ${audioDir}, but a maximum of ${MAX_DOTS} is allowed. ` +
    `Please increase MAX_DOTS and color palette.`
  );
}

const numDots = files.length;

const entries = files.map((file, i) => {
  const color = colorPalette[i % colorPalette.length];
  return `    { 
        id: "dot${i + 1}", 
        audioSrc: "./audio/${file}", 
        leftOffsetPx: leftOffset, yFraction: ${i + 1} / numDots, 
        backgroundColor: "${color.backgroundColor}", 
        highlightedColor: "${color.highlightedColor}",
    }`;
});

const output = `const leftOffset = ${leftOffset};
const numDots = ${numDots};

export const dotDefs = [
${entries.join(",\n")}
];
`;

fs.writeFileSync(outputFile, output);
console.log(`Generated ${outputFile} with ${numDots} audio dots.`);