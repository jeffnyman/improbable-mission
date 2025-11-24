type SceneName = "elevator";

class SceneManager {
  private currentScene: SceneName = "elevator";

  getScene(): SceneName {
    return this.currentScene;
  }
}

export const sceneManager: SceneManager = new SceneManager();
