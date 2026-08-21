const button = document.querySelector("button");

console.clear();

let audioContext;
const audioElement = document.querySelector("audio");
let track;

const oneDot = document.querySelector(".one-dot");

// play and pause audio
oneDot.addEventListener(
    "click",
    () => {
        if (!audioContext) {
            init();
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

function init () {
    audioContext = new AudioContext();
    track = new MediaElementAudioSourceNode(audioContext, {
        mediaElement: audioElement,
    });

    track.connect(audioContext.destination);
}