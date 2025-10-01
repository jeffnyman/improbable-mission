export async function loadResources(engine) {
  const loadingState = {
    required: 1,
    loaded: 0,
  };

  if (engine.audio.context) {
    loadingState.required += engine.audio.resources.length;
  }

  document.getElementById("loading").classList.remove("hidden");
  document.getElementById("required").textContent = loadingState.required;

  await Promise.all([
    loadSpriteResources(engine, loadingState),
    loadAudioResources(engine, loadingState),
  ]);
}

function loadSpriteResources(engine, loadingState) {
  return new Promise((resolve, reject) => {
    const gameSprites = new Image();

    gameSprites.onload = () => {
      loadingState.loaded++;
      document.getElementById("loaded").textContent = loadingState.loaded;
      engine.gameSprites = gameSprites;

      resolve(true);
    };

    gameSprites.onerror = () => {
      reject(new Error("Unable to load game sprites."));
    };

    gameSprites.src = `${import.meta.env.BASE_URL}images/missionSprites.png`;
  });
}

async function loadAudioResources(engine, loadingState) {
  if (!engine.audio.context) {
    console.warn("Audio context not available.");
    return Promise.resolve();
  }

  for (const audioFile of engine.audio.resources) {
    await loadAudio(audioFile, engine, loadingState);
  }
}

async function loadAudio(audioFile, engine, loadingState) {
  const name = audioFile.split(".")[0];
  const response = await fetch(`${import.meta.env.BASE_URL}audio/${audioFile}`);
  const arrayBuffer = await response.arrayBuffer();
  let buffer = null;

  try {
    buffer = await engine.audio.context.decodeAudioData(arrayBuffer);
  } catch (error) {
    throw new Error(`${audioFile}: ${error.message}.`);
  }

  loadingState.loaded++;
  document.getElementById("loaded").textContent = loadingState.loaded;

  engine.audio.sounds[name] = buffer;

  // This is a random delay to simulate the retro-feel.
  const delay = Math.random() * 100 + 50; // 50-150ms
  await new Promise((resolve) => setTimeout(resolve, delay));
}
