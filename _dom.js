/* Временный харнесс: гоняет инлайновые скрипты страниц в vm с заглушкой DOM. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const DIR = __dirname;
const R = f => fs.readFileSync(path.join(DIR, f), 'utf8');

let fails = 0, checks = 0;
function ok(name, cond, extra) {
  checks++;
  if (!cond) { fails++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

/* ---------- заглушка DOM ---------- */
function makeEl(id) {
  const el = {
    id, _html: '', _text: '', value: '', checked: false, dataset: {},
    classList: { _s: {}, add(c) { this._s[c] = 1; }, remove(c) { delete this._s[c]; },
                 toggle(c, on) { on ? this.add(c) : this.remove(c); },
                 contains(c) { return !!this._s[c]; } },
    style: {}, children: [],
    get innerHTML() { return this._html; },
    set innerHTML(v) { this._html = String(v); },
    get textContent() { return this._text; },
    set textContent(v) { this._text = String(v); },
    addEventListener() {}, removeEventListener() {}, appendChild() {},
    setAttribute() {}, getAttribute() { return null; }, focus() {}, click() {},
    querySelectorAll() { return []; }, querySelector() { return null; },
    scrollIntoView() {}, closest() { return null; }, remove() {}
  };
  return el;
}
function makeDoc() {
  const els = {};
  return {
    _els: els,
    getElementById(id) { return els[id] || (els[id] = makeEl(id)); },
    querySelectorAll() { return []; },
    querySelector() { return null; },
    createElement(t) { return makeEl('<' + t + '>'); },
    addEventListener() {},
    body: makeEl('body'),
    documentElement: makeEl('html')
  };
}
function makeStore() {
  const m = {};
  return { getItem: k => (k in m ? m[k] : null),
           setItem: (k, v) => { m[k] = String(v); },
           removeItem: k => { delete m[k]; }, _m: m };
}

/* ---------- база: data.js + блюда + app.js ---------- */
function baseCtx(doc, store) {
  const ctx = vm.createContext({
    console, document: doc, localStorage: store,
    window: { addEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {} }) },
    alert(m) { ctx.__alerts.push(m); }, confirm: () => true,
    setTimeout, clearTimeout, Date, Math, JSON, Object, Array, String, Number, isNaN, parseInt, parseFloat
  });
  ctx.__alerts = [];
  ['data.js', 'dishes-b.js', 'dishes-l.js', 'dishes-d.js', 'dishes-n.js', 'app.js']
    .forEach(f => vm.runInContext(R(f), ctx, { filename: f }));
  return ctx;
}
function inline(file) {
  const html = R(file);
  const m = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)];
  return m.map(x => x[1]).join('\n');
}

/* ================= 1. данные ================= */
console.log('\n== data ==');
const c0 = baseCtx(makeDoc(), makeStore());
const g = k => vm.runInContext(k, c0);
const DISHES = g('DISHES'), MEALS = g('MEALS'), PROFILE = g('PROFILE');
const byMeal = {};
MEALS.forEach(m => byMeal[m.key] = DISHES.filter(d => d.meal === m.key));
console.log('  блюд: ' + DISHES.length + ' — ' +
  MEALS.map(m => m.short + ' ' + byMeal[m.key].length).join(', '));
ok('4 приёма', MEALS.length === 4);
ok('75 блюд', DISHES.length === 75, DISHES.length);
ok('>=20 завтраков', byMeal.b.length >= 20, byMeal.b.length);
ok('>=20 обедов', byMeal.l.length >= 20, byMeal.l.length);
ok('>=20 ужинов', byMeal.d.length >= 20, byMeal.d.length);
ok('перед сном есть', byMeal.n.length >= 8, byMeal.n.length);

/* уникальность id */
const ids = {};
DISHES.forEach(d => { ids[d.id] = (ids[d.id] || 0) + 1; });
const dupIds = Object.keys(ids).filter(k => ids[k] > 1);
ok('id уникальны', !dupIds.length, dupIds.join(','));

/* обязательные поля + энергия */
let badMac = [], badFld = [], badUnit = [], badCan = [];
DISHES.forEach(d => {
  if (!d.id || !d.name || !d.short || !d.meal || !d.mac || !d.ing || !d.steps || !d.portions)
    badFld.push(d.id || d.name);
  const e = 4 * d.mac.p + 9 * d.mac.f + 4 * d.mac.c + 2 * (d.fib || 0);
  if (Math.abs(e - d.mac.kcal) > Math.max(30, d.mac.kcal * 0.05))
    badMac.push(d.id + ' ' + d.mac.kcal + '≠' + Math.round(e));
  (d.ing || []).forEach(i => {
    if (i.u === 'банка') badCan.push(d.id + '/' + i.n);
    if (!i.n || i.q === undefined || !i.u) badUnit.push(d.id + '/' + (i.n || '?'));
  });
});
ok('поля на месте', !badFld.length, badFld.slice(0, 4).join(', '));
ok('ккал сходятся', !badMac.length, badMac.slice(0, 4).join(' | '));
ok('нет u:банка', !badCan.length, badCan.slice(0, 3).join(', '));
ok('ингредиенты полные', !badUnit.length, badUnit.slice(0, 3).join(', '));

/* инвариант агрегации: один продукт — одна единица */
const unitsOf = {};
DISHES.forEach(d => (d.ing || []).forEach(i => {
  (unitsOf[i.n] = unitsOf[i.n] || {})[i.u] = 1;
}));
const mixed = Object.keys(unitsOf).filter(n => Object.keys(unitsOf[n]).length > 1)
  .map(n => n + '[' + Object.keys(unitsOf[n]).join('/') + ']');
ok('единицы не смешаны', !mixed.length, mixed.slice(0, 5).join(', '));

/* полки существуют */
const AISLES = g('AISLES');
const badAisle = [];
DISHES.forEach(d => (d.ing || []).forEach(i => {
  if (i.a && AISLES.indexOf(i.a) < 0) badAisle.push(d.id + '/' + i.a);
}));
ok('полки известны', !badAisle.length, [...new Set(badAisle)].slice(0, 4).join(', '));

/* теги известны */
const TAGS = g('TAGS'), badTag = [];
DISHES.forEach(d => (d.tags || []).forEach(t => { if (!TAGS[t]) badTag.push(d.id + '/' + t); }));
ok('теги известны', !badTag.length, [...new Set(badTag)].slice(0, 4).join(', '));

/* ================= 2. helpers app.js ================= */
console.log('\n== app.js ==');
const mkPlan = pick => {
  const p = {};
  MEALS.forEach(m => p[m.key] = [0, 1, 2, 3, 4].map(i => pick(m.key, i)));
  return p;
};
vm.runInContext('__full = ' + JSON.stringify(
  mkPlan((k, i) => byMeal[k][i % byMeal[k].length].id)), c0);
const dc = vm.runInContext('dayCheck(__full, 0)', c0);
ok('dayCheck.totals', dc && dc.totals && typeof dc.totals.fib === 'number');
ok('dayCheck.full', dc.full === true);
const wc = vm.runInContext('weekCheck(__full)', c0);
ok('weekCheck.totals', wc && wc.totals && typeof wc.totals.filled === 'number');
ok('weekCheck.full', wc.full === true);
ok('weekCheck.plants строка', typeof wc.plants === 'string', String(wc.plants));
ok('weekCheck.fish строка', typeof wc.fish === 'string', String(wc.fish));
ok('filled = 20', wc.totals.filled === 20, wc.totals.filled);

const sa = vm.runInContext('suggestAddons(dayTotals(__full,0), 0)', c0);
ok('suggestAddons.items массив', Array.isArray(sa.items));
ok('suggestAddons.sum', sa.items.length === 0 || (sa.sum && typeof sa.sum.kcal === 'number'));
if (sa.items.length) ok('addon.n / addon.q', sa.items.every(x => x.n && x.q !== undefined));

/* агрегация закупки */
const agg = vm.runInContext('aggregate(planRuns(__full)[0] ? planRuns(__full)[0].dishes : [])', c0);
ok('aggregate работает', agg !== undefined && agg !== null);

/* плюрализация */
['порция', 'порцию', 'приём', 'заход', 'партия', 'день', 'блюдо'].forEach(w => {
  const r = [1, 2, 5].map(n => vm.runInContext('plural(' + n + ', ' + JSON.stringify(w) + ')', c0));
  ok('plural ' + w, r.every(x => x && x !== 'undefined'), r.join('/'));
});

/* ================= 3. страницы ================= */
function runPage(file, extra) {
  console.log('\n== ' + file + ' ==');
  const doc = makeDoc(), store = makeStore();
  if (extra && extra.store) Object.assign(store._m, extra.store);
  const ctx = baseCtx(doc, store);
  ctx.location = { hash: '', search: '' };
  try {
    vm.runInContext(inline(file), ctx, { filename: file });
  } catch (e) {
    fails++; checks++;
    console.log('  FAIL исполнение — ' + e.message);
    return null;
  }
  ok(file + ' исполнился', true);
  return { doc, ctx, store };
}

/* --- index.html --- */
const ix = runPage('index.html');
if (ix) {
  const cards = ix.doc._els.list ? ix.doc._els.list.innerHTML : '';
  ok('index: карточки есть', cards.length > 2000, cards.length + ' симв.');
  const shown = (cards.match(/class="card/g) || []).length;
  ok('index: 75 карточек', shown === 75, shown);
  MEALS.forEach(m => ok('index: бейдж ' + m.short, cards.indexOf(m.name) > -1));
  ok('index: нет undefined', cards.indexOf('undefined') === -1);
}

/* --- plan.html --- */
const pl = runPage('plan.html');
if (pl) {
  const E = pl.doc._els;
  ok('plan: сетка', E.grid && E.grid.innerHTML.indexOf('<select') > -1);
  const sels = (E.grid.innerHTML.match(/<select/g) || []).length;
  ok('plan: 20 селектов', sels === 20, sels);
  ok('plan: итоги', E.tot && E.tot.innerHTML.indexOf('Приёмов заполнено') > -1);
  const cells = (E.tot.innerHTML.match(/<div><span>/g) || []).length;
  ok('plan: 6 плиток', cells === 6, cells);
  ok('plan: 20 / 20', E.tot.innerHTML.indexOf('20 / 20') > -1);
  ok('plan: план собран', E.tot.innerHTML.indexOf('план собран') > -1);
  ok('plan: цвета есть', /class="g-(ok|low|high)"/.test(E.tot.innerHTML));
  ok('plan: нет partial при 20/20', E.tot.innerHTML.indexOf('g-partial') === -1);
  ok('plan: заготовка в подписи', E.tot.innerHTML.indexOf('заготовка') > -1);
  for (let d = 0; d < 5; d++) {
    ok('plan: футер д' + (d + 1), E['f' + d] && E['f' + d].innerHTML.indexOf('клетчатка') > -1);
    ok('plan: добор д' + (d + 1), E['a' + d] &&
      (E['a' + d].innerHTML.indexOf('Добрать') > -1 ||
       E['a' + d].innerHTML.indexOf('Норма закрыта') > -1),
      E['a' + d] ? E['a' + d].innerHTML.slice(0, 40) : 'нет');
    ok('plan: ккал д' + (d + 1), /\d+ ккал/.test(E['kc' + d]._text), E['kc' + d]._text);
  }
  ok('plan: закупка', E.runs && E.runs.innerHTML.length > 500, E.runs ? E.runs.innerHTML.length : 0);
  ok('plan: заходы', /заход/i.test(E.runs.innerHTML));
  ok('plan: нет "порции" при 1', !/\b1 порции\b/.test(E.runs.innerHTML));
  ok('plan: нет "5 порция"', !/\b5 порция\b/.test(E.runs.innerHTML));
  ['grid', 'tot', 'runs'].forEach(k =>
    ok('plan: нет undefined в #' + k, E[k].innerHTML.indexOf('undefined') === -1));
  ok('plan: нет NaN', !/NaN/.test(E.grid.innerHTML + E.tot.innerHTML + E.runs.innerHTML));
}

/* --- plan.html с пустым планом --- */
const pe = runPage('plan.html', { store: { 'mp-plan': JSON.stringify({ b: ['', '', '', '', ''], l: ['', '', '', '', ''], d: ['', '', '', '', ''], n: ['', '', '', '', ''] }) } });
if (pe) {
  const E = pe.doc._els;
  ok('пустой: 0 / 20', E.tot.innerHTML.indexOf('0 / 20') > -1);
  ok('пустой: серым', E.tot.innerHTML.indexOf('g-partial') > -1);
  ok('пустой: прочерки', (E.tot.innerHTML.match(/>—</g) || []).length >= 3);
  ok('пустой: день пуст', E.f0.innerHTML.indexOf('день пуст') > -1);
  ok('пустой: без добора', E.a0.innerHTML === '', E.a0.innerHTML.slice(0, 30));
  ok('пустой: нет NaN', !/NaN/.test(E.tot.innerHTML + E.f0.innerHTML));
}

/* --- plan.html с битым localStorage --- */
const pb = runPage('plan.html', { store: { 'mp-plan': '{"b":[1,null],"l":"нет"}' } });
if (pb) ok('битый план не ломает', pb.doc._els.grid.innerHTML.indexOf('<select') > -1);

/* --- calendar.html --- */
const cd = runPage('calendar.html');
if (cd) {
  const E = cd.doc._els;
  ok('cal: сетка месяца', E.cal && E.cal.innerHTML.indexOf('class="cell') > -1);
  ok('cal: панель дня', E.day && E.day.innerHTML.indexOf('<select') > -1);
  const sels = (E.day.innerHTML.match(/<select/g) || []).length;
  ok('cal: 4 селекта', sels === 4, sels);
  MEALS.forEach(m => ok('cal: подпись ' + m.short, E.day.innerHTML.indexOf(m.name) > -1));
  ok('cal: 0 / 4', E.day.innerHTML.indexOf('0 / 4') > -1, E.day.innerHTML.slice(-260));
  ok('cal: клетчатка в футере', E.day.innerHTML.indexOf('клетчатки') > -1);
  ok('cal: сводка', E.sum && E.sum.innerHTML.indexOf('Дней спланировано') > -1);
  const tiles = (E.sum.innerHTML.match(/<div><span>/g) || []).length;
  ok('cal: 5 плиток', tiles === 5, tiles);
  ok('cal: клетчатка в сводке', E.sum.innerHTML.indexOf('Клетчатки') > -1);
  ok('cal: нет undefined', (E.cal.innerHTML + E.day.innerHTML + E.sum.innerHTML)
    .indexOf('undefined') === -1);
  ok('cal: нет NaN', !/NaN/.test(E.cal.innerHTML + E.day.innerHTML + E.sum.innerHTML));
}

/* --- calendar.html с заполненным днём --- */
const today = new Date();
const k = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') +
          '-' + String(today.getDate()).padStart(2, '0');
const one = {}; MEALS.forEach(m => one[m.key] = byMeal[m.key][0].id);
const cf = runPage('calendar.html', { store: { 'mp-cal': JSON.stringify({ [k]: one }) } });
if (cf) {
  const E = cf.doc._els;
  ok('cal: 4 / 4', E.day.innerHTML.indexOf('4 / 4') > -1);
  ok('cal: точки', (E.cal.innerHTML.match(/class="mini/g) || []).length > 0);
  ok('cal: точка n', E.cal.innerHTML.indexOf('mini n') > -1, 'фиолетовой точки нет');
  ok('cal: сводка 1 день', E.sum.innerHTML.indexOf('4 / 4') > -1,
    E.sum.innerHTML.replace(/<[^>]+>/g, ' ').slice(0, 120));
}

/* ================= 4. пресет ================= */
console.log('\n== пресет ==');
if (pl) {
  const p = JSON.parse(pl.store.getItem('mp-plan') || 'null') ||
            vm.runInContext('JSON.stringify(plan)', pl.ctx) && JSON.parse(vm.runInContext('JSON.stringify(plan)', pl.ctx));
  vm.runInContext('__p = ' + JSON.stringify(p), c0);
  const w = vm.runInContext('weekCheck(__p)', c0);
  console.log('  растений ' + w.totals.plants + ', рыбы ' + w.totals.fish +
    ', приёмов ' + w.totals.filled);
  ok('пресет: 20 приёмов', w.totals.filled === 20, w.totals.filled);
  ok('пресет: 30 растений', w.totals.plants >= 30, w.totals.plants);
  ok('пресет: рыба >= 2', w.totals.fish >= 2, w.totals.fish);
  let miss = [];
  for (let d = 0; d < 5; d++) {
    const t = vm.runInContext('dayTotals(__p,' + d + ')', c0);
    const a = vm.runInContext('suggestAddons(dayTotals(__p,' + d + '),' + d + ')', c0);
    const s = a.sum || { p: 0, f: 0, c: 0, fib: 0, kcal: 0 };
    const tot = { kcal: t.kcal + s.kcal, p: t.p + s.p, f: t.f + s.f, fib: t.fib + s.fib };
    console.log('  д' + (d + 1) + ' ' + t.kcal + '→' + tot.kcal + ' ккал  б' + tot.p +
      '  ж' + tot.f + '  кл' + tot.fib);
    if (tot.kcal < PROFILE.kcal.min || tot.kcal > PROFILE.kcal.max) miss.push('д' + (d + 1) + ' ккал ' + tot.kcal);
    if (tot.p < PROFILE.p.min || tot.p > PROFILE.p.max) miss.push('д' + (d + 1) + ' Б ' + tot.p);
    if (tot.f > PROFILE.f.max) miss.push('д' + (d + 1) + ' Ж ' + tot.f);
    if (tot.fib < PROFILE.fib.min) miss.push('д' + (d + 1) + ' кл ' + tot.fib);
  }
  ok('пресет: норма с добором (<=1 промах)', miss.length <= 1, miss.join(', '));
}

console.log('\n' + (fails ? 'ПРОВАЛОВ: ' + fails + ' из ' + checks
                          : 'всё чисто: ' + checks + ' проверок'));
process.exit(fails ? 1 : 0);
