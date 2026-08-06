/* ==========================================================================
   Particles.js — Анимированные частицы внутри карточки-героя (hero-box)
   ========================================================================== */
(function() {
  function initParticles(containerId, options) {
    options = options || {};
    var container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
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
    
    // Вставляем холст первым ребенком
    container.insertBefore(canvas, container.firstChild);

    // Убедимся, что контент внутри контейнера поднят выше canvas
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

    function resize() {
      w = container.offsetWidth;
      h = container.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.scale(dpr, dpr);
      createParticles();
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

    function animate() {
      ctx.clearRect(0, 0, w, h);
      circles.forEach(function(c) {
        c.x += c.dx;
        c.y += c.dy;

        // Отталкивание от мыши
        var mdx = c.x - mouse.x;
        var mdy = c.y - mouse.y;
        var dist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (dist < 100) {
          var force = (100 - dist) / 100;
          c.x += (mdx / dist) * force * 1.5;
          c.y += (mdy / dist) * force * 1.5;
        }

        // Границы контейнера
        if (c.x < 0) c.x = w;
        if (c.x > w) c.x = 0;
        if (c.y < 0) c.y = h;
        if (c.y > h) c.y = 0;

        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + c.alpha + ')';
        ctx.fill();
      });
      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
  }

  window.initParticles = initParticles;
})();
