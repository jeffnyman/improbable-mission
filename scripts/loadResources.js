import missionSpritesUrl from "/images/missionSprites.png";

export async function loadGameResources(engine) {
  console.log("Load: game resources");

  engine.test = true; // REMOVE

  const loadingDiv = document.getElementById("loading");
  loadingDiv.classList.remove("hidden");

  try {
    const [spritesLoaded, audioLoaded] = await Promise.all([
      loadSpriteResources(engine),
      loadAudioResources(engine),
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

async function loadAudioResources(engine) {
  if (!engine.audio.context) {
    console.warn("Audio context not available");
    return [];
  }

  try {
    const results = [];

    for (const fileName of engine.audio.resources) {
      const result = await loadAudio(fileName, engine);
      results.push(result);
    }

    return results;
  } catch (error) {
    console.error("Failed to load audio resources:", error);
    throw error;
  }
}

async function loadAudio(fileName, engine) {
  const loadedElement = document.getElementById("loaded-resources");

  if (!engine.audio.context) {
    console.warn("Audio context not available");
    return [];
  }

  const name = fileName.split(".")[0];

  try {
    const response = await fetch(
      `${import.meta.env.BASE_URL}audio/${fileName}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch ${fileName}: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = await engine.audio.context.decodeAudioData(arrayBuffer);

    engine.audio.sounds[name] = buffer;
    engine.loadedResources++;

    loadedElement.textContent = engine.loadedResources;

    // This is a random delay, purely to simulate the retro-feel.
    const delay = Math.random() * 100 + 50;
    await new Promise((resolve) => setTimeout(resolve, delay));

    return { fileName, name, buffer };
  } catch (error) {
    console.error(`Error loading audio resource ${fileName}:`, error);
    throw error;
  }
}
