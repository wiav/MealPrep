/* Временный харнесс проверки. Удаляется после прогона. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const dir = __dirname;

const ctx = { console, Math, JSON, Object, Array, String, Number, Date, parseFloat, parseInt,
  localStorage: { getItem: () => null, setItem: () => {} } };
vm.createContext(ctx);

const files = ['data.js', 'dishes-b.js', 'dishes-l.js', 'dishes-d.js', 'dishes-n.js', 'app.js'];
files.forEach(f => {
  const p = path.join(dir, f);
  if (!fs.existsSync(p)) { console.log('  пропущен (нет файла): ' + f); return; }
  vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f });
});

/* const в data.js не попадает в globalThis контекста (в отличие от var),
   поэтому вытаскиваем значения выражением внутри самого контекста. */
const g = k => vm.runInContext(k, ctx);
const D = g('DISHES'), MEALS = g('MEALS'), PROFILE = g('PROFILE'),
      TAGS = g('TAGS'), AISLES = g('AISLES');
let bad = 0;
const err = m => { console.log('  ОШИБКА: ' + m); bad++; };

console.log('\n=== количество блюд по разделам ===');
MEALS.forEach(m => {
  const n = D.filter(d => d.meal === m.key).length;
  console.log('  ' + m.name.padEnd(12) + n);
});
console.log('  всего: ' + D.length);

console.log('\n=== целостность полей ===');
const ids = {};
D.forEach(d => {
  if (ids[d.id]) err('дубль id: ' + d.id);
  ids[d.id] = 1;
  ['id','meal','portions','time','name','short','mac','ing','steps'].forEach(k => {
    if (d[k] === undefined) err(d.id + ': нет поля ' + k);
  });
  if (d.fib === undefined) err(d.id + ': нет fib');
  if (!d.pl || !d.pl.length) err(d.id + ': нет pl');
  if (!MEALS.some(m => m.key === d.meal)) err(d.id + ': неизвестный meal ' + d.meal);
  (d.tags || []).forEach(t => { if (!TAGS[t]) err(d.id + ': неизвестный тег ' + t); });
  (d.ing || []).forEach(i => {
    if (!i.n) err(d.id + ': ингредиент без имени');
    if (!AISLES.includes(i.a)) err(d.id + ' / ' + i.n + ': неизвестный отдел "' + i.a + '"');
    if (i.q !== null && typeof i.q !== 'number') err(d.id + ' / ' + i.n + ': q не число');
    if (i.u === 'банка') err(d.id + ' / ' + i.n + ': единица "банка" запрещена, нужны граммы + d:');
  });
  /* c: — углеводы без клетчатки (как на российских этикетках), поэтому
     клетчатку считаем отдельно по 2 ккал/г. */
  const m = d.mac, kcal = m.p * 4 + m.f * 9 + m.c * 4 + (d.fib || 0) * 2;
  if (Math.abs(kcal - m.kcal) > 40) err(d.id + ': ккал не сходится, БЖУ+клетчатка дают ' + kcal + ', указано ' + m.kcal);
});
if (!bad) console.log('  всё чисто');

console.log('\n=== разные имена одного продукта (риск двух строк в закупке) ===');
const names = {};
D.forEach(d => (d.ing || []).forEach(i => {
  names[i.n] = names[i.n] || new Set();
  names[i.n].add(i.u);
}));
Object.keys(names).forEach(n => {
  if (names[n].size > 1) err('«' + n + '» в разных единицах: ' + [...names[n]].join(', '));
});
console.log('  уникальных продуктов: ' + Object.keys(names).length);

console.log('\n=== BY_ID построен ===');
console.log('  ' + (g('typeof BY_ID!=="undefined"&&BY_ID') ? 'да, ' + Object.keys(g('typeof BY_ID!=="undefined"&&BY_ID')).length + ' записей' : 'НЕТ — страницы сломаны'));

/* Проверка попадания в цели на пятидневке из самых сытных блюд каждого раздела. */
if (g('typeof BY_ID!=="undefined"&&BY_ID') && MEALS.every(m => D.some(d => d.meal === m.key))) {
  console.log('\n=== средний день на топ-блюдах ===');
  const plan = {};
  MEALS.forEach(m => {
    const top = D.filter(d => d.meal === m.key).sort((a, b) => b.mac.p - a.mac.p)[0];
    plan[m.key] = [top.id, top.id, top.id, top.id, top.id];
  });
  const t = g('dayTotals')(plan, 0);
  console.log('  белок ' + t.p + ' г (цель ' + PROFILE.p.min + '–' + PROFILE.p.max + ')');
  console.log('  ккал  ' + t.kcal + ' (цель ' + PROFILE.kcal.min + '–' + PROFILE.kcal.max + ')');
  if (t.fib !== undefined) console.log('  клетчатка ' + t.fib + ' г (цель ' + PROFILE.fib.min + '+)');

  console.log('\n=== заходы в магазин ===');
  const list = g('planDishes')(plan);
  const runs = g('makeRuns')(list);
  runs.forEach(r => {
    console.log('  заход ' + r.n + ': ' + r.items.map(e => e.dish.short).join(' + '));
    if (r.items.length !== MEALS.length) err('в заходе ' + r.n + ' не ' + MEALS.length + ' блюда, а ' + r.items.length);
  });
}

console.log('\n' + (bad ? '=== ОШИБОК: ' + bad + ' ===' : '=== ошибок нет ==='));
