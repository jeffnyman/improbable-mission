import type { SceneName } from "../types/scenes";

class SceneManager {
  private currentScene: SceneName = "elevator";

  getScene(): string {
    return this.currentScene;
  }

  setScene(scene: SceneName) {
    this.currentScene = scene;
  }
}

export const sceneManager: SceneManager = new SceneManager();
