let currentlyPlayingDot = null;

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

// dots
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
    if (currentlyPlayingDot === dotData) {
      currentlyPlayingDot = null;
  }
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
  const canvas = document.getElementById("xy-plane");

  if (dotData.hasEnteredCanvas === undefined) {
    dotData.hasEnteredCanvas = false;
  }

  el.addEventListener("pointerdown", (e) => {
    el.setPointerCapture(e.pointerId); // keeps events targeting this element
    el.classList.add("dragging");

    const onMove = (e) => {
      const containerRect = container.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();

      // Has the pointer entered the canvas area on this move?
      const insideCanvasNow =
        e.clientX >= canvasRect.left &&
        e.clientX <= canvasRect.right &&
        e.clientY >= canvasRect.top &&
        e.clientY <= canvasRect.bottom;

      if (insideCanvasNow) {
        dotData.hasEnteredCanvas = true;
      }

      // Pick which rect to clamp against
      const bounds = dotData.hasEnteredCanvas ? canvasRect : containerRect;

      const clampedX = Math.min(bounds.right, Math.max(bounds.left, e.clientX));
      const clampedY = Math.min(bounds.bottom, Math.max(bounds.top, e.clientY));

      let fracX = (clampedX - containerRect.left) / containerRect.width;
      let fracY = (clampedY - containerRect.top) / containerRect.height;

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
  const wasPlaying = btn.dataset.playing === "true";

  if (currentlyPlayingDot && currentlyPlayingDot !== dotData) {
    stopDot(currentlyPlayingDot);
  }

  if (wasPlaying) {
    // Clicking the dot that's already playing stops it
    stopDot(dotData);
    currentlyPlayingDot = null;
  } else {
    audio.play();
    btn.dataset.playing = "true";
    btn.setAttribute("aria-checked", "true");
    currentlyPlayingDot = dotData;
  }
}

function stopDot(dotData) {
  const btn = dotData.element;
  const audio = dotData.audioElement;
  audio.pause();
  audio.currentTime = 0;
  btn.dataset.playing = "false";
  btn.setAttribute("aria-checked", "false");
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

// log data to server
export async function logData(runId, dotData, endpoint) {
  const payload = {
    runId,
    timestamp: new Date().toISOString(),
    dotData
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Server responded with status ${response.status}`);
  }

  return response.json();
}