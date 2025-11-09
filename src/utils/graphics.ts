class Graphics {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private getColors: (() => string[]) | null = null;
  private getSprites: (() => Record<string, HTMLImageElement>) | null = null;
  private getPaletteName: (() => string) | null = null;

  init(
    canvasId: string,
    colorGetter: () => string[],
    spriteGetter: () => Record<string, HTMLImageElement>,
    paletteNameGetter: () => string,
  ) {
    this.canvas = this.getCanvasById(canvasId);
    this.ctx = this.getRenderingContext2D(this.canvas);
    this.ctx.imageSmoothingEnabled = false;
    this.getColors = colorGetter;
    this.getSprites = spriteGetter;
    this.getPaletteName = paletteNameGetter;

    return this.canvas;
  }

  draw(sx: number, sy: number, sw: number, sh: number, dx: number, dy: number) {
    if (!this.ctx || !this.getSprites || !this.getPaletteName)
      throw new Error("Graphics not initialized.");

    const sprites = this.getSprites();
    const paletteName = this.getPaletteName();

    this.ctx.drawImage(
      sprites[paletteName],
      sx,
      sy,
      sw,
      sh,
      dx * 3,
      dy * 3,
      sw * 3,
      sh * 3,
    );
  }

  drawImage(
    image: HTMLImageElement,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
  ) {
    if (!this.ctx) throw new Error("Graphics not initialized.");

    this.ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  fillStyle(colorIndex: number) {
    if (!this.ctx || !this.getColors)
      throw new Error("Graphics not initialized.");

    this.ctx.fillStyle = "#" + this.getColors()[colorIndex];
  }

  rect(x: number, y: number, w: number, h: number, colorIndex: number) {
    if (!this.ctx) throw new Error("Graphics not initialized.");

    this.fillStyle(colorIndex);
    this.ctx.fillRect(x * 3, y * 3, w * 3, h * 3);
  }

  getCanvasById(id: string): HTMLCanvasElement {
    const el = document.getElementById(id);

    if (!(el instanceof HTMLCanvasElement)) {
      throw new Error(`Element #${id} is not a <canvas>.`);
    }

    return el;
  }

  getRenderingContext2D(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Failed to get 2D rendering context.");

    return ctx;
  }
}

export const graphics = new Graphics();
