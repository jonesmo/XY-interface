export function resizeCanvas() {
  const workspace = document.querySelector('.workspace');
  const canvas = document.getElementById('xy-plane');
  const size = Math.min(workspace.clientWidth, workspace.clientHeight) * 0.9;
  canvas.width = size;
  canvas.height = size;
}

function initAudioContext (audioElement) {
    const audioContext = new AudioContext();
    const track = new MediaElementAudioSourceNode(audioContext, {
        mediaElement: audioElement,
    });

    track.connect(audioContext.destination);

    return { track, audioContext };
}

export function createDot(container, dotData) {
  const button = document.createElement("button");
  button.className = "one-dot";
  button.dataset.id = dotData.id;
  button.dataset.playing = "false";
  button.setAttribute("role", "switch");
  button.setAttribute("aria-checked", "false");
  button.style.setProperty("--dot-color", dotData.backgroundColor);
  button.style.setProperty("--dot-active-color", dotData.highlightedColor);

  const audio = document.createElement("audio");
  audio.src = dotData.audioSrc;
  audio.crossOrigin = "anonymous";

  audio.addEventListener("ended", () => {
    button.dataset.playing = "false";
    button.setAttribute("aria-checked", "false");
  });

  container.appendChild(audio);
  container.appendChild(button);

  dotData.element = button;
  dotData.audioElement = audio;

  positionDot(container, dotData);
  makeDraggable(container, dotData);
  attachClickHandler(dotData);

  return dotData;
}

export function positionDot(container, dotData) {
  const rect = container.getBoundingClientRect();
  dotData.element.style.left = `${dotData.x * rect.width}px`;
  dotData.element.style.top = `${dotData.y * rect.height}px`;
}

function makeDraggable(container, dotData) {
  const el = dotData.element;

  el.addEventListener("pointerdown", (e) => {
    el.setPointerCapture(e.pointerId); // keeps events targeting this element
    el.classList.add("dragging");

    const onMove = (e) => {
      const rect = container.getBoundingClientRect();

      // Convert pointer position to a 0–1 fraction, clamped inside bounds
      let fracX = (e.clientX - rect.left) / rect.width;
      let fracY = (e.clientY - rect.top) / rect.height;
      fracX = Math.min(1, Math.max(0, fracX));
      fracY = Math.min(1, Math.max(0, fracY));

      dotData.x = fracX;
      dotData.y = fracY;
      positionDot(container, dotData);
    };

    const onUp = (e) => {
      el.releasePointerCapture(e.pointerId);
      el.classList.remove("dragging");
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
  });
}

export function togglePlay(dotData) {
  if (!dotData.audioContext) {
    const { track, audioContext } = initAudioContext(dotData.audioElement);
    dotData.track = track;
    dotData.audioContext = audioContext;
  }

  if (dotData.audioContext.state === "suspended") {
    dotData.audioContext.resume();
  }

  const btn = dotData.element;
  const audio = dotData.audioElement;

  if (btn.dataset.playing === "false") {
    audio.play();
    btn.dataset.playing = "true";
  } else {
    audio.pause();
    audio.currentTime = 0;
    btn.dataset.playing = "false";
  }

  const state = btn.getAttribute("aria-checked") === "true";
  btn.setAttribute("aria-checked", state ? "false" : "true");
}

export function attachClickHandler(dotData) {
  const el = dotData.element;
  let startX, startY, moved;

  el.addEventListener("pointerdown", (e) => {
    startX = e.clientX;
    startY = e.clientY;
    moved = false;
  });

  el.addEventListener("pointermove", (e) => {
    if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
      moved = true;
    }
  });

  el.addEventListener("pointerup", () => {
    if (!moved) {
      togglePlay(dotData);
    }
  });
}