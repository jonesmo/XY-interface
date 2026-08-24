import { resizeCanvas, createDot, positionDot } from "./utils.js";
import { dotDefs } from "./data.js";

console.clear();

const container = document.querySelector(".workspace");
const rect = container.getBoundingClientRect();

// position dots initially
const dots = dotDefs.map((def) => ({
  id: def.id,
  audioSrc: def.audioSrc,
  x: def.leftOffsetPx / rect.width,
  y: def.yFraction,
}));

// generate dots
dots.forEach((dotData) => createDot(container, dotData));

// resize everything and relocate dots with window resize
const ro = new ResizeObserver(() => {
  resizeCanvas();
  dots.forEach((dotData) => positionDot(container, dotData));
});

ro.observe(container);