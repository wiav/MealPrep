---
name: Meal Prep Recipe & Planning System
description: A structured, clinical culinary ledger for meal preparation and macro tracking
colors:
  primary: "#146C7E"
  primary-dark: "#0F5765"
  secondary: "#D9971F"
  tertiary: "#7FA23C"
  badge-b: "#926000"
  badge-l: "#146C7E"
  badge-d: "#46631E"
  badge-n: "#5A4A7C"
  ing-bg: "#EFF4F5"
  note-bg: "#FBF4E6"
  neutral-bg: "#E4EAEC"
  neutral-surface: "#FAFCFC"
  neutral-text: "#16242B"
  neutral-muted: "#586E78"
  neutral-border: "#C4D1D5"
typography:
  display:
    fontFamily: "Unbounded, Golos Text, system-ui, sans-serif"
    fontSize: "clamp(32px, 6vw, 62px)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Unbounded, Golos Text, system-ui, sans-serif"
    fontSize: "clamp(19px, 2.4vw, 25px)"
    fontWeight: 700
    lineHeight: 1.18
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Golos Text, system-ui, -apple-system, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 500
    letterSpacing: "0.1em"
rounded:
  sm: "3px"
  md: "4px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  wrap: "1100px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
  button-secondary:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
  chip:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-muted}"
    rounded: "{rounded.sm}"
    padding: "7px 12px"
  card:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.md}"
    padding: "22px 26px"
---

# Design System: Meal Prep Recipe & Planning System

## Overview

**Creative North Star: "The Clinical Culinary Ledger"**

Интерфейс спроектирован в эстетике инженерно-нутрициологического журнала. Он сочетает строгую техническую точность лаборатории с удобством домашнего планирования питания. Главный упор делается на прозрачность данных, информационную плотность, контрастную типографику и мгновенное считывание КБЖУ и состава блюд.

Визуальная среда опирается на холодный льдистый фон (`#E4EAEC`), контрастирующий с тёмно-сланцевыми заголовками (`#16242B`) и глубоким бирюзовым акцентом (`#146C7E`). Пространство структурировано четкими тонкими разделительными линиями, моноширинными бейджами и контрастными гистограммами питательных веществ.

**Key Characteristics:**
- **Лабораторная точность:** моноширинный шрифт `IBM Plex Mono` для всех нутриентов, граммовок, тегов и метаданных.
- **Двухуровневая типографика:** выразительные геометрии `Unbounded` для заголовков и читаемый `Golos Text` для пошаговых рецептов.
- **Плоская пространственная модель:** отсутствие падающих теней, границы элементов задаются четкими 1px линиями (`#C4D1D5`).
- **Смысловое цветовое кодирование:** строгое разграничение белков (`#146C7E`), жиров (`#D9971F`) и углеводов (`#7FA23C`).

## Colors

Палитра выдержана в эстетике светлой темы Teal & Ice.

### Primary
- **Deep Teal Accent** (`#146C7E` / `var(--brine)`): Ключевой акцентный цвет. Используется для активных состояний навигации, главных кнопок, нумерации шагов и акцента на ключевых блоках.

### Secondary
- **Warm Gold Amber** (`#D9971F` / `var(--yolk)`): Вспомогательный акцент для выносок-заметок, предупреждений и элементов гистограмм.

### Tertiary
- **Fresh Dill Green** (`#7FA23C` / `var(--dill)`): Акцент для утренних/дневных категорий и долей углеводов.

### Neutral
- **Ice Background** (`#E4EAEC` / `var(--ice)`): Базовый светлый фоновый тон страницы.
- **Pure Frost Surface** (`#FAFCFC` / `var(--frost)`): Белоснежный цвет карточек рецептов и полей ввода.
- **Crisp Steel Text** (`#16242B` / `var(--steel)`): Основной высокой контрастности цвет заголовков и текста.
- **Muted Slate Text** (`#586E78` / `var(--slate)`): Вторичный цвет для метаданных, подписей и пояснений.
- **Subtle Line Divider** (`#C4D1D5` / `var(--line)`): Цвет тонких разделительных границ и сеток.

### Named Rules

**The 10% Accent Rule.** Акцентный бирюзовый цвет (`#146C7E`) занимает не более 10% площади экрана. Его редкость обеспечивает мгновенное привлечение внимания к целевым действиям.

**The Functional Nutrients Palette Rule.** Цвета белков, жиров и углеводов строго зафиксированы и не меняют своего значения ни в одном компоненте системы.

## Typography

**Display Font:** `Unbounded` (геометричный дисплейный гротеск)
**Body Font:** `Golos Text` (высокочитаемый гротеск)
**Label/Mono Font:** `IBM Plex Mono` (технический моноширинный шрифт)

### Hierarchy
- **Display** (700, `clamp(32px, 6vw, 62px)`, `1.04`): Главные заголовки страниц в секции hero.
- **Headline** (700, `clamp(19px, 2.4vw, 25px)`, `1.18`): Названия рецептов и карточек блюд.
- **Title** (500, `12px`, `letter-spacing: 0.12em`, UPPERCASE): Заголовки фильтров, секций и списков покупок.
- **Body** (400, `17px`, `1.55`): Текст шагов приготовления и описания блюд (максимальная ширина строки 65–75ch).
- **Label** (500, `12px`, `letter-spacing: 0.1em`, UPPERCASE): Навигационные ссылки, бейджи приёмов пищи и чипы фильтров.

### Named Rules

**The Monospace Metadata Rule.** Любые цифровые значения (калории, БЖУ, граммы, время, число растений) обязаны выводиться исключительно моноширинным шрифтом `IBM Plex Mono`.

## Layout

Сетка строятся вокруг фиксированного контейнера `.wrap` максимальной шириной 1100px с боковыми отступами 24px. 

Секции разделяются сплошной 1px линией (`#C4D1D5`) и отступами 64px. Списки рецептов и планировщиков используют адаптируемые CSS Grid раскладки (от 1 колонки на мобильных до 2–4 колонок на десктопах).

## Elevation & Depth

Система строго придерживается плоской философии **Flat & Border-Bound**.

В интерфейсе отсутствуют внешние падающие тени. Карточки, кнопки, поля ввода и контейнеры разделяются исключительно фоновым контрастом (`#FAFCFC` поверх `#E4EAEC`) и тонкими бордерами (`1px solid #C4D1D5`).

Внутренняя вдавленная тень (`box-shadow: inset 0 0 0 1px #C4D1D5`) используется только для полос питательных гистограмм (`.bar`).

### Named Rules

**The Zero-Elevation Rule.** Никакие карточки или всплывающие панели не используют `box-shadow` для имитации высоты. Вся иерархия достигается контрастом фона и линий.

## Shapes

Форма элементов характеризуется строгими микро-скруглениями:
- **Кнопки, чипы, навигация, поля ввода (`rounded-sm`):** скругление `3px`.
- **Карточки рецептов и блоки правил (`rounded-md`):** скругление `4px`.
- **Индикаторы шагов и чекбоксы:** круглые (50%) или строго квадратные формы.

## Components

### Buttons
- **Primary (`.btn-solid`):** Заливка `#146C7E`, текст белый, скругление 3px, моноширинный uppercase текст `12px`. Наведение: темнеет до `#0F5765`.
- **Secondary (`.btn`):** Фон `#FAFCFC`, бордер `1px solid #C4D1D5`, текст `#16242B`. Наведение: бордер и текст становятся `#146C7E`.

### Chips & Filters
- **Filter Chip (`.chip`):** Фон `#FAFCFC`, бордер `1px solid #C4D1D5`, цвет текста `#586E78`. При выборе (`[aria-pressed="true"]`): заливка и бордер становятся `#146C7E`, текст белый.

### Meal Badges
- **Meal Type Tag (`.badge`):** Моноширинный капс `11px`, бордер `1px solid currentColor`.
  - Завтрак (B): `#D9971F`
  - Обед (L): `#146C7E`
  - Ужин (D): `#5C7A2B`
  - Перед сном (N): `#6A5A8C`

### Cards & Recipe Spread
- **Recipe Card (`.rec`):** Бордер `1px solid #C4D1D5`, скругление `4px`, белый фон `#FAFCFC`.
  - Шапка: заголовок + калораж.
  - Ингредиенты: левая колонка с фоном `#EFF4F5`.
  - Шаги приготовления: нумерованный список с круговыми бейджами шагов (`#146C7E`).

## Do's and Don'ts

### Do:
- **Do** использовать `IBM Plex Mono` для всех численных показателей и меток нутриентов.
- **Do** сохранять скругления в пределах 3px–4px для поддержки строгой инженерной эстетики.
- **Do** использовать 1px границы `#C4D1D5` для визуального разделения блоков.

### Don't:
- **Don't** добавлять декоративные внешние тени (`box-shadow`) или градиенты на карточки.
- **Don't** смешивать акцентные цвета белков, жиров и углеводов вне гистограмм.
- **Don't** использовать сторонние иконки там, где достаточно лаконичной текстовой разметки и моноширинных символов.
