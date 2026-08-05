/* временный подбор готового плана — удалить после проверки */
const fs = require('fs'), vm = require('vm'), path = require('path');
const dir = 'C:\\Users\\antip\\Desktop\\meal prep';
const ctx = vm.createContext({ console: console, localStorage: { getItem: () => null, setItem: () => {} } });
['data.js', 'dishes-b.js', 'dishes-l.js', 'dishes-d.js', 'dishes-n.js', 'app.js']
  .forEach(f => vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f }));

const g = n => vm.runInContext(n, ctx);
const PROFILE = g('PROFILE'), MEALS = g('MEALS'), DISHES = g('DISHES');
const dayTotals = g('dayTotals'), weekCheck = g('weekCheck'), suggestAddons = g('suggestAddons');
const planDishes = g('planDishes'), makeRuns = g('makeRuns'), BY_ID = g('BY_ID');

console.log('блюд:', DISHES.length, MEALS.map(m => m.key + ':' + DISHES.filter(d => d.meal === m.key).length).join(' '));

const pool = {};
MEALS.forEach(m => pool[m.key] = DISHES.filter(d => d.meal === m.key).map(d => d.id));

/* [A,A,A,B,B] или [A,A,B,B,C] — мало разных блюд, значит мало заходов */
const PATTERNS = [[0,0,0,1,1], [0,0,1,1,1], [0,1,0,1,1], [0,0,1,0,1]];

function pick(arr, k, rnd) {
  const c = arr.slice(); const out = [];
  for (let i = 0; i < k; i++) out.push(c.splice(Math.floor(rnd() * c.length), 1)[0]);
  return out;
}
function build(rnd) {
  const plan = {};
  MEALS.forEach(m => {
    const pat = PATTERNS[Math.floor(rnd() * PATTERNS.length)];
    const need = Math.max(...pat) + 1;
    const ids = pick(pool[m.key], need, rnd);
    plan[m.key] = pat.map(i => ids[i]);
  });
  return plan;
}
function evaluate(plan) {
  const days = [];
  for (let d = 0; d < 5; d++) {
    const t = dayTotals(plan, d);
    const s = suggestAddons(t, d);
    const fin = {
      p: t.p + (s.sum ? s.sum.p : 0), f: t.f + (s.sum ? s.sum.f : 0),
      c: t.c + (s.sum ? s.sum.c : 0), fib: t.fib + (s.sum ? s.sum.fib : 0),
      kcal: t.kcal + (s.sum ? s.sum.kcal : 0)
    };
    days.push({ t, s, fin });
  }
  const w = weekCheck(plan);
  /* сколько порций уйдёт в мусор */
  let waste = 0, distinct = 0;
  planDishes(plan).forEach(e => { waste += e.batches * e.dish.portions - e.portions; distinct++; });
  const runs = makeRuns(planDishes(plan)).length;

  let bad = 0;
  days.forEach(x => {
    const f = x.fin;
    if (f.kcal < PROFILE.kcal.min) bad += (PROFILE.kcal.min - f.kcal) / 25;
    if (f.kcal > PROFILE.kcal.max) bad += (f.kcal - PROFILE.kcal.max) / 25;
    if (f.p < PROFILE.p.min) bad += (PROFILE.p.min - f.p) / 3;
    if (f.p > PROFILE.p.max) bad += (f.p - PROFILE.p.max) / 3;
    if (f.f > PROFILE.f.max) bad += (f.f - PROFILE.f.max) / 3;
    if (f.f < PROFILE.f.min) bad += (PROFILE.f.min - f.f) / 3;
    if (f.fib < PROFILE.fib.min) bad += (PROFILE.fib.min - f.fib) / 2;
    /* заготовка должна давать основную часть, добор — не половину дня */
    if (x.s.sum && x.s.sum.kcal > 750) bad += (x.s.sum.kcal - 750) / 40;
  });
  if (w.totals.plants < 30) bad += (30 - w.totals.plants) * 2.5;
  if (w.totals.fish < 2) bad += (2 - w.totals.fish) * 8;
  if (w.totals.fish > 4) bad += (w.totals.fish - 4) * 2;
  bad += waste * 1.2;
  bad += Math.max(0, runs - 3) * 4;
  return { bad, days, w, waste, distinct, runs };
}

/* воспроизводимый ГПСЧ, чтобы результат можно было повторить */
let seed = 20260801;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;

let best = null;
for (let i = 0; i < 400000; i++) {
  const plan = build(rnd);
  const r = evaluate(plan);
  if (!best || r.bad < best.r.bad) best = { plan, r };
}

const { plan, r } = best;
console.log('\nштраф:', r.bad.toFixed(2), '| разных блюд:', r.distinct,
            '| заходов:', r.runs, '| лишних порций:', r.waste);
MEALS.forEach(m => console.log(' ', m.key + ':', JSON.stringify(plan[m.key])));
console.log('\nпо дням (заготовка → с добором):');
r.days.forEach((x, i) => {
  const t = x.t, f = x.fin;
  console.log(`  д${i + 1}: ${t.kcal} ккал / б${t.p} ж${t.f} кл${t.fib}` +
    `  →  ${f.kcal} ккал / б${f.p} ж${f.f} кл${f.fib}` +
    (x.s.items.length ? '   + ' + x.s.items.map(a => a.n).join(', ') : ''));
});
console.log('\nрастений:', r.w.totals.plants, '/ 30   рыбы:', r.w.totals.fish, '/ 2',
            '  приёмов:', r.w.totals.filled, '/ 20');
console.log('заходы:');
makeRuns(planDishes(plan)).forEach(run => {
  console.log('  заход', run.n, '· купить до дня', run.buyBy + 1, '·',
    run.items.map(e => BY_ID[e.dish.id].short + ' ×' + e.portions).join(' | '));
});
