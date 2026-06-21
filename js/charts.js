/**
 * charts.js — Pure JS canvas charts
 * Global: window.WeeklyChart
 */
(function() {
  'use strict';

  function WeeklyChart(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.animProgress = 0;
    this.animFrame = null;
    this._weekData = null;
  }

  WeeklyChart.prototype.getThemeColors = function() {
    var style = getComputedStyle(document.documentElement);
    return {
      orange: '#ff6b35',
      blue: '#4c9bff',
      green: '#00d084',
      purple: '#9b59ff',
      text: '#8b9cc8',
      muted: '#4a5a80',
      border: document.documentElement.getAttribute('data-theme') === 'light' ? '#d0daf0' : '#2a3550',
      bg: document.documentElement.getAttribute('data-theme') === 'light' ? '#f0f4ff' : '#0d1526',
    };
  };

  WeeklyChart.prototype.draw = function(weekData) {
    if (!this.ctx) return;
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.animProgress = 0;
    this._weekData = weekData;
    var self = this;
    function animate() {
      self.animProgress = Math.min(self.animProgress + 0.05, 1);
      self._render(self.animProgress);
      if (self.animProgress < 1) {
        self.animFrame = requestAnimationFrame(animate);
      }
    }
    animate();
  };

  WeeklyChart.prototype._render = function(progress) {
    var canvas = this.canvas;
    var ctx = this.ctx;
    var weekData = this._weekData;
    var C = this.getThemeColors();

    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    var W = rect.width;
    var H = rect.height;

    ctx.clearRect(0, 0, W, H);

    var padL = 44, padR = 16, padT = 16, padB = 44;
    var chartW = W - padL - padR;
    var chartH = H - padT - padB;

    var proteinData = weekData.map(function(d) { return d.protein || 0; });
    var waterData = weekData.map(function(d) { return d.water || 0; });
    var scoreData = weekData.map(function(d) { return d.score || 0; });
    var days = weekData.map(function(d) { return d.label; });

    var maxProtein = Math.max.apply(null, proteinData.concat([weekData[0] ? weekData[0].proteinGoal || 160 : 160]));
    var n = days.length;
    var barGroupW = chartW / n;
    var barW = barGroupW * 0.28;

    // Grid lines
    ctx.strokeStyle = C.border;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    for (var i = 0; i <= 4; i++) {
      var y = padT + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + chartW, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Y axis labels
    ctx.fillStyle = C.muted;
    ctx.font = '500 11px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (var i = 0; i <= 4; i++) {
      var val = Math.round(maxProtein * (1 - i / 4));
      var y = padT + (chartH / 4) * i;
      ctx.fillText(val + 'g', padL - 8, y + 4);
    }

    // Protein bars
    for (var i = 0; i < proteinData.length; i++) {
      var x = padL + i * barGroupW + barGroupW * 0.08;
      var bH = ((proteinData[i] / maxProtein) * chartH) * progress;
      var y = padT + chartH - bH;
      var grad = ctx.createLinearGradient(0, y, 0, padT + chartH);
      grad.addColorStop(0, C.orange);
      grad.addColorStop(1, 'rgba(255,107,53,0.2)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, barW, bH, [4, 4, 0, 0]);
      } else {
        ctx.rect(x, y, barW, bH);
      }
      ctx.fill();
    }

    // Score line
    var scoreMax = 100;
    var linePoints = scoreData.map(function(val, i) {
      return {
        x: padL + i * barGroupW + barGroupW / 2,
        y: padT + chartH - (val / scoreMax) * chartH * progress,
      };
    });

    ctx.strokeStyle = C.purple;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (var i = 0; i < linePoints.length; i++) {
      var pt = linePoints[i];
      if (i === 0) {
        ctx.moveTo(pt.x, pt.y);
      } else {
        var prev = linePoints[i - 1];
        var cpX = (prev.x + pt.x) / 2;
        ctx.bezierCurveTo(cpX, prev.y, cpX, pt.y, pt.x, pt.y);
      }
    }
    ctx.stroke();

    // Score dots
    for (var i = 0; i < linePoints.length; i++) {
      var pt = linePoints[i];
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = C.purple;
      ctx.fill();
      ctx.strokeStyle = document.documentElement.getAttribute('data-theme') === 'light' ? '#ffffff' : '#1a2235';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Water bars
    var waterMax = Math.max.apply(null, waterData.concat([weekData[0] ? weekData[0].waterGoal || 3 : 3]));
    for (var i = 0; i < waterData.length; i++) {
      var x = padL + i * barGroupW + barGroupW * 0.44;
      var bH = ((waterData[i] / waterMax) * chartH * 0.7) * progress;
      var y = padT + chartH - bH;
      var grad = ctx.createLinearGradient(0, y, 0, padT + chartH);
      grad.addColorStop(0, C.blue);
      grad.addColorStop(1, 'rgba(76,155,255,0.15)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, barW, bH, [4, 4, 0, 0]);
      } else {
        ctx.rect(x, y, barW, bH);
      }
      ctx.fill();
    }

    // X axis labels
    ctx.fillStyle = C.text;
    ctx.font = '500 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    for (var i = 0; i < days.length; i++) {
      var x = padL + i * barGroupW + barGroupW / 2;
      var isToday = weekData[i] && weekData[i].isToday;
      if (isToday) {
        ctx.fillStyle = C.orange;
        ctx.font = '700 12px Inter, sans-serif';
      } else {
        ctx.fillStyle = C.text;
        ctx.font = '500 12px Inter, sans-serif';
      }
      ctx.fillText(days[i], x, H - padB + 18);
      if (isToday) {
        ctx.beginPath();
        ctx.arc(x, H - padB + 28, 3, 0, Math.PI * 2);
        ctx.fillStyle = C.orange;
        ctx.fill();
      }
    }
  };

  window.WeeklyChart = WeeklyChart;

})();
