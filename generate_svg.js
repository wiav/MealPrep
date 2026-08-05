const fs = require('fs');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 2300" width="480" height="2300" style="background:#FAF3E6; font-family:'Oswald', 'Golos Text', sans-serif;">
  <style>
    .brand { font-family: 'Oswald', sans-serif; font-size: 64px; font-weight: 700; fill: #FF4D00; text-anchor: middle; letter-spacing: -2px; }
    .sub { font-family: 'Golos Text', sans-serif; font-size: 13px; fill: #7A6965; text-anchor: middle; }
    .ticker-bg { fill: #FF4D00; }
    .ticker-txt { font-family: 'Oswald', sans-serif; font-size: 14px; fill: #FFFFFF; text-anchor: middle; letter-spacing: 2px; }
    .sec-h { font-family: 'Oswald', sans-serif; font-size: 32px; font-weight: 700; fill: #FF4D00; text-anchor: middle; text-transform: uppercase; }
    .card-bg { fill: #FFFDF9; stroke: #E8DCCB; stroke-width: 1.5; rx: 12; }
    .card-title { font-family: 'Oswald', sans-serif; font-size: 19px; fill: #2A1D1A; font-weight: 600; }
    .card-desc { font-family: 'Golos Text', sans-serif; font-size: 11px; fill: #7A6965; }
    .price { font-family: 'Oswald', sans-serif; font-size: 22px; fill: #2A1D1A; font-weight: 700; }
    .btn-bg { fill: #FF4D00; rx: 6; }
    .btn-txt { font-family: 'Oswald', sans-serif; font-size: 14px; fill: #FFFFFF; text-anchor: middle; font-weight: 600; text-transform: uppercase; }
    .cat-lbl { font-family: 'Oswald', sans-serif; font-size: 22px; fill: #FFFFFF; font-weight: 700; text-anchor: middle; text-transform: uppercase; }
    .quote-h { font-family: 'Oswald', sans-serif; font-size: 26px; fill: #FF4D00; text-transform: uppercase; }
    .star { fill: #FF4D00; font-size: 16px; }
  </style>

  <!-- Canvas Background -->
  <rect width="480" height="2300" fill="#FAF3E6"/>

  <!-- Top Header -->
  <text x="240" y="80" class="brand">MEAL PREP</text>
  <text x="240" y="110" class="sub" font-weight="700" font-size="16">08:00 – 22:00</text>
  <text x="240" y="130" class="sub">Санкт-Петербург · Заготовки еды на 5 дней</text>
  <text x="240" y="148" class="sub">+7 495 123 45 67</text>

  <!-- Ticker Bar -->
  <rect x="0" y="170" width="480" height="36" class="ticker-bg"/>
  <text x="240" y="193" class="ticker-txt">★ АКЦИИ! СКИДКА 10% НА ПЕРВЫЙ ЗАКАЗ ★ ПЯТИДНЕВНЫЙ РАЦИОН ★</text>

  <!-- Hero Card -->
  <rect x="20" y="225" width="440" height="220" class="card-bg"/>
  <rect x="35" y="240" width="410" height="130" fill="#E8DCCB" rx="8"/>
  <text x="240" y="315" font-family="Oswald" font-size="22" fill="#FF4D00" text-anchor="middle">🍱 СВЕЖИЕ ЗАГОТОВКИ</text>
  <text x="35" y="395" font-family="Oswald" font-size="24" fill="#FF4D00" font-weight="700">СВЕЖИЕ ЗАГОТОВКИ С ДОСТАВКОЙ</text>
  <text x="35" y="420" class="sub" text-anchor="start">Сбалансированное меню из 5 блюд на каждый день</text>

  <!-- Category Section -->
  <text x="240" y="480" class="sec-h">КАТЕГОРИИ</text>
  <text x="240" y="502" class="sub">Выберите ваш приём пищи</text>

  <!-- Cat 1: Breakfast -->
  <rect x="20" y="520" width="440" height="75" fill="#2A1D1A" rx="10"/>
  <rect x="20" y="520" width="440" height="75" fill="#D9971F" opacity="0.7" rx="10"/>
  <text x="240" y="565" class="cat-lbl">🌅 ЗАВТРАКИ</text>

  <!-- Cat 2: Lunch -->
  <rect x="20" y="610" width="440" height="75" fill="#2A1D1A" rx="10"/>
  <rect x="20" y="610" width="440" height="75" fill="#146C7E" opacity="0.7" rx="10"/>
  <text x="240" y="655" class="cat-lbl">🍲 ОБЕДЫ</text>

  <!-- Cat 3: Dinner -->
  <rect x="20" y="700" width="440" height="75" fill="#2A1D1A" rx="10"/>
  <rect x="20" y="700" width="440" height="75" fill="#E07A5F" opacity="0.7" rx="10"/>
  <text x="240" y="745" class="cat-lbl">🥗 УЖИНЫ</text>

  <!-- Cat 4: Bedtime -->
  <rect x="20" y="790" width="440" height="75" fill="#2A1D1A" rx="10"/>
  <rect x="20" y="790" width="440" height="75" fill="#8B5CF6" opacity="0.7" rx="10"/>
  <text x="240" y="835" class="cat-lbl">🌙 ПЕРЕД СНОМ</text>

  <!-- Popular Dishes Section -->
  <text x="240" y="915" class="sec-h">ПОПУЛЯРНЫЕ БЛЮДА</text>

  <!-- Dish 1 -->
  <rect x="20" y="940" width="210" height="280" class="card-bg"/>
  <rect x="30" y="950" width="190" height="110" fill="#FFEAE0" rx="8"/>
  <text x="125" y="1010" font-family="Oswald" font-size="14" fill="#FF4D00" text-anchor="middle">🥞 Овсяноблин</text>
  <text x="30" y="1080" class="card-title">Овсяноблин с ягодами</text>
  <text x="30" y="1100" class="card-desc">Овсяные хлопья, яйцо, творог</text>
  <text x="30" y="1116" class="card-desc">150г · 350 ккал · 24г Б</text>
  <text x="30" y="1148" class="price">349 ₽</text>
  <rect x="30" y="1160" width="190" height="36" class="btn-bg"/>
  <text x="125" y="1183" class="btn-txt">В КОРЗИНУ</text>

  <!-- Dish 2 -->
  <rect x="250" y="940" width="210" height="280" class="card-bg"/>
  <rect x="260" y="950" width="190" height="110" fill="#FFEAE0" rx="8"/>
  <text x="355" y="1010" font-family="Oswald" font-size="14" fill="#FF4D00" text-anchor="middle">🍳 Омлет</text>
  <text x="260" y="1080" class="card-title">Запечённый омлет</text>
  <text x="260" y="1100" class="card-desc">Шпинат, творог, яйца C0</text>
  <text x="260" y="1116" class="card-desc">180г · 280 ккал · 22г Б</text>
  <text x="260" y="1148" class="price">380 ₽</text>
  <rect x="260" y="1160" width="190" height="36" class="btn-bg"/>
  <text x="355" y="1183" class="btn-txt">В КОРЗИНУ</text>

  <!-- Dish 3 -->
  <rect x="20" y="1240" width="210" height="280" class="card-bg"/>
  <rect x="30" y="1250" width="190" height="110" fill="#FFEAE0" rx="8"/>
  <text x="125" y="1310" font-family="Oswald" font-size="14" fill="#FF4D00" text-anchor="middle">🍗 Курица</text>
  <text x="30" y="1380" class="card-title">Курица с фасолью</text>
  <text x="30" y="1400" class="card-desc">Филе, красная фасоль, томаты</text>
  <text x="30" y="1416" class="card-desc">250г · 420 ккал · 38г Б</text>
  <text x="30" y="1448" class="price">450 ₽</text>
  <rect x="30" y="1460" width="190" height="36" class="btn-bg"/>
  <text x="125" y="1483" class="btn-txt">В КОРЗИНУ</text>

  <!-- Dish 4 -->
  <rect x="250" y="1240" width="210" height="280" class="card-bg"/>
  <rect x="260" y="1250" width="190" height="110" fill="#FFEAE0" rx="8"/>
  <text x="355" y="1310" font-family="Oswald" font-size="14" fill="#FF4D00" text-anchor="middle">🍝 Паста</text>
  <text x="260" y="1380" class="card-title">Паста с тунцом</text>
  <text x="260" y="1400" class="card-desc">Паста твердых сортов, тунец</text>
  <text x="260" y="1416" class="card-desc">280г · 480 ккал · 32г Б</text>
  <text x="260" y="1448" class="price">490 ₽</text>
  <rect x="260" y="1460" width="190" height="36" class="btn-bg"/>
  <text x="355" y="1483" class="btn-txt">В КОРЗИНУ</text>

  <!-- Quote Philosophy Box -->
  <rect x="20" y="1550" width="440" height="120" fill="#FFEAE0" rx="10" stroke="#FF4D00" stroke-width="2"/>
  <text x="40" y="1590" class="quote-h">ЕДА — ЭТО СПОСОБ НАСЛАЖДАТЬСЯ ЖИЗНЬЮ</text>
  <text x="40" y="1620" class="card-desc" font-size="13">Сервис заготовок Meal Prep помогает питаться вкусно,</text>
  <text x="40" y="1640" class="card-desc" font-size="13">здорово и экономя до 10 часов времени каждую неделю.</text>

  <!-- Reviews Section -->
  <text x="240" y="1720" class="sec-h">ОТЗЫВЫ КЛИЕНТОВ</text>

  <rect x="20" y="1740" width="210" height="130" class="card-bg"/>
  <text x="35" y="1768" class="star">★★★★★</text>
  <text x="35" y="1790" font-family="Golos Text" font-size="13" font-weight="700" fill="#2A1D1A">Чистота и вкус</text>
  <text x="35" y="1810" class="card-desc">Очень вкусно и удобно!</text>
  <text x="35" y="1828" class="card-desc">Боксы всегда свежие.</text>
  <text x="35" y="1852" font-family="Golos Text" font-size="11" fill="#FF4D00" font-weight="600">@Елена</text>

  <rect x="250" y="1740" width="210" height="130" class="card-bg"/>
  <text x="265" y="1768" class="star">★★★★★</text>
  <text x="265" y="1790" font-family="Golos Text" font-size="13" font-weight="700" fill="#2A1D1A">Обязательно вернусь</text>
  <text x="265" y="1810" class="card-desc">Экономит кучу времени</text>
  <text x="265" y="1828" class="card-desc">среди рабочей недели.</text>
  <text x="265" y="1852" font-family="Golos Text" font-size="11" fill="#FF4D00" font-weight="600">@Максим</text>

  <!-- Subscribe Box -->
  <rect x="20" y="1900" width="440" height="150" class="card-bg"/>
  <text x="240" y="1940" font-family="Oswald" font-size="22" fill="#FF4D00" text-anchor="middle" font-weight="700">СКИДКА 10% НА ПЕРВЫЙ ЗАКАЗ</text>
  <rect x="40" y="1960" width="400" height="38" fill="#FFFFFF" stroke="#E8DCCB" rx="6"/>
  <text x="55" y="1984" font-family="Golos Text" font-size="13" fill="#7A6965">Ваш E-mail</text>
  <rect x="40" y="2008" width="400" height="36" class="btn-bg"/>
  <text x="240" y="2031" class="btn-txt">ПОЛУЧИТЬ СКИДКУ</text>

  <!-- Footer -->
  <rect x="0" y="2080" width="480" height="220" fill="#FF4D00"/>
  <text x="40" y="2120" font-family="Golos Text" font-size="14" fill="#FFFFFF" font-weight="600">Рецепты · Конструктор · Календарь</text>
  <text x="40" y="2150" font-family="Golos Text" font-size="13" fill="#FFFFFF" opacity="0.9">Пн – Вс: 08:00 – 22:00</text>
  <text x="40" y="2172" font-family="Golos Text" font-size="13" fill="#FFFFFF" opacity="0.9">+7 495 123 45 67</text>
  <text x="40" y="2194" font-family="Golos Text" font-size="13" fill="#FFFFFF" opacity="0.9">Санкт-Петербург, Невский пр. 10</text>
  <text x="40" y="2240" font-family="Oswald" font-size="18" fill="#FFFFFF" font-weight="700">MEAL PREP · NOODLE K STYLE</text>
</svg>`;

fs.writeFileSync('meal_prep_noodle_k_figma.svg', svg, 'utf8');
console.log('SVG created!');
