import missionSpritesUrl from "/images/missionSprites.png";

export async function loadGameResources(engine) {
  console.log("Load: game resources");

  engine.test = true; // REMOVE

  const loadingDiv = document.getElementById("loading");
  loadingDiv.classList.remove("hidden");

  try {
    const [spritesLoaded, audioLoaded] = await Promise.all([
      loadSpriteResources(engine),
      loadAudioResources(),
    ]);

    return { spritesLoaded, audioLoaded };
  } catch (error) {
    console.error("Failed to load resources:", error);
    throw error;
  }
}

function loadSpriteResources(engine) {
  return new Promise((resolve, reject) => {
    const baseSprites = new Image();
    const loadedElement = document.getElementById("loaded-resources");

    baseSprites.onload = () => {
      try {
        engine.loadedResources++;
        loadedElement.textContent = engine.loadedResources;

        resolve(true);
      } catch (error) {
        reject(error);
      }
    };

    baseSprites.onerror = () => reject(new Error("Failed to load sprites"));
    baseSprites.src = missionSpritesUrl;
  });
}

async function loadAudioResources() {}
