import { initAudioContext, resizeCanvas } from "./utils.js";

console.clear();

let audioContext;
let track;
const audioElement = document.querySelector("audio");
const oneDot = document.querySelector(".one-dot");

// play and pause audio
oneDot.addEventListener(
    "click",
    () => {
        if (!audioContext) {
            ({ track, audioContext } = initAudioContext(audioElement));
        }

        // check if audio context is suspended b/c no autoplay
        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        if (oneDot.dataset.playing === "false") {
            audioElement.play();
            oneDot.dataset.playing = "true";
        } else if (oneDot.dataset.playing === "true") {
            audioElement.pause();
            audioElement.currentTime = 0; // restart audio when clicked again
            oneDot.dataset.playing = "false";
        }

        // toggle between playing vs. not playing
        let state = 
            oneDot.getAttribute("aria-checked") === "true" ? true : false;
            oneDot.setAttribute("aria-checked", state ? "false" : "true");
    },
    false
);

audioElement.addEventListener(
    "ended",
    () => {
        oneDot.dataset.playing = "false";
        oneDot.setAttribute("aria-checked", "false");
    },
    false
);

// X-Y plane
const plane = document.getElementById("xy-plane");
const planeContext = plane.getContext("2d");

// resize everything with window resize
const ro = new ResizeObserver(resizeCanvas);
ro.observe(document.querySelector('.workspace'));
