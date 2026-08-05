/* ---------- Дровер рецептов (боковое окно) ---------- */
(function() {
  function injectDrawerHTML() {
    if (typeof document === 'undefined' || document.getElementById('drawer-backdrop')) return;
    var div = document.createElement('div');
    div.id = 'drawer-backdrop';
    div.className = 'drawer-backdrop';
    div.innerHTML =
      '<aside class="drawer" id="drawer">' +
        '<header class="drawer-h">' +
          '<div id="drawer-head-content"></div>' +
          '<button class="drawer-close" id="drawer-close-btn" aria-label="Закрыть">×</button>' +
        '</header>' +
        '<div class="drawer-body" id="drawer-body-content"></div>' +
      '</aside>';
    document.body.appendChild(div);

    var closeBtn = document.getElementById('drawer-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeRecipeDrawer);

    document.addEventListener('pointerdown', function (e) {
      var drawerBackdrop = document.getElementById('drawer-backdrop');
      if (!drawerBackdrop || !drawerBackdrop.classList.contains('active')) return;
      var drawer = document.getElementById('drawer');
      if (drawer && !drawer.contains(e.target) && !e.target.closest('.rec-card-compact') && !e.target.closest('a[href*="#"]')) {
        closeRecipeDrawer();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeRecipeDrawer();
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectDrawerHTML);
    } else {
      injectDrawerHTML();
    }
  }
})();

var root = typeof window !== 'undefined' ? window : global;

root.openRecipeDrawer = function(id) {
  if (!id || typeof BY_ID === 'undefined' || !BY_ID[id]) return;
  root.currentDrawerId = id;
  var d = BY_ID[id];
  var mName = (typeof MEALS !== 'undefined' ? MEALS.find(function (x) { return x.key === d.meal; }) : null) || {};
  mName = mName.name || '';
  var keep = d.keepText ? d.keepText : 'до ' + d.keep + ' ' + (typeof plural === 'function' ? plural(d.keep, 'день') : 'дней');

  var inPlan = typeof isDishInPlan === 'function' ? isDishInPlan(d.id, d.meal) : false;

  if (typeof document !== 'undefined') {
    var headEl = document.getElementById('drawer-head-content');
    if (headEl) {
      headEl.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap">' +
          '<div>' +
            '<span class="badge ' + d.meal + '">' + esc(mName) + '</span>' +
            '<h2 style="margin-top:6px">' + esc(d.name) + '</h2>' +
            '<p class="rec-card-meta" style="margin-top:6px">Время приготовления: ' + esc(d.time) + ' · Хранение: ' + esc(keep) + '</p>' +
          '</div>' +
          '<button class="btn ' + (inPlan ? 'btn-in-plan' : 'btn-solid') + '" id="drawer-add-plan-btn" onclick="addDishToCurrentPlan(\'' + d.id + '\')">' +
            (inPlan ? '✓ В вашем плане' : '+ Добавить в план') +
          '</button>' +
        '</div>';
    }

    var drawerImgHTML = d.img ? '<div class="drawer-img-box"><img src="' + esc(d.img) + '" alt="' + esc(d.name) + '" class="drawer-img" onerror="this.parentNode.style.display=\'none\'"></div>' : '';

    var defaultPortions = 4;
    var optionsHTML = '';
    for (var p = 1; p <= 10; p++) {
      optionsHTML += '<option value="' + p + '"' + (p === defaultPortions ? ' selected' : '') + '>' + p + '</option>';
    }

    var bodyEl = document.getElementById('drawer-body-content');
    if (bodyEl) {
      bodyEl.innerHTML =
        drawerImgHTML +
        '<div class="rec-cal-wrap" style="background:var(--frost); padding:16px; border-radius:4px; text-align:left; font-size:13px">' +
          '<div><b>1 порция:</b> ' + d.mac.p + ' Б / ' + d.mac.f + ' Ж / ' + d.mac.c + ' У · ' + (d.fib||0) + ' клетчатки · ' + d.mac.kcal + ' ккал</div>' +
        '</div>' +
        '<div class="rec-ing">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:14px">' +
            '<p class="rec-sub" style="margin:0">Ингредиенты · на <span id="drawer-portion-label">' + defaultPortions + ' ' + (typeof plural === 'function' ? plural(defaultPortions, 'порцию') : 'порций') + '</span></p>' +
            '<div style="display:flex; align-items:center; gap:6px">' +
              '<label for="drawer-portion-select" style="font-family:var(--mono); font-size:11px; color:var(--slate)">Порций:</label>' +
              '<select id="drawer-portion-select" style="font-family:var(--body); font-size:13px; font-weight:600; padding:3px 8px; border:1px solid var(--line); border-radius:4px; background:#fff; color:var(--brine); cursor:pointer" onchange="renderDrawerIngredients(\'' + d.id + '\', parseInt(this.value, 10))">' +
                optionsHTML +
              '</select>' +
            '</div>' +
          '</div>' +
          '<ul class="ing" id="drawer-ing-list"></ul>' +
          ((d.tags || []).length ? '<div class="tags" style="margin-top:14px">' + d.tags.map(function (t) {
            return '<span class="tag">' + esc(typeof TAGS !== 'undefined' && TAGS[t] ? TAGS[t] : t) + '</span>';
          }).join('') + '</div>' : '') +
        '</div>' +
        '<div class="rec-steps">' +
          '<p class="rec-sub">Инструкция приготовления · ' + esc(d.time) + '</p>' +
          '<ol>' + d.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' +
          (d.note ? '<div class="note">' + d.note + '</div>' : '') +
        '</div>';
    }

    renderDrawerIngredients(d.id, defaultPortions);

    var backdrop = document.getElementById('drawer-backdrop');
    if (backdrop) backdrop.classList.add('active');
  }
};

root.renderDrawerIngredients = function(dishId, targetPortions) {
  if (typeof BY_ID === 'undefined' || !BY_ID[dishId]) return;
  var d = BY_ID[dishId];
  var basePortions = d.portions || 4;
  var scale = targetPortions / basePortions;

  var html = d.ing.map(function (i) {
    var valStr = '';
    if (i.q !== null && i.q !== undefined) {
      var scaledQ = Math.round(i.q * scale * 10) / 10;
      valStr = typeof fmtQty === 'function' ? fmtQty(scaledQ, i.u) : scaledQ + ' ' + i.u;
    } else {
      valStr = i.d ? esc(i.d) : 'по вкусу';
    }
    return '<li>' + esc(i.n) + '<em>' + valStr + '</em></li>';
  }).join('');

  if (typeof document !== 'undefined') {
    var ingList = document.getElementById('drawer-ing-list');
    if (ingList) ingList.innerHTML = html;

    var portionLabel = document.getElementById('drawer-portion-label');
    if (portionLabel) portionLabel.textContent = targetPortions + ' ' + (typeof plural === 'function' ? plural(targetPortions, 'порцию') : 'порций');
  }
};

root.closeRecipeDrawer = function() {
  if (typeof document !== 'undefined') {
    var drawerBackdrop = document.getElementById('drawer-backdrop');
    if (drawerBackdrop) drawerBackdrop.classList.remove('active');
  }
};

if (typeof document !== 'undefined') {
  // Перехват кликов по всем ссылкам на рецепты на любой странице
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a[href*="#"]');
    if (a) {
      var parts = a.getAttribute('href').split('#');
      var dishId = parts[1];
      if (dishId && typeof BY_ID !== 'undefined' && BY_ID[dishId]) {
        e.preventDefault();
        openRecipeDrawer(dishId);
      }
    }
  });
}
