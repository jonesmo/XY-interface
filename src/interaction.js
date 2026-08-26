import { resizeCanvas, createDot, positionDot, logData } from "./utils.js";
import { dotDefs } from "./data.js";

console.clear();

const runId = crypto.randomUUID();
const endpoint = "https://dummy.url";

// position dots initially
const container = document.querySelector(".workspace");
const rect = container.getBoundingClientRect();

const dots = dotDefs.map((def) => ({
  id: def.id,
  audioSrc: def.audioSrc,
  x: def.leftOffsetPx / rect.width,
  y: def.yFraction,
  backgroundColor: def.backgroundColor,
  highlightedColor: def.highlightedColor,
}));

// generate dots
dots.forEach((dotData) => createDot(container, dotData));

// resize everything and relocate dots with window resize
const ro = new ResizeObserver(() => {
  resizeCanvas();
  dots.forEach((dotData) => positionDot(container, dotData));
});

ro.observe(container);

// when Finish is clicked, log out data
document.getElementById('finish').addEventListener('click', async () => {
  e.target.disabled = true; // in case of double clicks

  const dotData = dots.map(def => ({
    id: def.id,
    audioSrc: def.audioSrc,
    x: def.x,
    y: def.y,
    backgroundColor: def.backgroundColor,
    highlightedColor: def.highlightedColor,
  }));

  try {
    const result = await logData(runId, dotData, endpoint);
    console.log('Saved successfully:', result);
    document.getElementById('status').textContent = 'Your data has been recorded. Thank you!';
  } catch (err) {
    console.error('Error saving data:', err);
    document.getElementById('status').textContent = 'There was an error saving your data. Please try again.';
    e.target.disabled = false;
  }
});