class SceneManager {
  private currentScene = "elevator";

  getScene(): string {
    return this.currentScene;
  }
}

export const sceneManager: SceneManager = new SceneManager();
