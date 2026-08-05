(async function() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });

  // Main Page Frame
  const frame = figma.createFrame();
  frame.name = "Meal Prep — Redesign (Noodle K Style)";
  frame.resize(480, 2400);
  frame.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.95, b: 0.90 } }]; // #FAF3E6

  // 1. Header
  const header = figma.createText();
  header.characters = "MEAL PREP";
  header.fontSize = 54;
  header.fontName = { family: "Inter", style: "Bold" };
  header.fills = [{ type: 'SOLID', color: { r: 1.0, g: 0.3, b: 0.0 } }]; // #FF4D00
  header.x = 240 - header.width / 2;
  header.y = 60;
  frame.appendChild(header);

  const sub = figma.createText();
  sub.characters = "08:00 - 22:00\nСанкт-Петербург · Заготовки еды на 5 дней\n+7 495 123 45 67";
  sub.fontSize = 13;
  sub.fontName = { family: "Inter", style: "Regular" };
  sub.fills = [{ type: 'SOLID', color: { r: 0.48, g: 0.41, b: 0.40 } }];
  sub.textAlignHorizontal = "CENTER";
  sub.x = 240 - sub.width / 2;
  sub.y = 130;
  frame.appendChild(sub);

  // 2. Ticker
  const ticker = figma.createRectangle();
  ticker.resize(480, 36);
  ticker.y = 200;
  ticker.fills = [{ type: 'SOLID', color: { r: 1.0, g: 0.3, b: 0.0 } }];
  frame.appendChild(ticker);

  const tickerText = figma.createText();
  tickerText.characters = "★ АКЦИИ! СКИДКА 10% НА ПЕРВЫЙ ЗАКАЗ ★ ПЯТИДНЕВНЫЙ РАЦИОН ★";
  tickerText.fontSize = 13;
  tickerText.fontName = { family: "Inter", style: "Bold" };
  tickerText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  tickerText.x = 240 - tickerText.width / 2;
  tickerText.y = 210;
  frame.appendChild(tickerText);

  // 3. Hero Card
  const heroCard = figma.createFrame();
  heroCard.name = "Hero Card";
  heroCard.resize(440, 220);
  heroCard.x = 20;
  heroCard.y = 260;
  heroCard.cornerRadius = 12;
  heroCard.fills = [{ type: 'SOLID', color: { r: 1, g: 0.99, b: 0.98 } }];
  heroCard.strokes = [{ type: 'SOLID', color: { r: 0.91, g: 0.86, b: 0.80 } }];
  frame.appendChild(heroCard);

  const heroTitle = figma.createText();
  heroTitle.characters = "СВЕЖИЕ ЗАГОТОВКИ С ДОСТАВКОЙ";
  heroTitle.fontSize = 22;
  heroTitle.fontName = { family: "Inter", style: "Bold" };
  heroTitle.fills = [{ type: 'SOLID', color: { r: 1.0, g: 0.3, b: 0.0 } }];
  heroTitle.x = 20;
  heroTitle.y = 160;
  heroCard.appendChild(heroTitle);

  // 4. Categories Header
  const catHeader = figma.createText();
  catHeader.characters = "КАТЕГОРИИ РАЦИОНА";
  catHeader.fontSize = 28;
  catHeader.fontName = { family: "Inter", style: "Bold" };
  catHeader.fills = [{ type: 'SOLID', color: { r: 1.0, g: 0.3, b: 0.0 } }];
  catHeader.x = 240 - catHeader.width / 2;
  catHeader.y = 510;
  frame.appendChild(catHeader);

  // Category Cards
  const categories = [
    { title: "🌅 ЗАВТРАКИ", color: { r: 0.85, g: 0.59, b: 0.12 }, y: 560 },
    { title: "🍲 ОБЕДЫ", color: { r: 0.08, g: 0.42, b: 0.49 }, y: 650 },
    { title: "🥗 УЖИНЫ", color: { r: 0.88, g: 0.48, b: 0.37 }, y: 740 },
    { title: "🌙 ПЕРЕД СНОМ", color: { r: 0.55, g: 0.36, b: 0.96 }, y: 830 }
  ];

  for (const cat of categories) {
    const cFrame = figma.createFrame();
    cFrame.name = cat.title;
    cFrame.resize(440, 75);
    cFrame.x = 20;
    cFrame.y = cat.y;
    cFrame.cornerRadius = 10;
    cFrame.fills = [{ type: 'SOLID', color: cat.color }];
    frame.appendChild(cFrame);

    const txt = figma.createText();
    txt.characters = cat.title;
    txt.fontSize = 20;
    txt.fontName = { family: "Inter", style: "Bold" };
    txt.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    txt.x = 220 - txt.width / 2;
    txt.y = 26;
    cFrame.appendChild(txt);
  }

  // 5. Popular Section
  const popHeader = figma.createText();
  popHeader.characters = "ПОПУЛЯРНЫЕ БЛЮДА";
  popHeader.fontSize = 28;
  popHeader.fontName = { family: "Inter", style: "Bold" };
  popHeader.fills = [{ type: 'SOLID', color: { r: 1.0, g: 0.3, b: 0.0 } }];
  popHeader.x = 240 - popHeader.width / 2;
  popHeader.y = 940;
  frame.appendChild(popHeader);

  // Recipe Cards
  const dishes = [
    { title: "Овсяноблин с ягодами", price: "349 ₽", kcal: "350 ккал", x: 20, y: 990 },
    { title: "Запечённый омлет", price: "380 ₽", kcal: "280 ккал", x: 250, y: 990 },
    { title: "Курица с фасолью", price: "450 ₽", kcal: "420 ккал", x: 20, y: 1290 },
    { title: "Паста с тунцом", price: "490 ₽", kcal: "480 ккал", x: 250, y: 1290 }
  ];

  for (const dish of dishes) {
    const dCard = figma.createFrame();
    dCard.name = dish.title;
    dCard.resize(210, 270);
    dCard.x = dish.x;
    dCard.y = dish.y;
    dCard.cornerRadius = 10;
    dCard.fills = [{ type: 'SOLID', color: { r: 1, g: 0.99, b: 0.98 } }];
    dCard.strokes = [{ type: 'SOLID', color: { r: 0.91, g: 0.86, b: 0.80 } }];
    frame.appendChild(dCard);

    const titleTxt = figma.createText();
    titleTxt.characters = dish.title;
    titleTxt.fontSize = 15;
    titleTxt.fontName = { family: "Inter", style: "Bold" };
    titleTxt.fills = [{ type: 'SOLID', color: { r: 0.16, g: 0.11, b: 0.10 } }];
    titleTxt.x = 12;
    titleTxt.y = 130;
    dCard.appendChild(titleTxt);

    const kcalTxt = figma.createText();
    kcalTxt.characters = dish.kcal;
    kcalTxt.fontSize = 11;
    kcalTxt.fontName = { family: "Inter", style: "Regular" };
    kcalTxt.fills = [{ type: 'SOLID', color: { r: 0.48, g: 0.41, b: 0.40 } }];
    kcalTxt.x = 12;
    kcalTxt.y = 160;
    dCard.appendChild(kcalTxt);

    const priceTxt = figma.createText();
    priceTxt.characters = dish.price;
    priceTxt.fontSize = 20;
    priceTxt.fontName = { family: "Inter", style: "Bold" };
    priceTxt.fills = [{ type: 'SOLID', color: { r: 0.16, g: 0.11, b: 0.10 } }];
    priceTxt.x = 12;
    priceTxt.y = 180;
    dCard.appendChild(priceTxt);

    // Button
    const btn = figma.createFrame();
    btn.name = "CTA Button";
    btn.resize(186, 36);
    btn.x = 12;
    btn.y = 220;
    btn.cornerRadius = 6;
    btn.fills = [{ type: 'SOLID', color: { r: 1.0, g: 0.3, b: 0.0 } }];
    dCard.appendChild(btn);

    const btnTxt = figma.createText();
    btnTxt.characters = "В КОРЗИНУ";
    btnTxt.fontSize = 13;
    btnTxt.fontName = { family: "Inter", style: "Bold" };
    btnTxt.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    btnTxt.x = 93 - btnTxt.width / 2;
    btnTxt.y = 10;
    btn.appendChild(btnTxt);
  }

  // 6. Footer
  const footer = figma.createRectangle();
  footer.resize(480, 220);
  footer.y = 2180;
  footer.fills = [{ type: 'SOLID', color: { r: 1.0, g: 0.3, b: 0.0 } }];
  frame.appendChild(footer);

  const fText = figma.createText();
  fText.characters = "MEAL PREP · REDESIGN\nРецепты · Конструктор · Календарь\nПн - Вс: 08:00 - 22:00\n+7 495 123 45 67";
  fText.fontSize = 14;
  fText.fontName = { family: "Inter", style: "Bold" };
  fText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  fText.x = 30;
  fText.y = 2220;
  frame.appendChild(fText);

  figma.currentPage.appendChild(frame);
  figma.viewport.scrollAndZoomIntoView([frame]);
  console.log("Successfully created Meal Prep Redesign Frame in Figma!");
})();
