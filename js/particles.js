(function() {
  'use strict';

  var canvas, ctx, particles = [], raf = null, dpr = 1;

  function ensureCanvas() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'mddParticles';
    canvas.style.cssText = 'position:fixed;inset:0;z-index:9998;pointer-events:none;';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    var r, g, b;
    if (s === 0) { r = g = b = l; } else {
      var hue2rgb = function(p, q, t) {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  function createParticle(x, y, opts) {
    var angle = opts.angle || (Math.random() * Math.PI * 2);
    var speed = opts.speed || (2 + Math.random() * 4);
    var life = opts.life || (0.6 + Math.random() * 0.8);
    var size = opts.size || (2 + Math.random() * 3);
    var color = opts.color || [56, 189, 248];
    var glow = opts.glow !== false;
    var gravity = opts.gravity || 0.8;
    var trail = opts.trail || 0;

    return {
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (opts.upward ? 2 : 0),
      life: life, maxLife: life,
      size: size, origSize: size,
      color: color,
      glow: glow,
      gravity: gravity,
      drag: opts.drag || 0.98,
      trail: trail,
      prevX: x, prevY: y,
      type: opts.type || 'spark'
    };
  }

  function spawnBurst(x, y, config) {
    ensureCanvas();
    var count = config.count || 20;
    var isMobile = window.innerWidth < 600;
    if (isMobile) count = Math.ceil(count * 0.6);

    for (var i = 0; i < count; i++) {
      var angle = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.5;
      var speed = (config.minSpeed || 2) + Math.random() * ((config.maxSpeed || 6) - (config.minSpeed || 2));
      var life = (config.minLife || 0.5) + Math.random() * ((config.maxLife || 1.2) - (config.minLife || 0.5));
      var size = (config.minSize || 1.5) + Math.random() * ((config.maxSize || 4) - (config.minSize || 1.5));

      var color;
      if (config.colors) {
        color = config.colors[Math.floor(Math.random() * config.colors.length)];
      } else if (config.hueRange) {
        var hue = config.hueRange[0] + Math.random() * (config.hueRange[1] - config.hueRange[0]);
        color = hslToRgb(hue, 90, 60 + Math.random() * 20);
      } else {
        color = [56, 189, 248];
      }

      particles.push(createParticle(x, y, {
        angle: angle,
        speed: speed,
        life: life,
        size: size,
        color: color,
        glow: config.glow !== false,
        gravity: config.gravity !== undefined ? config.gravity : 0.6,
        drag: config.drag || 0.97,
        upward: config.upward,
        trail: config.trail || 0,
        type: config.type || 'spark'
      }));
    }

    if (!raf) tick();
  }

  function tick() {
    if (!ctx || particles.length === 0) {
      if (ctx) ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      raf = null;
      return;
    }

    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    var dt = 1 / 60;
    var alive = [];

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.prevX = p.x;
      p.prevY = p.y;
      p.vy += p.gravity * 60 * dt;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;

      if (p.life <= 0) continue;

      var progress = 1 - (p.life / p.maxLife);
      var alpha = progress < 0.2 ? progress / 0.2 : (1 - (progress - 0.2) / 0.8);
      alpha = Math.max(0, Math.min(1, alpha));
      var size = p.origSize * (1 - progress * 0.5);

      ctx.save();

      if (p.type === 'molten') {
        if (p.glow) {
          ctx.shadowBlur = 12 + size * 2;
          ctx.shadowColor = 'rgba(' + p.color[0] + ',' + p.color[1] + ',' + p.color[2] + ',' + (alpha * 0.6) + ')';
        }

        if (p.trail > 0) {
          ctx.beginPath();
          ctx.moveTo(p.prevX, p.prevY);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = 'rgba(' + p.color[0] + ',' + p.color[1] + ',' + p.color[2] + ',' + (alpha * 0.3) + ')';
          ctx.lineWidth = size * 0.6;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        var coreAlpha = alpha * (0.8 + Math.random() * 0.2);
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + Math.min(255, p.color[0] + 60) + ',' + Math.min(255, p.color[1] + 40) + ',' + Math.min(255, p.color[2]) + ',' + coreAlpha + ')';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,' + Math.min(255, p.color[2] + 100) + ',' + (coreAlpha * 0.9) + ')';
        ctx.fill();

      } else {
        if (p.glow) {
          ctx.shadowBlur = 8 + size;
          ctx.shadowColor = 'rgba(' + p.color[0] + ',' + p.color[1] + ',' + p.color[2] + ',' + (alpha * 0.5) + ')';
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.color[0] + ',' + p.color[1] + ',' + p.color[2] + ',' + alpha + ')';
        ctx.fill();
      }

      ctx.restore();
      alive.push(p);
    }

    particles = alive;
    raf = requestAnimationFrame(tick);
  }

  var PRESETS = {
    xp: function(x, y) {
      spawnBurst(x, y, {
        count: 16,
        minSpeed: 2, maxSpeed: 5,
        minLife: 0.4, maxLife: 0.9,
        minSize: 1.5, maxSize: 3,
        colors: [[34,197,94], [22,163,74], [74,222,128], [134,239,172]],
        gravity: 0.3,
        drag: 0.96,
        type: 'spark'
      });
    },

    achievement: function(x, y) {
      spawnBurst(x, y, {
        count: 35,
        minSpeed: 3, maxSpeed: 8,
        minLife: 0.6, maxLife: 1.4,
        minSize: 2, maxSize: 5,
        colors: [[251,191,36], [245,158,11], [253,224,71], [255,255,200]],
        gravity: 0.5,
        drag: 0.97,
        trail: 1,
        type: 'molten',
        glow: true
      });
      setTimeout(function() {
        spawnBurst(x, y, {
          count: 12,
          minSpeed: 1, maxSpeed: 3,
          minLife: 0.8, maxLife: 1.6,
          minSize: 1, maxSize: 2.5,
          colors: [[255,200,50], [255,160,20], [255,240,150]],
          gravity: -0.3,
          drag: 0.99,
          upward: true,
          type: 'spark'
        });
      }, 100);
    },

    mission: function(x, y) {
      spawnBurst(x, y, {
        count: 24,
        minSpeed: 2, maxSpeed: 6,
        minLife: 0.5, maxLife: 1.1,
        minSize: 2, maxSize: 4,
        colors: [[56,189,248], [14,165,233], [125,211,252], [186,230,253]],
        gravity: 0.4,
        drag: 0.97,
        trail: 1,
        type: 'molten',
        glow: true
      });
    },

    seal: function(x, y) {
      spawnBurst(x, y, {
        count: 30,
        minSpeed: 3, maxSpeed: 7,
        minLife: 0.7, maxLife: 1.3,
        minSize: 2, maxSize: 4.5,
        hueRange: [0, 40],
        gravity: 0.6,
        drag: 0.96,
        trail: 1,
        type: 'molten',
        glow: true
      });
      setTimeout(function() {
        spawnBurst(x, y, {
          count: 15,
          minSpeed: 1, maxSpeed: 4,
          minLife: 0.5, maxLife: 1.0,
          minSize: 1, maxSize: 3,
          colors: [[255,220,100], [255,180,50]],
          gravity: -0.2,
          upward: true,
          drag: 0.98,
          type: 'spark'
        });
      }, 150);
    },

    levelUp: function(x, y) {
      var ring = function(delay, count, speed) {
        setTimeout(function() {
          spawnBurst(x, y, {
            count: count,
            minSpeed: speed - 1, maxSpeed: speed + 2,
            minLife: 0.8, maxLife: 1.5,
            minSize: 2, maxSize: 5,
            colors: [[192,132,252], [168,85,247], [139,92,246], [251,191,36], [255,255,200]],
            gravity: 0.2,
            drag: 0.98,
            trail: 1,
            type: 'molten',
            glow: true
          });
        }, delay);
      };
      ring(0, 20, 4);
      ring(120, 16, 6);
      ring(250, 12, 8);
    },

    export: function(x, y) {
      spawnBurst(x, y, {
        count: 20,
        minSpeed: 2, maxSpeed: 5,
        minLife: 0.5, maxLife: 1.0,
        minSize: 1.5, maxSize: 3.5,
        colors: [[34,197,94], [22,163,74], [251,191,36]],
        gravity: 0.4,
        drag: 0.97,
        trail: 1,
        type: 'molten',
        glow: true
      });
    }
  };

  function fromElement(el, preset) {
    if (!el) return;
    var rect = el.getBoundingClientRect();
    var x = rect.left + rect.width / 2;
    var y = rect.top + rect.height / 2;
    if (PRESETS[preset]) {
      PRESETS[preset](x, y);
    }
  }

  function atCenter(preset) {
    var x = window.innerWidth / 2;
    var y = window.innerHeight / 2;
    if (PRESETS[preset]) {
      PRESETS[preset](x, y);
    }
  }

  window.GN_FX = {
    burst: spawnBurst,
    xp: function(x, y) { PRESETS.xp(x || window.innerWidth / 2, y || window.innerHeight / 3); },
    achievement: function(x, y) { PRESETS.achievement(x || window.innerWidth / 2, y || window.innerHeight / 3); },
    mission: function(x, y) { PRESETS.mission(x || window.innerWidth / 2, y || window.innerHeight / 3); },
    seal: function(x, y) { PRESETS.seal(x || window.innerWidth / 2, y || window.innerHeight / 3); },
    levelUp: function(x, y) { PRESETS.levelUp(x || window.innerWidth / 2, y || window.innerHeight / 3); },
    export: function(x, y) { PRESETS.export(x || window.innerWidth / 2, y || window.innerHeight / 3); },
    fromElement: fromElement,
    atCenter: atCenter
  };
})();
