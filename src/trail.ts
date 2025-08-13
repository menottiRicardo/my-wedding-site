export class TrailCanvas {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  circleRadius: number;
  fadeAlpha: number;

  constructor(width: number = 512, height: number = 512) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, width, height);

    this.circleRadius = width * 0.12;
    this.fadeAlpha = 0.025;
  }

  update(mouse: { x: number; y: number } | undefined): void {
    this.ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeAlpha})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (mouse && mouse.x !== undefined && mouse.y !== undefined) {
      this.ctx.save();
      this.ctx.filter = 'blur(4px)';

      const gradientRadius = this.circleRadius * 2.5;
      const gradient = this.ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        gradientRadius
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      gradient.addColorStop(0.08, 'rgba(255, 255, 255, 0.5)');
      gradient.addColorStop(0.15, 'rgba(255, 255, 255, 0.35)');
      gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.2)');
      gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.12)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)');
      gradient.addColorStop(0.65, 'rgba(255, 255, 255, 0.03)');
      gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.01)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(mouse.x, mouse.y, gradientRadius, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }
  }

  getTexture(): HTMLCanvasElement {
    return this.canvas;
  }

  getDataURL(): string {
    return this.canvas.toDataURL();
  }

  clear(): void {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  setFadeSpeed(alpha: number): void {
    this.fadeAlpha = Math.max(0, Math.min(1, alpha));
  }

  setCircleRadius(radius: number): void {
    this.circleRadius = radius;
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.clear();
  }
}


