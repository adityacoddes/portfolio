/* ==========================================================================
   INTERACTIVE WIDGETS - GATIS FORECAST SIMULATOR (EDITORIAL STYLE)
   ========================================================================== */

class GatisDashboard {
  constructor() {
    this.canvas = document.getElementById('gatis-chart');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.cropSelector = document.getElementById('gatis-crop');
    this.yearSlider = document.getElementById('gatis-year');
    this.yearValueLabel = document.getElementById('gatis-year-val');
    
    // Stats elements
    this.statYield = document.getElementById('gatis-stat-yield');
    this.statGrowth = document.getElementById('gatis-stat-growth');
    this.statConfidence = document.getElementById('gatis-stat-confidence');
    
    // Dataset models
    this.cropDataModels = {
      wheat: {
        name: 'Wheat (FAOSTAT Code 15)',
        baseYield: 3.2, // tonnes per hectare
        growthRate: 0.045,
        anomalyYear: 2022, 
        rSquared: 0.942,
        mse: 0.081
      },
      rice: {
        name: 'Rice (FAOSTAT Code 27)',
        baseYield: 4.5,
        growthRate: 0.035,
        anomalyYear: 2018,
        rSquared: 0.928,
        mse: 0.095
      },
      maize: {
        name: 'Maize (FAOSTAT Code 56)',
        baseYield: 5.8,
        growthRate: 0.062,
        anomalyYear: 2020,
        rSquared: 0.957,
        mse: 0.068
      },
      potatoes: {
        name: 'Potatoes (FAOSTAT Code 116)',
        baseYield: 18.5,
        growthRate: 0.12,
        anomalyYear: 2021,
        rSquared: 0.915,
        mse: 0.244
      },
      soybeans: {
        name: 'Soybeans (FAOSTAT Code 236)',
        baseYield: 2.8,
        growthRate: 0.04,
        anomalyYear: 2019,
        rSquared: 0.935,
        mse: 0.075
      },
      barley: {
        name: 'Barley (FAOSTAT Code 44)',
        baseYield: 3.0,
        growthRate: 0.025,
        anomalyYear: 2017,
        rSquared: 0.912,
        mse: 0.088
      },
      sugarcane: {
        name: 'Sugarcane (FAOSTAT Code 156)',
        baseYield: 70.5,
        growthRate: 0.45,
        anomalyYear: 2023,
        rSquared: 0.963,
        mse: 1.12
      }
    };
    
    this.init();
  }

  init() {
    this.resize();
    
    // Event listeners
    this.cropSelector.addEventListener('change', () => this.updateDashboard());
    this.yearSlider.addEventListener('input', () => this.handleSliderChange());
    window.addEventListener('resize', () => {
      this.resize();
      this.updateDashboard();
    });
    
    // Listen for dark mode toggle to redraw with correct colors
    document.addEventListener('themeChanged', () => this.updateDashboard());
    
    // Initial draw
    this.updateDashboard();
  }

  resize() {
    this.width = this.canvas.parentElement.clientWidth;
    this.height = 200; 
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  handleSliderChange() {
    const val = this.yearSlider.value;
    this.yearValueLabel.textContent = val;
    this.updateDashboard();
  }

  updateDashboard() {
    const crop = this.cropSelector.value;
    const year = parseInt(this.yearSlider.value);
    const model = this.cropDataModels[crop];
    
    if (!model) return;
    
    const results = this.runHuberRegressionSimulation(model, year);
    
    // Update HTML readouts
    this.statYield.textContent = `${results.projectedYield.toFixed(2)} t/ha`;
    this.statGrowth.textContent = `${results.growthPercent >= 0 ? '+' : ''}${(results.growthPercent * 100).toFixed(1)}%`;
    this.statConfidence.textContent = `${(model.rSquared * 100).toFixed(1)}% (R²)`;
    
    // Draw the chart
    this.drawChart(model, year, results.points);
  }

  runHuberRegressionSimulation(model, targetYear) {
    const points = [];
    const startYear = 2010;
    const endYear = 2031;
    
    // Generate historical values (2010 - 2026)
    for (let yr = startYear; yr <= 2026; yr++) {
      let t = yr - startYear;
      let noise = Math.sin(yr * 1.5) * 0.15; 
      
      if (yr === model.anomalyYear) {
        noise -= 0.6; 
      }
      
      const yieldVal = model.baseYield + (model.growthRate * t) + noise;
      points.push({ year: yr, yield: yieldVal, type: 'actual' });
    }
    
    // Generate Huber forecasting values (2027 - 2031)
    const baselineSlope = model.growthRate;
    const lastActualYield = points[points.length - 1].yield;
    
    for (let yr = 2027; yr <= endYear; yr++) {
      let t = yr - 2026;
      const yieldVal = lastActualYield + (baselineSlope * t);
      points.push({ year: yr, yield: yieldVal, type: 'forecast' });
    }
    
    const targetPoint = points.find(p => p.year === targetYear);
    const projectedYield = targetPoint ? targetPoint.yield : 0;
    
    const actual2026 = points.find(p => p.year === 2026).yield;
    const growthPercent = (projectedYield - actual2026) / actual2026;
    
    return {
      points,
      projectedYield,
      growthPercent
    };
  }

  drawChart(model, selectedYear, points) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 20;
    
    const chartWidth = this.width - paddingLeft - paddingRight;
    const chartHeight = this.height - paddingTop - paddingBottom;
    
    const yields = points.map(p => p.yield);
    const minY = Math.min(...yields) * 0.95;
    const maxY = Math.max(...yields) * 1.05;
    const rangeY = maxY - minY;
    
    const startYear = points[0].year;
    const endYear = points[points.length - 1].year;
    const rangeX = endYear - startYear;
    
    const mapX = (yr) => paddingLeft + ((yr - startYear) / rangeX) * chartWidth;
    const mapY = (yd) => this.height - paddingBottom - ((yd - minY) / rangeY) * chartHeight;
    
    // Colors configuration based on active theme
    const isDark = document.body.classList.contains('dark');
    const colorLineGrid = isDark ? 'rgba(244, 244, 242, 0.05)' : 'rgba(25, 24, 24, 0.05)';
    const colorTextMuted = isDark ? 'rgba(244, 244, 242, 0.4)' : 'rgba(25, 24, 24, 0.4)';
    const colorHistoricalLine = isDark ? 'var(--color-cream-100)' : 'var(--color-black-900)';
    const colorForecastLine = 'var(--color-blue-500)';
    const colorSplitLine = isDark ? 'rgba(244, 244, 242, 0.2)' : 'rgba(25, 24, 24, 0.2)';
    
    // Draw grid lines
    ctx.strokeStyle = colorLineGrid;
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 3; i++) {
      const yd = minY + (rangeY * i / 3);
      const cy = mapY(yd);
      
      ctx.beginPath();
      ctx.moveTo(paddingLeft, cy);
      ctx.lineTo(this.width - paddingRight, cy);
      ctx.stroke();
      
      // Y labels
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillStyle = colorTextMuted;
      ctx.fillText(yd.toFixed(1), 10, cy + 3);
    }
    
    // Draw historical line
    ctx.strokeStyle = colorHistoricalLine;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    let firstActual = true;
    
    points.filter(p => p.year <= 2026).forEach(p => {
      const cx = mapX(p.year);
      const cy = mapY(p.yield);
      if (firstActual) {
        ctx.moveTo(cx, cy);
        firstActual = false;
      } else {
        ctx.lineTo(cx, cy);
      }
    });
    ctx.stroke();
    
    // Draw forecast projection line
    ctx.strokeStyle = colorForecastLine;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    const forecastPoints = points.filter(p => p.year >= 2026);
    ctx.moveTo(mapX(forecastPoints[0].year), mapY(forecastPoints[0].yield));
    forecastPoints.forEach(p => {
      ctx.lineTo(mapX(p.year), mapY(p.yield));
    });
    ctx.stroke();
    
    // Draw split timeline vertical line
    const splitX = mapX(2026);
    ctx.strokeStyle = colorSplitLine;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(splitX, paddingTop);
    ctx.lineTo(splitX, this.height - paddingBottom);
    ctx.stroke();
    
    ctx.font = '7px "JetBrains Mono", monospace';
    ctx.fillStyle = colorTextMuted;
    ctx.fillText('HISTORIC', splitX - 45, paddingTop - 5);
    ctx.fillStyle = colorForecastLine;
    ctx.fillText('FORECAST', splitX + 5, paddingTop - 5);
    
    // Draw selected year crosshair
    const selectedPoint = points.find(p => p.year === selectedYear);
    if (selectedPoint) {
      const cx = mapX(selectedYear);
      const cy = mapY(selectedPoint.yield);
      
      // Crosshair dot
      ctx.fillStyle = selectedYear > 2026 ? colorForecastLine : colorHistoricalLine;
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Fine vertical coordinate indicator
      ctx.strokeStyle = colorSplitLine;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, this.height - paddingBottom);
      ctx.stroke();
      
      // Label year on X axis
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillStyle = selectedYear > 2026 ? colorForecastLine : colorHistoricalLine;
      ctx.fillText(selectedYear.toString(), cx - 10, this.height - 5);
    }
    
    // Start/End Years
    ctx.fillStyle = colorTextMuted;
    ctx.fillText(startYear.toString(), paddingLeft, this.height - 5);
    ctx.fillText(endYear.toString(), mapX(endYear) - 20, this.height - 5);
  }
}

// Instantiate on document load
document.addEventListener('DOMContentLoaded', () => {
  new GatisDashboard();
});
