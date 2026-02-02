import type { SceneName } from "../types/scenes";

class SceneManager {
  private currentScene: SceneName = "elevator";

  getScene(): string {
    return this.currentScene;
  }
}

export const sceneManager: SceneManager = new SceneManager();
