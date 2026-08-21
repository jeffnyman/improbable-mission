import type { SceneName } from "../types/scenes";

class SceneManager {
  // The game opens on the intro speech over the elevator view,
  // matching the original's boot scene.
  private currentScene: SceneName = "anotherVisitor";

  getScene(): SceneName {
    return this.currentScene;
  }

  setScene(scene: SceneName) {
    this.currentScene = scene;
  }
}

export const sceneManager: SceneManager = new SceneManager();
