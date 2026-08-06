/* ==========================================================================
   Particles.js — Анимированные частицы внутри карточки-героя (hero-box)
   С точно исправленным позиционированием, масштабированием и поддержкой DPI
   ========================================================================== */
(function() {
  var STORAGE_KEY = 'particles_state_v2';

  function initParticles(containerId, options) {
    options = options || {};
    var container = null;
    if (typeof containerId === 'string') {
      container = document.getElementById(containerId);
    } else if (containerId && containerId.nodeType) {
      container = containerId;
    }
    if (!container) {
      container = document.getElementById('hero-box') || document.querySelector('.hero-box');
    }
    if (!container) return;

    var color = options.color || '#146C7E';
    var quantity = options.quantity || 50;
    var size = options.size || 1.3;

    var canvas = document.createElement('canvas');
    canvas.className = 'particles-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';

    if (window.getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }

    container.insertBefore(canvas, container.firstChild);

    Array.prototype.forEach.call(container.children, function(child) {
      if (child !== canvas && window.getComputedStyle(child).zIndex === 'auto') {
        child.style.position = 'relative';
        child.style.zIndex = '1';
      }
    });

    var ctx = canvas.getContext('2d');
    var circles = [];
    var mouse = { x: -1000, y: -1000 };
    var dpr = window.devicePixelRatio || 1;
    var w = 0, h = 0;

    function hexToRgb(hex) {
      hex = hex.replace('#', '');
      if (hex.length === 3) hex = hex.split('').map(function(c) { return c + c; }).join('');
      var num = parseInt(hex, 16) || 0;
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    }

    var rgb = hexToRgb(color);

    function loadSavedParticles() {
      try {
        var raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        var data = JSON.parse(raw);
        if (!data || !data.circles || !Array.isArray(data.circles) || data.circles.length !== quantity) return false;
        
        var elapsed = (Date.now() - (data.time || Date.now())) / 1000;
        if (elapsed > 15) return false;

        var frames = Math.min(elapsed * 60, 300);

        circles = data.circles.map(function(c) {
          // Восстанавливаем абсолютные координаты из относительных (0..1)
          var cx = (c.nx !== undefined ? c.nx : 0.5) * w;
          var cy = (c.ny !== undefined ? c.ny : 0.5) * h;
          cx += c.dx * frames;
          cy += c.dy * frames;

          // Мягкий обёртывающий диапазон с запасом для краев
          var pad = 25;
          if (w > 0) cx = (((cx + pad) % (w + pad * 2)) + (w + pad * 2)) % (w + pad * 2) - pad;
          if (h > 0) cy = (((cy + pad) % (h + pad * 2)) + (h + pad * 2)) % (h + pad * 2) - pad;

          return {
            x: cx, y: cy, size: c.size, alpha: c.alpha, dx: c.dx, dy: c.dy
          };
        });
        return true;
      } catch (e) {
        return false;
      }
    }

    function saveParticles() {
      if (!circles || !circles.length || w <= 0 || h <= 0) return;
      try {
        var data = {
          time: Date.now(),
          circles: circles.map(function(c) {
            return {
              nx: c.x / w,
              ny: c.y / h,
              size: c.size,
              alpha: c.alpha,
              dx: c.dx,
              dy: c.dy
            };
          })
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {}
    }

    function resize() {
      var rect = container.getBoundingClientRect();
      var newW = Math.max(1, Math.round(container.clientWidth || rect.width || 300));
      var newH = Math.max(1, Math.round(container.clientHeight || rect.height || 210));

      dpr = window.devicePixelRatio || 1;
      var firstResize = (w === 0 && h === 0);

      w = newW;
      h = newH;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';

      // Абсолютная установка матрицы трансформации вместо накопительного scale()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (firstResize) {
        if (!loadSavedParticles()) {
          createParticles();
        }
      }
    }

    function createParticles() {
      circles = [];
      for (var i = 0; i < quantity; i++) {
        circles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 2 + size,
          alpha: Math.random() * 0.4 + 0.15,
          dx: (Math.random() - 0.5) * 0.4,
          dy: (Math.random() - 0.5) * 0.4
        });
      }
    }

    container.addEventListener('mousemove', function(e) {
      var rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    container.addEventListener('mouseleave', function() {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    var lastSaveTime = 0;

    function animate() {
      ctx.clearRect(0, 0, w, h);

      var pad = 25; // Запас вылета частиц за края карточки
      circles.forEach(function(c) {
        c.x += c.dx;
        c.y += c.dy;

        var mdx = c.x - mouse.x;
        var mdy = c.y - mouse.y;
        var dist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (dist < 100) {
          var force = (100 - dist) / 100;
          c.x += (mdx / dist) * force * 1.5;
          c.y += (mdy / dist) * force * 1.5;
        }

        // Мягкий переход через внешние границы карточки
        if (c.x < -pad) c.x = w + pad;
        if (c.x > w + pad) c.x = -pad;
        if (c.y < -pad) c.y = h + pad;
        if (c.y > h + pad) c.y = -pad;

        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + c.alpha + ')';
        ctx.fill();
      });

      var now = Date.now();
      if (now - lastSaveTime > 300) {
        lastSaveTime = now;
        saveParticles();
      }

      requestAnimationFrame(animate);
    }

    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function() {
        resize();
      });
      ro.observe(container);
    }

    window.addEventListener('beforeunload', saveParticles);
    window.addEventListener('pagehide', saveParticles);
    window.addEventListener('resize', resize);
    resize();
    animate();
  }

  window.initParticles = initParticles;
})();
