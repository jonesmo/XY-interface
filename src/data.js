const leftOffset = 75;
const numDots = 3;
const MAX_DOTS = 8;

export const dotDefs = [
    { 
        id: "dot1", 
        audioSrc: "./audio/boring_song.mp3", 
        leftOffsetPx: leftOffset, yFraction: 1 / MAX_DOTS, 
        backgroundColor: "var(--lime)", 
        highlightedColor: "var(--green)",
    },
    { 
        id: "dot2", 
        audioSrc: "./audio/rainbow.wav", 
        leftOffsetPx: leftOffset, yFraction: 2 / MAX_DOTS, 
        backgroundColor: "var(--orange)", 
        highlightedColor: "var(--dark-orange)",
    },
    { 
        id: "dot3", 
        audioSrc: "./audio/saw_scale.wav", 
        leftOffsetPx: leftOffset, yFraction: 3 / MAX_DOTS, 
        backgroundColor: "var(--yellow)", 
        highlightedColor: "var(--dark-yellow)",
    }
];
