/* Общая логика: партии, агрегация покупок, хранилище. */

var DAYS = ['День 1', 'День 2', 'День 3', 'День 4', 'День 5'];

/* ---------- хранилище ---------- */
function load(key, fallback) {
  try {
    var raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

/* ---------- количества ---------- */
var COUNTABLE = ['шт.', 'зубч.', 'пучок', 'банка'];

function fmtQty(q, u) {
  if (q === null || q === undefined) return 'по вкусу';
  var n = q;
  /* меньше столовой ложки удобнее читать в чайных */
  if (u === 'ст. л.' && n < 1) return trim(Math.round(n * 3 * 2) / 2) + ' ч. л.';
  if (u === 'ст. л.') n = Math.round(n * 2) / 2;
  if (COUNTABLE.indexOf(u) >= 0) n = Math.ceil(n * 4) / 4;
  if (u === 'г' && n >= 1000) return trim(n / 1000) + ' кг';
  if (u === 'мл' && n >= 1000) return trim(n / 1000) + ' л';
  return trim(n) + (u ? ' ' + plural(n, u) : '');
}
function trim(n) {
  var r = Math.round(n * 100) / 100;
  return String(r).replace('.', ',');
}

/* В рецепте четверть луковицы — честно. В списке покупок нужна целая:
   магазин не продаёт 0,25 шт. */
var PLURAL = {
  'пучок':  ['пучок', 'пучка', 'пучков'],
  'банка':  ['банка', 'банки', 'банок'],
  'блюдо':  ['блюдо', 'блюда', 'блюд'],
  'порция': ['порция', 'порции', 'порций'],
  /* «на 1 порцию» — винительный, отдельная форма от «выход: 1 порция» */
  'порцию': ['порцию', 'порции', 'порций'],
  'день':   ['день', 'дня', 'дней'],
  'вид':    ['вид', 'вида', 'видов'],
  'приём':  ['приём', 'приёма', 'приёмов'],
  'заход':  ['заход', 'захода', 'заходов'],
  'партия': ['партия', 'партии', 'партий']
};
function plural(n, u) {
  var forms = PLURAL[u];
  if (!forms) return u;
  if (n !== Math.floor(n)) return forms[1];   /* 0,5 пучка */
  var d10 = n % 10, d100 = n % 100;
  if (d10 === 1 && d100 !== 11) return forms[0];
  if (d10 >= 2 && d10 <= 4 && (d100 < 10 || d100 >= 20)) return forms[1];
  return forms[2];
}
function fmtBuy(q, u) {
  if (q === null || q === undefined) return 'по вкусу';
  if (COUNTABLE.indexOf(u) >= 0) {
    var n = Math.ceil(q - 0.001);
    return n + ' ' + plural(n, u);
  }
  return fmtQty(q, u);
}

/* ---------- индекс блюд ---------- */
/* Строится здесь, а не в data.js: к моменту загрузки app.js все dishes-*.js
   уже отработали и DISHES заполнен. В data.js массив ещё пустой. */
var BY_ID = {};
DISHES.forEach(function (d) { BY_ID[d.id] = d; });

/* ---------- план → блюда ---------- */
/* plan: { b:[id×5], l:[id×5], d:[id×5], n:[id×5] } */
function planDishes(plan, daysLimit) {
  var maxDays = daysLimit !== undefined ? daysLimit : (typeof load === 'function' ? load('mp-plan-days', 5) : 5);
  var map = {};
  MEALS.forEach(function (m) {
    (plan[m.key] || []).slice(0, maxDays).forEach(function (id, day) {
      if (!id || !BY_ID[id]) return;
      if (!map[id]) map[id] = { dish: BY_ID[id], portions: 0, days: [] };
      map[id].portions++;
      if (map[id].days.indexOf(day) < 0) map[id].days.push(day);
    });
  });
  var list = Object.keys(map).map(function (id) {
    var e = map[id];
    e.batches = Math.ceil(e.portions / e.dish.portions);
    e.firstDay = Math.min.apply(null, e.days);
    e.lastDay = Math.max.apply(null, e.days);
    return e;
  });
  list.sort(function (a, b) {
    if (a.firstDay !== b.firstDay) return a.firstDay - b.firstDay;
    return MEALS.map(function (m) { return m.key; }).indexOf(a.dish.meal) -
           MEALS.map(function (m) { return m.key; }).indexOf(b.dish.meal);
  });
  return list;
}

/* ---------- заходы в магазин: комплект на один день ---------- */
/* Один заход = продукты на один завтрак, один обед, один ужин и один приём
   перед сном. Блюда берём по очереди из четырёх очередей, порядок внутри
   очереди — по дням, так что первый заход закрывает начало недели. */
function makeRuns(list) {
  var queues = MEALS.map(function (m) {
    return list.filter(function (e) { return e.dish.meal === m.key; });
  });
  var longest = Math.max.apply(null, queues.map(function (q) { return q.length; }).concat(0));
  var runs = [];
  for (var i = 0; i < longest; i++) {
    var chunk = [];
    queues.forEach(function (q) { if (q[i]) chunk.push(q[i]); });
    if (!chunk.length) continue;
    var buyBy = Math.min.apply(null, chunk.map(function (e) { return e.firstDay; }));
    runs.push({ n: runs.length + 1, items: chunk, buyBy: buyBy, aisles: aggregate(chunk) });
  }
  return runs;
}

/* ---------- агрегация ингредиентов ---------- */
/* мелкие меры сводим к большим, иначе одно масло попадёт в список дважды */
var UNIT_TO = { 'ч. л.': { u: 'ст. л.', k: 1 / 3 } };

function normUnit(q, u) {
  var c = UNIT_TO[u];
  if (!c || q === null) return { q: q, u: u };
  return { q: q * c.k, u: c.u };
}

function aggregate(entries) {
  var acc = {};
  entries.forEach(function (e) {
    var scale = e.portions / (e.dish.portions || 4);
    e.dish.ing.forEach(function (ing) {
      var nu = normUnit(ing.q, ing.u);
      var key = ing.n + '|' + nu.u;
      if (!acc[key]) acc[key] = { n: ing.n, u: nu.u, a: ing.a,
                                  q: nu.q === null ? null : 0, taste: nu.q === null };
      if (nu.q !== null && acc[key].q !== null) acc[key].q += nu.q * scale;
    });
  });
  var byAisle = {};
  Object.keys(acc).forEach(function (k) {
    var it = acc[k];
    if (!byAisle[it.a]) byAisle[it.a] = [];
    byAisle[it.a].push(it);
  });
  return AISLES.filter(function (a) { return byAisle[a]; }).map(function (a) {
    byAisle[a].sort(function (x, y) { return x.n.localeCompare(y.n, 'ru'); });
    return { name: a, items: byAisle[a] };
  });
}

/* ---------- итоги ---------- */
function dayTotals(plan, day) {
  var t = { p: 0, f: 0, c: 0, fib: 0, kcal: 0, n: 0 };
  MEALS.forEach(function (m) {
    var id = (plan[m.key] || [])[day];
    if (!id || !BY_ID[id]) return;
    var d = BY_ID[id];
    t.p += d.mac.p; t.f += d.mac.f; t.c += d.mac.c; t.kcal += d.mac.kcal;
    t.fib += d.fib || 0;
    t.n++;
  });
  return t;
}
function weekTotals(plan, daysCount) {
  var days = daysCount || (typeof load === 'function' ? load('mp-plan-days', 5) : 5);
  var t = { p: 0, f: 0, c: 0, fib: 0, kcal: 0, n: 0, filled: 0 };
  for (var d = 0; d < days; d++) {
    var x = dayTotals(plan, d);
    t.p += x.p; t.f += x.f; t.c += x.c; t.fib += x.fib; t.kcal += x.kcal;
    t.filled += x.n;
  }
  t.days = days;
  t.plants = countPlants(plan, days);
  t.fish = countFish(plan, days);
  return t;
}

/* Растения считаем по видам за весь план: одно и то же блюдо несколько раз
   даёт столько же видов, сколько один раз. Поэтому Set, а не сумма. */
function countPlants(plan, daysCount) {
  var days = daysCount || (typeof load === 'function' ? load('mp-plan-days', 5) : 5);
  var set = {}, n = 0;
  MEALS.forEach(function (m) {
    (plan[m.key] || []).slice(0, days).forEach(function (id) {
      if (!id || !BY_ID[id]) return;
      (BY_ID[id].pl || []).forEach(function (p) {
        if (!set[p]) { set[p] = 1; n++; }
      });
    });
  });
  return n;
}
/* Жирная рыба — по меткам блюд за выбранную длительность плана. */
function countFish(plan, daysCount) {
  var days = daysCount || (typeof load === 'function' ? load('mp-plan-days', 5) : 5);
  var n = 0;
  MEALS.forEach(function (m) {
    (plan[m.key] || []).slice(0, days).forEach(function (id) {
      if (id && BY_ID[id] && (BY_ID[id].tags || []).indexOf('omega3') >= 0) n++;
    });
  });
  return n;
}
/* Список видов растений с пометкой, из каких блюд они пришли. */
function plantList(plan, daysCount) {
  var days = daysCount || (typeof load === 'function' ? load('mp-plan-days', 5) : 5);
  var set = {};
  MEALS.forEach(function (m) {
    (plan[m.key] || []).slice(0, days).forEach(function (id) {
      if (!id || !BY_ID[id]) return;
      (BY_ID[id].pl || []).forEach(function (p) { set[p] = 1; });
    });
  });
  return Object.keys(set).sort(function (a, b) { return a.localeCompare(b, 'ru'); });
}

/* ---------- попадание в цели ---------- */
/* Возвращает 'low' | 'ok' | 'high' — страницы красят по этому значению. */
function hit(value, goal) {
  if (goal.min !== undefined && value < goal.min) return 'low';
  if (goal.max !== undefined && value > goal.max) return 'high';
  return 'ok';
}
/* Дневные показатели против PROFILE. Плану на неполный день не врём:
   пока заполнены не все приёмы, «мало» — ожидаемо, а не ошибка. */
function dayCheck(plan, day) {
  var t = dayTotals(plan, day);
  var full = t.n === MEALS.length;
  return {
    totals: t, full: full,
    kcal: full ? hit(t.kcal, PROFILE.kcal) : 'partial',
    p:    full ? hit(t.p, PROFILE.p)       : 'partial',
    f:    full ? hit(t.f, PROFILE.f)       : 'partial',
    fib:  full ? hit(t.fib, PROFILE.fib)   : 'partial'
  };
}
function weekCheck(plan, daysCount) {
  var days = daysCount || (typeof load === 'function' ? load('mp-plan-days', 5) : 5);
  var t = weekTotals(plan, days);
  return {
    totals: t,
    full: t.filled === MEALS.length * days,
    plants: hit(t.plants, WEEK_GOALS.plants),
    fish:   hit(t.fish, WEEK_GOALS.fish)
  };
}


/* ---------- добор до нормы ---------- */
/* Заготовка сознательно не закрывает норму целиком: четыре приёма дают
   1900–2200 ккал, остальное добираем перекусами. Здесь жадный подбор.
   seed — номер дня: при равных оценках он сдвигает очередь, иначе все пять
   дней предлагали бы один и тот же картофель. */
function suggestAddons(totals, seed) {
  var target = (PROFILE.kcal.min + PROFILE.kcal.max) / 2;
  var gap = target - totals.kcal;
  if (gap < 80) return { gap: 0, items: [], sum: null };

  var needFib = totals.fib < PROFILE.fib.min;
  var needP   = totals.p   < PROFILE.p.min;
  var fatRoom = PROFILE.f.max - totals.f;   /* сколько жира ещё можно */
  var pRoom   = PROFILE.p.max - totals.p;   /* и сколько белка */

  /* Жир в блюдах уже почти на потолке, поэтому главный критерий — сколько
     калорий добавка даёт на грамм жира. Так на первое место выходят крупы
     и фрукты, а орехи остаются на дни, где жира ещё есть запас. */
  var pool = ADDONS.map(function (x, i) { return { x: x, i: i }; });
  pool.sort(function (a, b) { return score(b) - score(a); });
  function score(e) {
    var x = e.x;
    if (x.f > fatRoom) return -100;
    var s = x.kcal / (x.f + 4);              /* +4, чтобы безжировые не делили на ноль */
    if (needFib) s += x.fib * 2;
    if (needP)   s += x.p / 3;
    if (x.p > pRoom) s -= 15;                /* белка и так хватает */
    /* Округляем до ступени: добавки с близкой отдачей попадают в одну группу,
       и внутри группы порядок задаёт номер дня. Иначе жадный подбор каждый день
       предлагал бы одно и то же, хотя разница между вариантами — доли процента. */
    return Math.round(s / 12) * 12 + ((e.i + (seed || 0)) % ADDONS.length) / ADDONS.length;
  }

  var items = [], sum = { p: 0, f: 0, c: 0, fib: 0, kcal: 0 }, left = gap;
  pool.forEach(function (e) {
    var x = e.x;
    if (left < 70 || items.length >= 6) return;
    if (x.kcal > left + 120) return;         /* не перелетаем цель */
    if (sum.f + x.f > fatRoom) return;
    if (sum.p + x.p > pRoom) return;         /* за верхнюю границу белка не выходим */
    items.push(x);
    sum.p += x.p; sum.f += x.f; sum.c += x.c; sum.fib += x.fib; sum.kcal += x.kcal;
    left -= x.kcal;
  });
  return { gap: Math.round(gap), items: items, sum: items.length ? sum : null };
}

/* ---------- вспомогательное ---------- */
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function dishesFor(mealKey) {
  return DISHES.filter(function (d) { return d.meal === mealKey; });
}
function mealName(key) {
  var m = MEALS.filter(function (x) { return x.key === key; })[0];
  return m ? m.name : '';
}
/* дни блюда в плане: [0,2,4] → «дни 1, 3, 5» */
function dayList(days) {
  var s = days.slice().sort(function (a, b) { return a - b; })
              .map(function (d) { return d + 1; });
  return (s.length === 1 ? 'день ' : 'дни ') + s.join(', ');
}

/* ============================================================
   ЕДИНАЯ СИСТЕМА КАСТОМНЫХ ДИАЛОГОВ И УВЕДОМЛЕНИЙ (MODAL / TOAST)
   ============================================================ */

var customDialogCallback = null;

function injectCustomDialogStyles() {
  if (typeof document === 'undefined' || document.getElementById('custom-dialog-styles')) return;
  var style = document.createElement('style');
  style.id = 'custom-dialog-styles';
  style.textContent =
    '.custom-dialog-backdrop{position:fixed; inset:0; background:rgba(22, 36, 43, 0.45); backdrop-filter:blur(5px); -webkit-backdrop-filter:blur(5px); z-index:9999; display:none; align-items:center; justify-content:center; padding:20px; animation:dialogFadeIn .18s ease-out}' +
    '.custom-dialog-backdrop.active{display:flex}' +
    '@keyframes dialogFadeIn { from{opacity:0; transform:scale(.97)} to{opacity:1; transform:scale(1)} }' +
    '.custom-dialog-box{background:#FFFFFF; border:1px solid var(--line, #DDE4E4); border-radius:12px; padding:28px; width:100%; max-width:440px; box-shadow:0 16px 40px rgba(0,0,0,0.16); display:flex; flex-direction:column; gap:18px}' +
    '.custom-dialog-h{display:flex; justify-content:space-between; align-items:center}' +
    '.custom-dialog-h h3{font-family:var(--disp, sans-serif); font-size:18px; letter-spacing:-.01em; margin:0; color:var(--steel, #16242B)}' +
    '.custom-dialog-close{background:none; border:none; font-size:18px; cursor:pointer; color:var(--slate, #586E78); padding:4px}' +
    '.custom-dialog-close:hover{color:var(--steel, #16242B)}' +
    '.custom-dialog-sub{margin:0; font-size:14.5px; color:var(--slate, #586E78); line-height:1.45}' +
    '.custom-dialog-input{padding:12px 14px; border:2px solid var(--brine, #146C7E); border-radius:6px; font-family:inherit; font-size:15px; width:100%; outline:none; background:#F4F7F6; color:var(--steel, #16242B)}' +
    '.custom-dialog-btns{display:flex; gap:10px; justify-content:flex-end; margin-top:4px}' +
    '.custom-dialog-btns button{min-width:90px; padding:8px 16px; font-size:14px}' +
    '.btn.danger{background:#DC2626; color:#FFFFFF; border-color:#DC2626}' +
    '.btn.danger:hover{background:#B91C1C; border-color:#B91C1C}' +
    '.custom-toast{position:fixed; bottom:28px; right:28px; background:#16242B; color:#FFFFFF; padding:14px 22px; border-radius:8px; font-size:14px; font-weight:500; border-left:4px solid var(--brine, #146C7E); box-shadow:0 8px 24px rgba(0,0,0,0.2); z-index:10000; opacity:0; transform:translateY(12px); transition:.25s ease; pointer-events:none}' +
    '.custom-toast.active{opacity:1; transform:translateY(0)}';
  document.head.appendChild(style);
}

function injectCustomDialogHTML() {
  injectCustomDialogStyles();
  if (typeof document === 'undefined' || document.getElementById('custom-dialog-backdrop')) return;
  var div = document.createElement('div');
  div.className = 'custom-dialog-backdrop';
  div.id = 'custom-dialog-backdrop';
  div.innerHTML =
    '<div class="custom-dialog-box">' +
      '<div class="custom-dialog-h">' +
        '<h3 id="custom-dialog-title">Заголовок</h3>' +
        '<button class="custom-dialog-close" onclick="closeCustomDialog()">✕</button>' +
      '</div>' +
      '<p class="custom-dialog-sub" id="custom-dialog-sub"></p>' +
      '<input type="text" class="custom-dialog-input" id="custom-dialog-input">' +
      '<div class="custom-dialog-btns">' +
        '<button class="btn" id="custom-dialog-cancel" onclick="closeCustomDialog()">Отмена</button>' +
        '<button class="btn btn-solid" id="custom-dialog-ok" onclick="submitCustomDialog()">ОК</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(div);

  div.addEventListener('click', function(e) {
    if (e.target === div) closeCustomDialog();
  });

  document.addEventListener('keydown', function(e) {
    if (!div.classList.contains('active')) return;
    if (e.key === 'Enter') submitCustomDialog();
    if (e.key === 'Escape') closeCustomDialog();
  });
}

function showCustomPrompt(opts) {
  var backdrop = document.getElementById('custom-dialog-backdrop');
  if (!backdrop) injectCustomDialogHTML();
  backdrop = document.getElementById('custom-dialog-backdrop');

  document.getElementById('custom-dialog-title').textContent = opts.title || 'Ввод данных';
  document.getElementById('custom-dialog-sub').textContent = opts.subtitle || '';

  var input = document.getElementById('custom-dialog-input');
  input.style.display = 'block';
  input.value = opts.defaultValue || '';

  var cancelBtn = document.getElementById('custom-dialog-cancel');
  if (cancelBtn) cancelBtn.style.display = 'inline-block';

  var okBtn = document.getElementById('custom-dialog-ok');
  okBtn.textContent = opts.confirmText || 'ОК';
  okBtn.className = 'btn btn-solid';

  customDialogCallback = opts.onConfirm || null;
  backdrop.classList.add('active');
  setTimeout(function() { input.focus(); input.select(); }, 50);
}

function showCustomConfirm(opts) {
  var backdrop = document.getElementById('custom-dialog-backdrop');
  if (!backdrop) injectCustomDialogHTML();
  backdrop = document.getElementById('custom-dialog-backdrop');

  document.getElementById('custom-dialog-title').textContent = opts.title || 'Подтверждение';
  document.getElementById('custom-dialog-sub').textContent = opts.subtitle || '';

  var input = document.getElementById('custom-dialog-input');
  input.style.display = 'none';

  var cancelBtn = document.getElementById('custom-dialog-cancel');
  if (cancelBtn) cancelBtn.style.display = opts.hideCancel ? 'none' : 'inline-block';

  var okBtn = document.getElementById('custom-dialog-ok');
  okBtn.textContent = opts.confirmText || 'Да';
  okBtn.className = 'btn btn-solid' + (opts.isDanger ? ' danger' : '');

  customDialogCallback = opts.onConfirm || null;
  backdrop.classList.add('active');
}

function showCustomAlert(title, subtitle) {
  showCustomConfirm({
    title: title || 'Уведомление',
    subtitle: subtitle || '',
    confirmText: 'Понятно',
    hideCancel: true,
    onConfirm: null
  });
}

function closeCustomDialog() {
  var backdrop = document.getElementById('custom-dialog-backdrop');
  if (backdrop) backdrop.classList.remove('active');
  customDialogCallback = null;
}

function submitCustomDialog() {
  var input = document.getElementById('custom-dialog-input');
  var val = input.style.display !== 'none' ? input.value.trim() : true;
  var cb = customDialogCallback;
  closeCustomDialog();
  if (cb) cb(val);
}

function showCustomToast(msg) {
  injectCustomDialogStyles();
  var toast = document.getElementById('custom-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.id = 'custom-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = '✓ ' + msg;
  toast.classList.add('active');
  setTimeout(function() { toast.classList.remove('active'); }, 2800);
}


