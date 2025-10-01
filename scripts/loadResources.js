export async function loadResources(engine) {
  const loadingState = {
    required: 1,
    loaded: 0,
  };

  document.getElementById("loading").classList.remove("hidden");
  document.getElementById("required").textContent = loadingState.required;

  await loadSpriteResources(engine, loadingState);
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
