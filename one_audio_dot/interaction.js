import { resizeCanvas, createDot, positionDot } from "./utils.js";
import { dots } from "./data.js";

console.clear();

const container = document.querySelector(".workspace");

// generate dots
dots.forEach((dotData) => createDot(container, dotData));

// resize everything and relocate dots with window resize
const ro = new ResizeObserver(() => {
  resizeCanvas();
  dots.forEach((dotData) => positionDot(container, dotData));
});

ro.observe(container);