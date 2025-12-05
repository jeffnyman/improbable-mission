class GameTime {
  private scanFrameCounter = 0;

  getSFC() {
    return this.scanFrameCounter;
  }

  setSFC(counter: number) {
    this.scanFrameCounter = counter;
  }
}

export const gameTime: GameTime = new GameTime();
