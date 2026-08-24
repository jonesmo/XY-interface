export function resizeCanvas() {
  const workspace = document.querySelector('.workspace');
  const canvas = document.getElementById('xy-plane');
  const size = Math.min(workspace.clientWidth, workspace.clientHeight) * 0.9;
  canvas.width = size;
  canvas.height = size;
}

export function initAudioContext (audioElement) {
    const audioContext = new AudioContext();
    const track = new MediaElementAudioSourceNode(audioContext, {
        mediaElement: audioElement,
    });

    track.connect(audioContext.destination);

    return { track, audioContext };
}