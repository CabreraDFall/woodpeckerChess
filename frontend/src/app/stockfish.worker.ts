/// <reference lib="webworker" />

const engine = new Worker('/stockfish.js');

addEventListener('message', ({ data }) => {
  engine.postMessage(data);
});

engine.onmessage = (event) => {
  postMessage(event.data);
};
