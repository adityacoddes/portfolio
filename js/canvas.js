/* ==========================================================================
   HERO ARCHITECTURAL BLUEPRINT GRID & INTERACTIVE 3D NODE CLUSTER
   ========================================================================== */

class BlueprintGrid {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.gridSpacing = 80;
    this.animationProgress = 0; // Starts at 0, goes to 1
    this.animationSpeed = 0.015; // Speed of the drafting animation
    
    // 3D Node Cluster configuration
    this.nodes = [];
    const numNodes = 28;
    const radius = 130; // Size of sphere cluster
    for (let i = 0; i < numNodes; i++) {
      // Distribute points spherically using spiral distribution
      const theta = i * 2.39996; // Golden angle in radians
      const y = 1 - (i / (numNodes - 1)) * 2; // y goes from 1 to -1
      const r = Math.sqrt(1 - y * y) * radius * (0.8 + 0.2 * Math.random());
      
      this.nodes.push({
        x: Math.cos(theta) * r,
        y: y * radius * (0.8 + 0.2 * Math.random()),
        z: Math.sin(theta) * r,
        ox: Math.cos(theta) * r,
        oy: y * radius * (0.8 + 0.2 * Math.random()),
        oz: Math.sin(theta) * r,
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03
      });
    }
    
    // Rotation variables (auto-rotation and mouse-displacement values)
    this.angleX = 0;
    this.angleY = 0;
    this.angleZ = 0;
    this.targetRotX = 0;
    this.targetRotY = 0;
    this.rotX = 0;
    this.rotY = 0;
    
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // Listen for dark mode toggle to redraw with correct colors
    document.addEventListener('themeChanged', () => {
      this.draw(this.animationProgress);
    });
    
    // Track mouse coordinates over Hero Section to apply tilt/perspective shifts
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        
        // Tilt bounds: +/- 0.45 radians
        this.targetRotY = ((mx - cx) / cx) * 0.45;
        this.targetRotX = -((my - cy) / cy) * 0.45;
      });
      
      // Smooth reset when cursor leaves Hero space
      heroSection.addEventListener('mouseleave', () => {
        this.targetRotX = 0;
        this.targetRotY = 0;
      });
    }
    
    // Start continuous animation loop
    this.animate();
  }

  resize() {
    const parent = this.canvas.parentElement;
    this.width = parent.clientWidth;
    this.height = parent.clientHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  animate() {
    // Progress blueprint grid entry animation
    if (this.animationProgress < 1) {
      this.animationProgress += this.animationSpeed;
    } else {
      this.animationProgress = 1;
    }
    
    // Smooth interpolation (spring ease) towards mouse tilt coordinates
    this.rotX += (this.targetRotX - this.rotX) * 0.08;
    this.rotY += (this.targetRotY - this.rotY) * 0.08;
    
    // Continuous auto-rotation velocities
    this.angleX += 0.0015;
    this.angleY += 0.0025;
    this.angleZ += 0.0008;
    
    // Exponential ease-out progression mapping for blueprint drafting lines
    const t = 1 - Math.pow(1 - this.animationProgress, 3);
    this.draw(t);
    
    requestAnimationFrame(() => this.animate());
  }

  draw(progress) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    
    ctx.lineWidth = 1;
    
    const isDark = document.body.classList.contains('dark');
    ctx.strokeStyle = isDark ? 'rgba(244, 244, 242, 0.03)' : 'rgba(25, 24, 24, 0.03)';
    ctx.fillStyle = isDark ? 'rgba(244, 244, 242, 0.15)' : 'rgba(25, 24, 24, 0.15)';
    ctx.font = '8px "JetBrains Mono", monospace';
    
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    // ----------------------------------------------------------------------
    // 1. Draw animated vertical grid lines (expanding from center outward)
    // ----------------------------------------------------------------------
    for (let x = 0; x < this.width; x += this.gridSpacing) {
      const distanceFromCenter = Math.abs(x - centerX);
      const maxDistance = this.width / 2;
      
      const lineProgress = Math.max(0, Math.min(1, (progress - (distanceFromCenter / maxDistance) * 0.4) / 0.6));
      
      if (lineProgress > 0) {
        ctx.beginPath();
        const startY = centerY - (centerY * lineProgress);
        const endY = centerY + (centerY * lineProgress);
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
        
        if (lineProgress >= 0.9 && x % (this.gridSpacing * 2) === 0 && x > 0 && x < this.width - 100) {
          ctx.fillText(`X:${x}`, x + 4, 15);
        }
      }
    }
    
    // ----------------------------------------------------------------------
    // 2. Draw animated horizontal grid lines (expanding from center outward)
    // ----------------------------------------------------------------------
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
    
    // ----------------------------------------------------------------------
    // 3. Draw corner telemetry circle markings
    // ----------------------------------------------------------------------
    if (progress > 0.8) {
      const circleProgress = (progress - 0.8) / 0.2;
      ctx.strokeStyle = isDark ? `rgba(244, 244, 242, ${0.03 * circleProgress})` : `rgba(25, 24, 24, ${0.03 * circleProgress})`;
      
      ctx.beginPath();
      ctx.arc(40, 40, 20 * circleProgress, 0, Math.PI * 2 * circleProgress);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(this.width - 40, this.height - 40, 30 * circleProgress, 0, Math.PI * 2 * circleProgress);
      ctx.stroke();
    }

    // ----------------------------------------------------------------------
    // 4. Draw Interactive 3D Node Cluster (Neural Net / Point Cloud)
    // ----------------------------------------------------------------------
    // Calculate layout coordinates for 3D model positioning
    let clusterCenterX = this.width * 0.72; // Desktop: Positioned on the right side
    let clusterCenterY = this.height * 0.5;  // Centered vertically
    
    if (this.width < 900) {
      // Tablet/Mobile: Center it in the middle of canvas
      clusterCenterX = this.width / 2;
      clusterCenterY = this.height / 2;
    }

    // Project points: Rotate 3D points and map to 2D canvas coordinates
    this.nodes.forEach(node => {
      // Apply micro-drift float animations
      const time = Date.now() * 0.0008;
      const driftX = Math.sin(time + node.phase) * 6;
      const driftY = Math.cos(time * 0.9 + node.phase) * 6;
      const driftZ = Math.sin(time * 1.1 + node.phase) * 6;
      
      const px = node.ox + driftX;
      const py = node.oy + driftY;
      const pz = node.oz + driftZ;
      
      // Rotation matrices: Z-axis
      const cosZ = Math.cos(this.angleZ);
      const sinZ = Math.sin(this.angleZ);
      const rx1 = px * cosZ - py * sinZ;
      const ry1 = px * sinZ + py * cosZ;
      const rz1 = pz;
      
      // Rotation matrices: Y-axis (including mouse Y displacement yaw)
      const ryAngle = this.angleY + this.rotY;
      const cosY = Math.cos(ryAngle);
      const sinY = Math.sin(ryAngle);
      const rx2 = rx1 * cosY - rz1 * sinY;
      const ry2 = ry1;
      const rz2 = rx1 * sinY + rz1 * cosY;
      
      // Rotation matrices: X-axis (including mouse X displacement pitch)
      const rxAngle = this.angleX + this.rotX;
      const cosX = Math.cos(rxAngle);
      const sinX = Math.sin(rxAngle);
      const rx3 = rx2;
      const ry3 = ry2 * cosX - rz2 * sinX;
      const rz3 = ry2 * sinX + rz2 * cosX;
      
      // Perspective projection mapping
      const fov = 350;
      const scale = fov / (fov + rz3);
      
      node.projX = clusterCenterX + rx3 * scale;
      node.projY = clusterCenterY + ry3 * scale;
      node.projZ = rz3; // Depth position
      node.scale = scale;
    });

    // Draw connection lines between nodes within spatial proximity
    const maxLineDist = 110;
    ctx.lineWidth = 0.75;
    for (let i = 0; i < this.nodes.length; i++) {
      const n1 = this.nodes[i];
      for (let j = i + 1; j < this.nodes.length; j++) {
        const n2 = this.nodes[j];
        
        // Distance math in 3D coordinate space
        const dx = n1.ox - n2.ox;
        const dy = n1.oy - n2.oy;
        const dz = n1.oz - n2.oz;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (dist < maxLineDist) {
          const proximityOpacity = 1.0 - (dist / maxLineDist);
          // Lines fade in with overall blueprint entry animation
          const lineAlpha = proximityOpacity * 0.22 * progress;
          
          ctx.strokeStyle = isDark 
            ? `rgba(244, 244, 242, ${lineAlpha})` 
            : `rgba(25, 24, 24, ${lineAlpha})`;
          
          ctx.beginPath();
          ctx.moveTo(n1.projX, n1.projY);
          ctx.lineTo(n2.projX, n2.projY);
          ctx.stroke();
        }
      }
    }

    // Draw node vertices
    this.nodes.forEach(node => {
      // Size adapts based on Z depth position
      const size = Math.max(1, 2.5 * node.scale);
      
      // Opacity maps with Z depth to represent perspective shading
      const depthOpacity = Math.max(0.12, Math.min(0.85, (node.projZ + 130) / 260));
      const nodeAlpha = depthOpacity * progress;
      
      // Nodes render in technical blue theme accent
      ctx.fillStyle = isDark
        ? `rgba(74, 127, 247, ${nodeAlpha})`
        : `rgba(27, 93, 239, ${nodeAlpha})`;
      
      ctx.beginPath();
      ctx.arc(node.projX, node.projY, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Outlines mapping for sharp technical look
      ctx.strokeStyle = isDark
        ? `rgba(244, 244, 242, ${nodeAlpha * 0.2})`
        : `rgba(25, 24, 24, ${nodeAlpha * 0.2})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });
  }
}

// Instantiate on document load
document.addEventListener('DOMContentLoaded', () => {
  new BlueprintGrid('hero-canvas');
});
