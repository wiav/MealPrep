/* ============================================================
   ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ И АВТОМАТИЧЕСКИЙ РАСЧЁТ ККАЛ (BMR / TDEE)
   ============================================================ */

function loadUserProfileData() {
  var raw = typeof localStorage !== 'undefined' ? localStorage.getItem('mp-user-profile') : null;
  if (raw) {
    try {
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch(e) {}
  }
  return { gender: 'm', age: 30, height: 178, weight: 75, activity: 1.55, goal: 'loss' };
}

function calculateUserProfile(data) {
  var weight = parseFloat(data.weight) || 75;
  var height = parseFloat(data.height) || 178;
  var age = parseInt(data.age, 10) || 30;
  var activity = parseFloat(data.activity) || 1.55;
  var gender = data.gender || 'm';
  var goal = data.goal || 'loss';

  // Формула Миффлина — Сан-Жеора
  var bmr = (10 * weight) + (6.25 * height) - (5 * age) + (gender === 'm' ? 5 : -161);
  var tdee = bmr * activity;

  var goalMult = 1.0;
  if (goal === 'loss') goalMult = 0.85; // дефицит 15%
  else if (goal === 'gain') goalMult = 1.15; // профицит 15%

  var targetKcal = Math.round(tdee * goalMult);

  var kcalMin = Math.round(targetKcal * 0.95);
  var kcalMax = Math.round(targetKcal * 1.05);

  var pTarget = Math.round(weight * (goal === 'loss' ? 2.0 : 1.8));
  var pMin = Math.round(pTarget * 0.9);
  var pMax = Math.round(pTarget * 1.1);

  var fTarget = Math.round(weight * 1.0);
  var fMin = Math.round(fTarget * 0.85);
  var fMax = Math.round(fTarget * 1.15);

  return {
    kcal: { min: kcalMin, max: kcalMax, label: 'Калории', unit: 'ккал', target: targetKcal },
    p: { min: pMin, max: pMax, label: 'Белок', unit: 'г', target: pTarget },
    f: { min: fMin, max: fMax, label: 'Жиры', unit: 'г', target: fTarget },
    fib: { min: 30, max: 50, label: 'Клетчатка', unit: 'г' },
    bmr: Math.round(bmr),
    tdee: Math.round(tdee)
  };
}

function updateProfileObject() {
  if (typeof PROFILE === 'undefined') return;
  var data = loadUserProfileData();
  var calc = calculateUserProfile(data);
  PROFILE.kcal = calc.kcal;
  PROFILE.p = calc.p;
  PROFILE.f = calc.f;
  PROFILE.fib = calc.fib;
}

/* ---- Динамическое масштабирование всех 75 блюд и ингредиентов ---- */
function initBaseDishes() {
  if (typeof DISHES === 'undefined' || !DISHES.length) return;
  DISHES.forEach(function (d) {
    if (!d._baseMac) d._baseMac = JSON.parse(JSON.stringify(d.mac));
    if (!d._baseIng) d._baseIng = JSON.parse(JSON.stringify(d.ing));
    if (d._baseFib === undefined) d._baseFib = d.fib !== undefined ? d.fib : (d.mac.fib || 0);
  });
}

function getScalingRatio() {
  if (typeof PROFILE === 'undefined' || !PROFILE.kcal || !PROFILE.kcal.target) return 1.0;
  return PROFILE.kcal.target / 2625;
}

function scaleAllDishes() {
  initBaseDishes();
  if (typeof DISHES === 'undefined' || !DISHES.length) return;
  var S = getScalingRatio();

  DISHES.forEach(function (d) {
    if (!d._baseMac || !d._baseIng) return;

    // Scale Macros
    d.mac = {
      p: Math.max(1, Math.round(d._baseMac.p * S)),
      f: Math.max(1, Math.round(d._baseMac.f * S)),
      c: Math.max(1, Math.round(d._baseMac.c * S)),
      kcal: Math.max(10, Math.round(d._baseMac.kcal * S))
    };
    d.fib = Math.max(0, Math.round(d._baseFib * S));

    // Scale Ingredients
    d.ing = d._baseIng.map(function (ing) {
      if (ing.q === null || ing.q === undefined) {
        return JSON.parse(JSON.stringify(ing));
      }

      var rawQ = ing.q * S;
      var newQ;

      if (ing.u === 'г' || ing.u === 'мл') {
        newQ = Math.max(1, Math.round(rawQ));
        if (newQ > 30) newQ = Math.round(newQ / 5) * 5;
      } else if (ing.u === 'шт' || ing.u === 'ст. л.' || ing.u === 'ч. л.' || ing.u === 'зубчик' || ing.u === 'пучок') {
        newQ = Math.max(0.2, Math.round(rawQ * 10) / 10);
      } else {
        newQ = Math.max(1, Math.round(rawQ));
      }

      var cloned = JSON.parse(JSON.stringify(ing));
      cloned.q = newQ;
      if (cloned.d) {
        cloned.d = cloned.d.replace(/^(\d+(?:\.\d+)?)/, newQ);
      }
      return cloned;
    });
  });
}

function applyUserProfileToApp() {
  updateProfileObject();
  scaleAllDishes();

  if (typeof renderMealGroups === 'function') renderMealGroups();
  if (typeof renderMatrixGroups === 'function') renderMatrixGroups();
  if (typeof renderAllGroups === 'function') renderAllGroups();
  if (typeof renderBars === 'function') renderBars();
  if (typeof renderRules === 'function') renderRules();
  if (typeof apply === 'function') apply();

  if (typeof document !== 'undefined') {
    var drawerBackdrop = document.getElementById('drawer-backdrop');
    if (drawerBackdrop && drawerBackdrop.classList.contains('active') && typeof window !== 'undefined' && window.currentDrawerId) {
      if (typeof openRecipeDrawer === 'function') openRecipeDrawer(window.currentDrawerId);
    }
  }

  if (typeof refresh === 'function') refresh();
  if (typeof drawGrid === 'function') drawGrid();
  if (typeof drawCal === 'function') drawCal();
}

var currentProfileGender = 'm';

function openProfileModal() {
  var modal = document.getElementById('profile-modal-backdrop');
  if (!modal) {
    injectProfileModal();
    modal = document.getElementById('profile-modal-backdrop');
  }
  syncProfileModalInputs();
  if (modal) modal.classList.add('active');
}

function closeProfileModal() {
  var modal = document.getElementById('profile-modal-backdrop');
  if (modal) modal.classList.remove('active');
}

function setProfileGender(g) {
  currentProfileGender = g;
  var btnM = document.getElementById('prof-g-m');
  var btnF = document.getElementById('prof-g-f');
  if (btnM) btnM.setAttribute('aria-pressed', g === 'm' ? 'true' : 'false');
  if (btnF) btnF.setAttribute('aria-pressed', g === 'f' ? 'true' : 'false');
  updateProfileLiveCalc();
}

function syncProfileModalInputs() {
  var data = loadUserProfileData();
  currentProfileGender = data.gender || 'm';
  setProfileGender(currentProfileGender);

  var ageEl = document.getElementById('prof-age');
  if (ageEl) ageEl.value = data.age || 30;
  var hEl = document.getElementById('prof-height');
  if (hEl) hEl.value = data.height || 178;
  var wEl = document.getElementById('prof-weight');
  if (wEl) wEl.value = data.weight || 75;
  var actEl = document.getElementById('prof-activity');
  if (actEl) actEl.value = data.activity || 1.55;
  var goalEl = document.getElementById('prof-goal');
  if (goalEl) goalEl.value = data.goal || 'loss';

  updateProfileLiveCalc();
}

function getFormDataFromModal() {
  return {
    gender: currentProfileGender,
    age: parseInt(document.getElementById('prof-age').value, 10) || 30,
    height: parseFloat(document.getElementById('prof-height').value) || 178,
    weight: parseFloat(document.getElementById('prof-weight').value) || 75,
    activity: parseFloat(document.getElementById('prof-activity').value) || 1.55,
    goal: document.getElementById('prof-goal').value || 'loss'
  };
}

function updateProfileLiveCalc() {
  var ageEl = document.getElementById('prof-age');
  if (!ageEl) return;
  var data = getFormDataFromModal();
  var calc = calculateUserProfile(data);

  var bmrEl = document.getElementById('calc-bmr');
  if (bmrEl) bmrEl.textContent = calc.bmr + ' ккал';
  var tdeeEl = document.getElementById('calc-tdee');
  if (tdeeEl) tdeeEl.textContent = calc.tdee + ' ккал';
  var targetEl = document.getElementById('calc-target');
  if (targetEl) targetEl.textContent = calc.kcal.min + '–' + calc.kcal.max + ' ккал';
  var macrosEl = document.getElementById('calc-macros');
  if (macrosEl) macrosEl.textContent = calc.p.target + 'г Б · ' + calc.f.target + 'г Ж';
}

function saveUserProfileFromModal() {
  var data = getFormDataFromModal();
  localStorage.setItem('mp-user-profile', JSON.stringify(data));
  applyUserProfileToApp();
  closeProfileModal();
}

function injectProfileModal() {
  if (document.getElementById('profile-modal-backdrop')) return;
  var div = document.createElement('div');
  div.className = 'profile-modal-backdrop';
  div.id = 'profile-modal-backdrop';
  div.innerHTML =
    '<div class="profile-modal" id="profile-modal">' +
      '<div class="profile-modal-h">' +
        '<div>' +
          '<h2>Профиль и норма ккал</h2>' +
          '<p>Расчёт калорий и БЖУ по формуле Миффлина — Сан-Жеора</p>' +
        '</div>' +
        '<button class="profile-close" onclick="closeProfileModal()">✕</button>' +
      '</div>' +
      '<div class="profile-form-grid">' +
        '<div class="profile-field" style="grid-column:1/-1">' +
          '<label>Пол</label>' +
          '<div class="profile-gender-group">' +
            '<button type="button" class="gender-btn" id="prof-g-m" onclick="setProfileGender(\'m\')">Мужчина</button>' +
            '<button type="button" class="gender-btn" id="prof-g-f" onclick="setProfileGender(\'f\')">Женщина</button>' +
          '</div>' +
        '</div>' +
        '<div class="profile-field">' +
          '<label for="prof-age">Возраст (лет)</label>' +
          '<input type="number" id="prof-age" min="14" max="100" oninput="updateProfileLiveCalc()">' +
        '</div>' +
        '<div class="profile-field">' +
          '<label for="prof-height">Рост (см)</label>' +
          '<input type="number" id="prof-height" min="120" max="230" oninput="updateProfileLiveCalc()">' +
        '</div>' +
        '<div class="profile-field">' +
          '<label for="prof-weight">Вес (кг)</label>' +
          '<input type="number" id="prof-weight" min="35" max="250" oninput="updateProfileLiveCalc()">' +
        '</div>' +
        '<div class="profile-field">' +
          '<label for="prof-activity">Физическая активность</label>' +
          '<select id="prof-activity" onchange="updateProfileLiveCalc()">' +
            '<option value="1.2">1.2 — Сидячий образ жизни</option>' +
            '<option value="1.375">1.375 — Легкая (1–3 трен./нед.)</option>' +
            '<option value="1.55">1.55 — Умеренная (3–5 трен./нед.)</option>' +
            '<option value="1.725">1.725 — Высокая (6–7 трен./нед.)</option>' +
            '<option value="1.9">1.9 — Экстремальная активность</option>' +
          '</select>' +
        '</div>' +
        '<div class="profile-field" style="grid-column:1/-1">' +
          '<label for="prof-goal">Цель питания</label>' +
          '<select id="prof-goal" onchange="updateProfileLiveCalc()">' +
            '<option value="loss">Снижение веса (дефицит -15%)</option>' +
            '<option value="maintain">Поддержание формы (0%)</option>' +
            '<option value="gain">Набор массы (профицит +15%)</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div class="profile-calc-result">' +
        '<div class="profile-calc-title">Ваша суточная норма</div>' +
        '<div class="profile-calc-stats">' +
          '<div class="calc-stat-card"><span>Основной обмен (BMR)</span><b id="calc-bmr">—</b></div>' +
          '<div class="calc-stat-card"><span>Поддержание (TDEE)</span><b id="calc-tdee">—</b></div>' +
          '<div class="calc-stat-card highlight"><span>Цель калорий</span><b id="calc-target">—</b></div>' +
          '<div class="calc-stat-card highlight"><span>Белок / Жиры</span><b id="calc-macros">—</b></div>' +
        '</div>' +
      '</div>' +
      '<div class="profile-actions">' +
        '<button class="btn btn-solid" style="width:100%" onclick="saveUserProfileFromModal()">Сохранить и применить к сайту</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(div);
  div.addEventListener('click', function(e) {
    if (e.target === div) closeProfileModal();
  });
}

// Автоматический старт при подключении
applyUserProfileToApp();

/* ============================================================
   УПРАВЛЕНИЕ СОХРАНЁННЫМИ ПЛАНАМИ (MULTI-PLAN MANAGER)
   ============================================================ */

function getSavedPlans() {
  var raw = typeof localStorage !== 'undefined' ? localStorage.getItem('mp-saved-plans') : null;
  if (!raw) return [];
  try {
    var arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch(e) {
    return [];
  }
}

function saveSavedPlans(plans) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('mp-saved-plans', JSON.stringify(plans));
  }
}

function getActivePlanId() {
  return typeof localStorage !== 'undefined' ? localStorage.getItem('mp-active-plan-id') : null;
}

function setActivePlanId(id) {
  if (typeof localStorage !== 'undefined') {
    if (id) localStorage.setItem('mp-active-plan-id', id);
    else localStorage.removeItem('mp-active-plan-id');
  }
}

function saveCurrentPlanAs(name) {
  var rawPlan = typeof localStorage !== 'undefined' ? localStorage.getItem('mp-plan') : null;
  var currentPlan = rawPlan ? JSON.parse(rawPlan) : {};
  var planDaysCount = (typeof localStorage !== 'undefined' && localStorage.getItem('mp-plan-days')) ? parseInt(localStorage.getItem('mp-plan-days'), 10) : 5;
  var planMode = (typeof localStorage !== 'undefined' && localStorage.getItem('mp-plan-mode')) ? localStorage.getItem('mp-plan-mode') : 'repeat';

  var totals = { kcal: 0, p: 0, f: 0, c: 0 };
  if (typeof BY_ID !== 'undefined') {
    var MEAL_KEYS = ['b', 'l', 'd', 'n'];
    MEAL_KEYS.forEach(function(mk) {
      var arr = currentPlan[mk] || [];
      if (Array.isArray(arr)) {
        arr.forEach(function(dishId) {
          var dish = BY_ID[dishId];
          if (dish && dish.mac) {
            totals.kcal += dish.mac.kcal;
            totals.p += dish.mac.p;
            totals.f += dish.mac.f;
            totals.c += dish.mac.c;
          }
        });
      }
    });
  }

  var plans = getSavedPlans();
  var newId = 'plan_' + Date.now();
  var newPlanObj = {
    id: newId,
    name: name || ('Рацион (' + planDaysCount + ' дн.) от ' + new Date().toLocaleDateString('ru-RU')),
    createdAt: new Date().toISOString(),
    days: planDaysCount,
    mode: planMode,
    plan: currentPlan,
    totals: totals
  };

  plans.unshift(newPlanObj);
  saveSavedPlans(plans);
  return newPlanObj;
}

function applySavedPlan(id) {
  var plans = getSavedPlans();
  var found = plans.find(function(p) { return p.id === id; });
  if (!found) return false;

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('mp-plan', JSON.stringify(found.plan));
    localStorage.setItem('mp-plan-days', found.days || 5);
    localStorage.setItem('mp-plan-mode', found.mode || 'repeat');
  }
  return true;
}

function deleteSavedPlan(id) {
  var plans = getSavedPlans();
  var filtered = plans.filter(function(p) { return p.id !== id; });
  saveSavedPlans(filtered);
}

function createNewBlankPlan() {
  if (typeof localStorage !== 'undefined') {
    var empty = { b: [], l: [], d: [], n: [] };
    localStorage.setItem('mp-plan', JSON.stringify(empty));
  }
}

