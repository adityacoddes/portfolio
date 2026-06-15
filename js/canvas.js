/* ==========================================================================
   HERO ARCHITECTURAL BLUEPRINT GRID (ANIMATED LINE-DRAFTING EDITION)
   ========================================================================== */

class BlueprintGrid {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.gridSpacing = 80;
    this.animationProgress = 0; // Starts at 0, goes to 1
    this.animationSpeed = 0.015; // Speed of the drafting animation
    this.isAnimating = true;
    
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // Listen for dark mode toggle to redraw with correct colors
    document.addEventListener('themeChanged', () => {
      if (!this.isAnimating) {
        this.draw(1); // Redraw instantly if animation has finished
      }
    });
    
    // Start drawing loop
    this.animate();
  }

  resize() {
    const parent = this.canvas.parentElement;
    this.width = parent.clientWidth;
    this.height = parent.clientHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    if (!this.isAnimating) {
      this.draw(1);
    }
  }

  animate() {
    if (this.animationProgress < 1) {
      this.animationProgress += this.animationSpeed;
      // Exponential ease-out for a very smooth deceleration
      const t = 1 - Math.pow(1 - this.animationProgress, 3);
      this.draw(t);
      requestAnimationFrame(() => this.animate());
    } else {
      this.animationProgress = 1;
      this.isAnimating = false;
      this.draw(1);
    }
  }

  draw(progress) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    
    ctx.lineWidth = 1;
    
    const isDark = document.body.classList.contains('dark');
    ctx.strokeStyle = isDark ? 'rgba(244, 244, 242, 0.035)' : 'rgba(25, 24, 24, 0.035)';
    ctx.fillStyle = isDark ? 'rgba(244, 244, 242, 0.15)' : 'rgba(25, 24, 24, 0.15)';
    ctx.font = '8px "JetBrains Mono", monospace';
    
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    // 1. Draw animated vertical grid lines (expanding from center outward)
    for (let x = 0; x < this.width; x += this.gridSpacing) {
      // Calculate distance from center to this line
      const distanceFromCenter = Math.abs(x - centerX);
      const maxDistance = this.width / 2;
      
      // Line is drawn only if progress has reached its spatial threshold
      const lineProgress = Math.max(0, Math.min(1, (progress - (distanceFromCenter / maxDistance) * 0.4) / 0.6));
      
      if (lineProgress > 0) {
        ctx.beginPath();
        // Expand height from center line outwards
        const startY = centerY - (centerY * lineProgress);
        const endY = centerY + (centerY * lineProgress);
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
        
        // Coordinate labels appear at the end of line progress
        if (lineProgress >= 0.9 && x % (this.gridSpacing * 2) === 0 && x > 0 && x < this.width - 100) {
          ctx.fillText(`X:${x}`, x + 4, 15);
        }
      }
    }
    
    // 2. Draw animated horizontal grid lines (expanding from center outward)
    for (let y = 0; y < this.height; y += this.gridSpacing) {
      const distanceFromCenter = Math.abs(y - centerY);
      const maxDistance = this.height / 2;
      const lineProgress = Math.max(0, Math.min(1, (progress - (distanceFromCenter / maxDistance) * 0.4) / 0.6));
      
      if (lineProgress > 0) {
        ctx.beginPath();
        const startX = centerX - (centerX * lineProgress);
        const endX = centerX + (centerX * lineProgress);
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
        
        if (lineProgress >= 0.9 && y % (this.gridSpacing * 2) === 0 && y > 0 && y < this.height - 40) {
          ctx.fillText(`Y:${y}`, 6, y - 4);
        }
      }
    }
    
    // 3. Draw corner telemetry circle markings at the very end
    if (progress > 0.8) {
      const circleProgress = (progress - 0.8) / 0.2;
      ctx.strokeStyle = isDark ? `rgba(244, 244, 242, ${0.035 * circleProgress})` : `rgba(25, 24, 24, ${0.035 * circleProgress})`;
      
      ctx.beginPath();
      ctx.arc(40, 40, 20 * circleProgress, 0, Math.PI * 2 * circleProgress);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(this.width - 40, this.height - 40, 30 * circleProgress, 0, Math.PI * 2 * circleProgress);
      ctx.stroke();
    }
  }
}

// Instantiate on document load
document.addEventListener('DOMContentLoaded', () => {
  new BlueprintGrid('hero-canvas');
});
