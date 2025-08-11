export class TrailCanvas {
  constructor(width = 512, height = 512) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    
    // Initialize with black background
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, width, height);
    
    // Circle properties
    this.circleRadius = width*0.12;
    this.fadeAlpha = 0.025; // Controls fade speed (lower = slower fade)
  }
  
  update(mouse) {
    // Apply fade effect by drawing a semi-transparent black rectangle
    this.ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeAlpha})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw smooth white circle at mouse position
    if (mouse && mouse.x !== undefined && mouse.y !== undefined) {
      // Save current state
      this.ctx.save();
      
      // Apply blur filter for extra softness
      this.ctx.filter = 'blur(4px)';
      
      // Create radial gradient with extended radius for longer, smoother fade
      const gradientRadius = this.circleRadius * 2.5; // Even more extended gradient
      const gradient = this.ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, gradientRadius
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)'); // Slightly brighter center for blur
      gradient.addColorStop(0.08, 'rgba(255, 255, 255, 0.5)'); // Very quick initial fade
      gradient.addColorStop(0.15, 'rgba(255, 255, 255, 0.35)'); // Gentle fade
      gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.2)'); // Gradual fade
      gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.12)'); // Soft fade
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)'); // Very soft
      gradient.addColorStop(0.65, 'rgba(255, 255, 255, 0.03)'); // Almost invisible
      gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.01)'); // Ultra soft
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); // Transparent edges
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(mouse.x, mouse.y, gradientRadius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Restore state to remove blur filter
      this.ctx.restore();
    }
  }
  
  getTexture() {
    return this.canvas;
  }
  
  // Optional: method to get canvas data URL
  getDataURL() {
    return this.canvas.toDataURL();
  }
  
  // Optional: method to clear the canvas
  clear() {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  // Optional: method to set fade speed
  setFadeSpeed(alpha) {
    this.fadeAlpha = Math.max(0, Math.min(1, alpha));
  }
  
  // Optional: method to set circle radius
  setCircleRadius(radius) {
    this.circleRadius = radius;
  }
}
