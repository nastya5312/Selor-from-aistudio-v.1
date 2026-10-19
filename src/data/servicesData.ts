import pricesData from './prices.json';

export type Lang = 'ru' | 'en';
export type ThemeMode = 'system' | 'light' | 'dark';
export type FontPair = 'pair1' | 'pair2';
export type PageId =
  | 'home'
  | 'services'
  | 'sajty'
  | 'telegram-boty'
  | 'zayavki'
  | 'dannye'
  | 'zakupki'
  | 'audit'
  | 'calc'
  | 'works'
  | 'demo-okna'
  | 'demo-potolki'
  | 'contacts'
  | 'privacy';

export type GroupId = 'sites' | 'bots' | 'automation' | 'rework';
export type UrgencyMode = 'normal' | 'faster' | 'urgent';

export const PRICES_CONFIG = pricesData;
export const EXCHANGE_RATE = pricesData.usdRate;
export const ROUND_TO = pricesData.roundTo;

export function roundToTen(val: number): number {
  return Math.round(val / ROUND_TO) * ROUND_TO;
}

export function bynToUsd(byn: number): number {
  const raw = byn / EXCHANGE_RATE;
  if (raw < 100) {
    return Math.max(5, Math.round(raw / 5) * 5);
  }
  return Math.round(raw / 10) * 10;
}

export function formatBynUsd(
  byn: number,
  lang: Lang,
  isMonthly = false
): { bynText: string; usdText: string; fullText: string } {
  const usd = bynToUsd(byn);
  const formattedByn = byn.toLocaleString(lang === 'ru' ? 'ru-BY' : 'en-US');
  const suffixByn = isMonthly ? (lang === 'ru' ? ' BYN/мес' : ' BYN/mo') : ' BYN';
  const suffixUsd = isMonthly ? (lang === 'ru' ? '/мес' : '/mo') : '';
  return {
    bynText: `${formattedByn}${suffixByn}`,
    usdText: `~${usd} USD${suffixUsd}`,
    fullText: `${formattedByn}${suffixByn} (~${usd} USD${suffixUsd})`,
  };
}

export interface ServicePackageLine {
  label: { ru: string; en: string };
  priceByn: number;
}

export interface ServicePackage {
  id: string;
  name: { ru: string; en: string };
  subtitle: { ru: string; en: string };
  priceByn: number;
  days: number;
  lines: ServicePackageLine[];
}

export interface ServiceOption {
  id: string;
  label: { ru: string; en: string };
  priceByn: number;
  days?: number;
  perUnit?: boolean;
  maxUnits?: number;
  unitLabel?: { ru: string; en: string };
  onlyForPackages?: string[];
  includedInPackages?: string[];
}

export interface FaqItem {
  q: { ru: string; en: string };
  a: { ru: string; en: string };
}

export interface ServiceItem {
  id: string; // sajty, internet-magazin, etc.
  calcKey: string; // site, shop, sitecalc, quiz, portal, support, rework, migration, payments, hosting, bot, leads, data, procurement, audit
  groupId: GroupId;
  vizType: 'browser' | 'bot' | 'flow' | 'chart';
  isMonthly?: boolean;
  isHourly?: boolean;
  hasDetailPage?: boolean;
  hasDemoQuizzes?: boolean;
  title: { ru: string; en: string };
  calcTitle: { ru: string; en: string };
  shortDesc: { ru: string; en: string };
  basePriceByn: number;
  baseDays: number;
  whoSuits: { ru: string[]; en: string[] };
  whatIncluded: { ru: string[]; en: string[] };
  stages: { ru: string[]; en: string[] };
  packages: ServicePackage[];
  options: ServiceOption[];
  faq?: FaqItem[];
}

export interface ServiceGroup {
  id: GroupId;
  title: { ru: string; en: string };
  subtitle: { ru: string; en: string };
}

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    id: 'sites',
    title: { ru: 'САЙТЫ', en: 'WEBSITES' },
    subtitle: {
      ru: 'Сайты под ключ, интернет-магазины, калькуляторы, квиз-сайты и клиентские порталы.',
      en: 'Turnkey websites, online stores, calculators, quiz sites, and client portals.',
    },
  },
  {
    id: 'bots',
    title: { ru: 'БОТЫ И ЗАЯВКИ', en: 'BOTS & LEADS' },
    subtitle: {
      ru: 'Telegram-боты для бизнеса и настройка приёма заявок без потерь в таблицу с уведомлением.',
      en: 'Telegram bots and zero-loss lead routing into spreadsheets with instant notifications.',
    },
  },
  {
    id: 'automation',
    title: { ru: 'АВТОМАТИЗАЦИЯ И ДАННЫЕ', en: 'AUTOMATION & DATA' },
    subtitle: {
      ru: 'Сбор данных и отчёты, закупки и сравнение предложений поставщиков, аудит процессов или счетов.',
      en: 'Data collection & reports, procurement & supplier comparison, process & invoice audits.',
    },
  },
  {
    id: 'rework',
    title: { ru: 'ДОРАБОТКА И ЗАПУСК', en: 'REWORK & LAUNCH' },
    subtitle: {
      ru: 'Поддержка сайта, почасовая доработка, перенос на другую систему, подключение онлайн-оплаты и настройка хостинга.',
      en: 'Website maintenance, hourly improvements, CMS migration, online payments, and hosting/domain setup.',
    },
  },
];

export const SERVICES: ServiceItem[] = [
  // ГРУППА 1: Сайты (sites)
  {
    id: 'sajty',
    calcKey: 'site',
    groupId: 'sites',
    vizType: 'browser',
    hasDetailPage: true,
    title: { ru: 'Сайты под ключ', en: 'Turnkey Websites' },
    calcTitle: { ru: 'Сайт', en: 'Website' },
    shortDesc: {
      ru: 'Понятные сайты для малого бизнеса: от простого лендинга до сайта-визитки и расширенного многостраничника.',
      en: 'Clear websites for small business: from a simple page to a business card site or extended multi-page platform.',
    },
    basePriceByn: 500,
    baseDays: 5,
    whoSuits: {
      ru: [
        'Малому бизнесу и мастерам, которым нужно быстро и аккуратно представить свои услуги в интернете',
        'Компаниям, которым важна мобильная версия, форма заявки с уведомлением и понятная структура',
        'Проектам, где нужен фиксированный бюджет и предсказуемый срок без затягивания',
      ],
      en: [
        'Small businesses and specialists needing a clean, reliable web presence',
        'Companies prioritizing mobile usability, instant lead notifications, and clear structure',
        'Projects requiring fixed budgets and predictable delivery times',
      ],
    },
    whatIncluded: {
      ru: [
        'Адаптивная вёрстка под телефоны и компьютеры',
        'Форма заявки с уведомлением вам (в пакет «Простой» уже входит бесплатно)',
        'Публикация, домен и настройка (в пакет «Простой» уже входит бесплатно)',
        'Передача всех доступов и объяснение, как пользоваться сайтом после сдачи',
      ],
      en: [
        'Responsive layout for mobile phones and desktops',
        'Lead form with instant notification (included free in the Simple package)',
        'Publication, domain, and setup (included free in the Simple package)',
        'Full credential handover and walkthrough upon completion',
      ],
    },
    stages: {
      ru: [
        '1. Заявка и бесплатная оценка задачи',
        '2. Уточнение деталей и фиксация в техзадании',
        '3. Согласование стоимости и условий',
        '4. Разработка по техзаданию и сдача результата',
      ],
      en: [
        '1. Inquiry and free task assessment',
        '2. Clarifying details in the technical specification',
        '3. Agreeing on price and terms',
        '4. Development and final handover',
      ],
    },
    packages: [
      {
        id: 'simple',
        name: { ru: 'Простой', en: 'Simple' },
        subtitle: {
          ru: 'Быстрый одностраничный сайт (публикация, домен и форма заявки уже включены бесплатно)',
          en: 'Fast single-page website (publication, domain setup, and lead form included free)',
        },
        priceByn: 500,
        days: 5,
        lines: [
          { label: { ru: 'Сборка адаптивной страницы услуг', en: 'Responsive service page build' }, priceByn: 500 },
          { label: { ru: 'Форма заявки с уведомлением вам (входит)', en: 'Lead form with notification (included)' }, priceByn: 0 },
          { label: { ru: 'Публикация, домен и настройка (входит)', en: 'Publication, domain & setup (included)' }, priceByn: 0 },
        ],
      },
      {
        id: 'card',
        name: { ru: 'Визитка', en: 'Business Card Site' },
        subtitle: {
          ru: 'Полноценный сайт-визитка компании с подробным описанием услуг и разделов',
          en: 'Complete company showcase website with detailed service sections',
        },
        priceByn: 900,
        days: 7,
        lines: [
          { label: { ru: 'Структура и проработка разделов сайта-визитки', en: 'Structure & sections of business card site' }, priceByn: 350 },
          { label: { ru: 'Адаптивная вёрстка и проверка на мобильных', en: 'Responsive layout & mobile testing' }, priceByn: 550 },
        ],
      },
      {
        id: 'extended',
        name: { ru: 'Расширенный', en: 'Extended' },
        subtitle: {
          ru: 'Многостраничный сайт с развёрнутым каталогом услуг, портфолио и дополнительными страницами',
          en: 'Multi-page website with extended service catalog, portfolio, and custom sections',
        },
        priceByn: 1800,
        days: 14,
        lines: [
          { label: { ru: 'Проектирование многостраничной структуры', en: 'Multi-page architecture design' }, priceByn: 600 },
          { label: { ru: 'Разработка главной и внутренних страниц', en: 'Home & inner pages development' }, priceByn: 1200 },
        ],
      },
    ],
    options: [
      {
        id: 'custom_design',
        label: { ru: 'Индивидуальный дизайн (только к пакету «Простой»)', en: 'Custom Design (only for Simple package)' },
        priceByn: 300,
        onlyForPackages: ['simple'],
      },
      {
        id: 'animation',
        label: { ru: 'Анимация', en: 'Animation' },
        priceByn: 100,
      },
      {
        id: 'texts_photos',
        label: { ru: 'Тексты и подбор фото', en: 'Copywriting & Photo Selection' },
        priceByn: 250,
      },
      {
        id: 'publish_domain',
        label: { ru: 'Публикация, домен и настройка', en: 'Publication, Domain & Setup' },
        priceByn: 100,
        includedInPackages: ['simple'],
      },
      {
        id: 'lead_form',
        label: { ru: 'Форма заявки с уведомлением вам', en: 'Lead Form with Notification to You' },
        priceByn: 100,
        includedInPackages: ['simple'],
      },
    ],
    faq: [
      {
        q: { ru: 'Что входит в пакет «Простой» за 500 BYN?', en: 'What is included in the Simple package for 500 BYN?' },
        a: {
          ru: 'В пакет «Простой» (500 BYN, 5 дней) уже бесплатно входят форма заявки с уведомлением вам и публикация сайта с настройкой домена. При желании к нему можно добавить индивидуальный дизайн (+300 BYN) или подготовку текстов и фото (+250 BYN).',
          en: 'The Simple package (500 BYN, 5 days) already includes a lead form with instant notification and domain publication free of charge. You can optionally add custom design (+300 BYN) or copywriting & photo selection (+250 BYN).',
        },
      },
      {
        q: { ru: 'Как фиксируются задачи до начала разработки?', en: 'How are tasks fixed before development starts?' },
        a: {
          ru: 'Мы уточняем детали и записываем их в понятное техзадание: что именно делаем и что вы получите в итоге, после чего согласуем стоимость и условия.',
          en: 'We clarify all details and write them down in a clear specification: what we build and what you get at the end, then agree on price and terms.',
        },
      },
      {
        q: { ru: 'Остаёмся ли на связи после сдачи сайта?', en: 'Do you stay in touch after handover?' },
        a: {
          ru: 'Да. При сдаче я передаю результат, объясняю, как им пользоваться, и после сдачи мы остаёмся на связи.',
          en: 'Yes. At handover I explain how everything works, and we stay in touch afterwards.',
        },
      },
    ],
  },
  {
    id: 'internet-magazin',
    calcKey: 'shop',
    groupId: 'sites',
    vizType: 'browser',
    title: { ru: 'Интернет-магазин', en: 'Online Store' },
    calcTitle: { ru: 'Интернет-магазин', en: 'Online Store' },
    shortDesc: {
      ru: 'От аккуратного каталога товаров с заявкой до полноценного магазина с корзиной, онлайн-оплатой и интеграциями.',
      en: 'From a clean product catalog with inquiry form to a full online store with cart, payments, and integrations.',
    },
    basePriceByn: 1500,
    baseDays: 14,
    whoSuits: {
      ru: [
        'Продавцам и производителям, которым нужен удобный каталог с быстрым заказом',
        'Магазинам, которым требуется корзина, расчёт заказа и подключение онлайн-оплаты',
        'Проектам, где нужна связка магазина с внешними системами учёта и доставки',
      ],
      en: [
        'Retailers and producers needing a convenient catalog with quick ordering',
        'Stores requiring shopping cart, checkout, and online payment processing',
        'Businesses needing integration with inventory and delivery services',
      ],
    },
    whatIncluded: {
      ru: [
        'Структура каталога, категории и карточки товаров',
        'Адаптивная витрина для удобного заказа со смартфона',
        'В зависимости от выбранного пакета: форма заявки, полноценная корзина или оплата с интеграциями',
      ],
      en: [
        'Catalog structure, categories, and product cards',
        'Mobile-friendly storefront for smooth ordering on phones',
        'Depending on package: inquiry form, shopping cart, or online payments & integrations',
      ],
    },
    stages: {
      ru: [
        '1. Заявка и оценка структуры каталога',
        '2. Техзадание на функционал витрины и корзины',
        '3. Разработка магазина и подключение модулей',
        '4. Сдача проекта и обучение управлению товарами',
      ],
      en: [
        '1. Inquiry and catalog structure assessment',
        '2. Specification for storefront and checkout',
        '3. Store development and module integration',
        '4. Handover and product management walkthrough',
      ],
    },
    packages: [
      {
        id: 'catalog',
        name: { ru: 'Каталог с заявкой', en: 'Catalog with Inquiry' },
        subtitle: { ru: 'Витрина товаров с категориями и кнопкой заказа/заявки по позициям (14 дн.)', en: 'Product catalog with categories and item inquiry form (14 days)' },
        priceByn: 1500,
        days: 14,
        lines: [
          { label: { ru: 'Витрина категорий и карточки товаров', en: 'Category grid & product cards' }, priceByn: 1000 },
          { label: { ru: 'Форма заявки по выбранным позициям', en: 'Product inquiry form & notifications' }, priceByn: 500 },
        ],
      },
      {
        id: 'cart',
        name: { ru: 'Магазин с корзиной', en: 'Store with Shopping Cart' },
        subtitle: { ru: 'Полноценная корзина, выбор параметров товара и оформление заказа (22 дн.)', en: 'Full shopping cart, product options, and checkout flow (22 days)' },
        priceByn: 2500,
        days: 22,
        lines: [
          { label: { ru: 'Каталог с фильтрами и поиском', en: 'Catalog with filters & search' }, priceByn: 1300 },
          { label: { ru: 'Корзина и пошаговое оформление заказа', en: 'Shopping cart & checkout flow' }, priceByn: 1200 },
        ],
      },
      {
        id: 'full',
        name: { ru: 'Магазин с оплатой и интеграциями', en: 'Store with Payments & Integrations' },
        subtitle: { ru: 'Интернет-магазин с онлайн-оплатой, синхронизацией остатков и CRM (44 дн.)', en: 'Online store with payment gateway, inventory sync, and CRM (44 days)' },
        priceByn: 3500,
        days: 44,
        lines: [
          { label: { ru: 'Полный каталог, корзина и личный кабинет', en: 'Full catalog, cart & customer flow' }, priceByn: 2000 },
          { label: { ru: 'Подключение онлайн-оплаты и внешних интеграций', en: 'Online payments & external integrations' }, priceByn: 1500 },
        ],
      },
    ],
    options: [],
  },
  {
    id: 'kalkulyator',
    calcKey: 'sitecalc',
    groupId: 'sites',
    vizType: 'chart',
    title: { ru: 'Калькулятор на ваш сайт', en: 'Calculator for Your Website' },
    calcTitle: { ru: 'Калькулятор на ваш сайт', en: 'Calculator for Your Website' },
    shortDesc: {
      ru: 'Интерактивный расчёт стоимости услуг или товаров, который встраивается на ваш сайт и отправляет готовую смету в заявку.',
      en: 'Interactive cost calculator widget embedded into your website that sends itemized estimates with leads.',
    },
    basePriceByn: 400,
    baseDays: 5,
    whoSuits: {
      ru: [
        'Компаниям, где цена зависит от параметров заказа (площадь, количество, материалы, опции)',
        'Владельцам сайтов, которые хотят дать клиенту быстрый расчёт без звонка',
      ],
      en: [
        'Businesses where pricing depends on order parameters (area, quantity, materials, options)',
        'Website owners wanting to offer instant self-service estimates',
      ],
    },
    whatIncluded: {
      ru: [
        'Вёрстка и программирование логики расчёта по вашей формуле',
        'Встраивание калькулятора на ваш сайт',
        'Передача выбранных клиентом параметров вместе с заявкой',
      ],
      en: [
        'UI layout and formula programming according to your rates',
        'Seamless embedding into your existing website',
        'Passing selected parameters directly with the inquiry',
      ],
    },
    stages: {
      ru: [
        '1. Разбор вашей формулы и параметров',
        '2. Согласование техзадания и внешнего вида',
        '3. Разработка и тестирование расчётов',
        '4. Установка на сайт и сдача',
      ],
      en: [
        '1. Reviewing your pricing formula and inputs',
        '2. Approving specification and layout',
        '3. Coding and testing calculations',
        '4. Embedding on site and handover',
      ],
    },
    packages: [
      {
        id: 'simple',
        name: { ru: 'Простой', en: 'Simple' },
        subtitle: { ru: 'Базовый калькулятор основных параметров с итоговой суммой (5 дн.)', en: 'Basic parameter calculator with total output (5 days)' },
        priceByn: 400,
        days: 5,
        lines: [
          { label: { ru: 'Настройка формулы и полей выбора', en: 'Formula & input controls setup' }, priceByn: 250 },
          { label: { ru: 'Вёрстка и установка на сайт', en: 'Styling & website installation' }, priceByn: 150 },
        ],
      },
      {
        id: 'extended',
        name: { ru: 'Расширенный', en: 'Extended' },
        subtitle: { ru: 'Многошаговый калькулятор со сложными условиями, зависимостями и детальной сводкой (8 дн.)', en: 'Multi-step calculator with conditional rules and detailed breakdown (8 days)' },
        priceByn: 800,
        days: 8,
        lines: [
          { label: { ru: 'Сложная логика коэффициентов и шагов', en: 'Complex multi-step conditional logic' }, priceByn: 500 },
          { label: { ru: 'Детальная ведомость расчёта и интеграция с формой', en: 'Detailed summary sheet & form integration' }, priceByn: 300 },
        ],
      },
    ],
    options: [],
  },
  {
    id: 'kviz-sajt',
    calcKey: 'quiz',
    groupId: 'sites',
    vizType: 'flow',
    hasDemoQuizzes: true,
    title: { ru: 'Квиз-сайт', en: 'Quiz Website' },
    calcTitle: { ru: 'Квиз-сайт', en: 'Quiz Website' },
    shortDesc: {
      ru: 'Пошаговый сайт-опросник для быстрого подбора услуги и сбора контактов. Публикация и форма заявки с уведомлением уже входят в базовый пакет.',
      en: 'Step-by-step interactive quiz website for service selection and lead generation. Publication and lead form are included.',
    },
    basePriceByn: 700,
    baseDays: 7,
    whoSuits: {
      ru: [
        'Оконным, потолочным, строительным, мебельным и сервисным компаниям',
        'Тем, кому нужно быстро получать структурированные заявки с параметрами заказа',
      ],
      en: [
        'Window, ceiling, construction, furniture, and service companies',
        'Businesses wanting structured leads with pre-answered customer parameters',
      ],
    },
    whatIncluded: {
      ru: [
        'Пакет «Простой» (700 BYN, 7 дн.) уже включает публикацию и форму заявки с уведомлением вам',
        'Пошаговые вопросы с прогресс-баром и адаптивной вёрсткой',
        'При необходимости подключаются ветвление вопросов (+200 BYN) и расчёт стоимости в конце (+250 BYN)',
      ],
      en: [
        'Simple package (700 BYN, 7 days) includes publication and lead notification form',
        'Step-by-step questions with progress bar and mobile-first layout',
        'Optional question branching (+200 BYN) and end-of-quiz price calculation (+250 BYN)',
      ],
    },
    stages: {
      ru: [
        '1. Заявка и обсуждение вопросов квиза',
        '2. Техзадание на шаги и логику',
        '3. Разработка квиз-сайта и настройка уведомлений',
        '4. Публикация и сдача',
      ],
      en: [
        '1. Inquiry and quiz questions planning',
        '2. Specification of steps and logic',
        '3. Quiz development and notification setup',
        '4. Publication and handover',
      ],
    },
    packages: [
      {
        id: 'simple',
        name: { ru: 'Простой', en: 'Simple' },
        subtitle: { ru: 'Готовый квиз-сайт (публикация и форма заявки с уведомлением вам входят бесплатно, 7 дн.)', en: 'Complete quiz site (publication and notification form included free, 7 days)' },
        priceByn: 700,
        days: 7,
        lines: [
          { label: { ru: 'Разработка пошагового квиз-сайта', en: 'Step-by-step quiz site development' }, priceByn: 700 },
          { label: { ru: 'Публикация (входит в «Простой»)', en: 'Publication (included in Simple)' }, priceByn: 0 },
          { label: { ru: 'Форма заявки с уведомлением вам (входит в «Простой»)', en: 'Lead form with notification (included in Simple)' }, priceByn: 0 },
        ],
      },
    ],
    options: [
      {
        id: 'branching',
        label: { ru: 'Ветвление вопросов', en: 'Question Branching' },
        priceByn: 200,
      },
      {
        id: 'end_calc',
        label: { ru: 'Расчёт стоимости в конце', en: 'Cost Calculation at the End' },
        priceByn: 250,
      },
      {
        id: 'publish_included',
        label: { ru: 'Публикация', en: 'Publication' },
        priceByn: 0,
        includedInPackages: ['simple'],
      },
      {
        id: 'form_included',
        label: { ru: 'Форма заявки с уведомлением вам', en: 'Lead Form with Notification to You' },
        priceByn: 0,
        includedInPackages: ['simple'],
      },
    ],
  },
  {
    id: 'portal',
    calcKey: 'portal',
    groupId: 'sites',
    vizType: 'browser',
    title: { ru: 'Портал', en: 'Portal' },
    calcTitle: { ru: 'Портал', en: 'Portal' },
    shortDesc: {
      ru: 'Веб-портал или личный кабинет с ролями пользователей, внутренними разделами/модулями и интеграциями с внешними сервисами.',
      en: 'Web portal or personal dashboard with user roles, custom modules, and external service integrations.',
    },
    basePriceByn: 2500,
    baseDays: 30,
    whoSuits: {
      ru: [
        'Компаниям, которым нужен личный кабинет для клиентов, партнёров или сотрудников',
        'Проектам с разграничением прав доступа по ролям и специализированными модулями',
      ],
      en: [
        'Companies needing a private portal for clients, partners, or staff',
        'Projects requiring role-based permissions and custom business modules',
      ],
    },
    whatIncluded: {
      ru: [
        'Базовое ядро портала и система авторизации (2500 BYN, 30 дн.)',
        'Гибкое масштабирование: настройка нужного числа ролей пользователей, разделов/модулей и внешних интеграций',
      ],
      en: [
        'Base portal core and authentication system (2,500 BYN, 30 days)',
        'Flexible scaling: add custom user roles, modules/sections, and external API integrations',
      ],
    },
    stages: {
      ru: [
        '1. Заявка и описание ролей и модулей',
        '2. Подробное техзадание на архитектуру портала',
        '3. Поэтапная разработка базы, кабинетов и интеграций',
        '4. Сдача, инструктаж и поддержка на связи',
      ],
      en: [
        '1. Inquiry and role/module scoping',
        '2. Detailed portal specification',
        '3. Phased development of database, dashboards, and integrations',
        '4. Handover, training, and ongoing communication',
      ],
    },
    packages: [
      {
        id: 'basic',
        name: { ru: 'Базовый', en: 'Basic' },
        subtitle: { ru: 'Базовая архитектура портала, авторизация и основной кабинет (30 дн.)', en: 'Base portal architecture, authentication, and core dashboard (30 days)' },
        priceByn: 2500,
        days: 30,
        lines: [
          { label: { ru: 'Ядро портала и система авторизации', en: 'Portal core & authentication system' }, priceByn: 1200 },
          { label: { ru: 'Базовый личный кабинет и панель управления', en: 'Base dashboard & admin panel' }, priceByn: 1300 },
        ],
      },
    ],
    options: [
      {
        id: 'user_role',
        label: { ru: 'Роль пользователя', en: 'User Role' },
        priceByn: 150,
        perUnit: true,
        maxUnits: 5,
        unitLabel: { ru: 'ролей (до 5)', en: 'roles (up to 5)' },
      },
      {
        id: 'portal_module',
        label: { ru: 'Раздел или модуль', en: 'Section or Module' },
        priceByn: 250,
        perUnit: true,
        maxUnits: 10,
        unitLabel: { ru: 'модулей (до 10)', en: 'modules (up to 10)' },
      },
      {
        id: 'ext_integration',
        label: { ru: 'Интеграция с внешним сервисом', en: 'External Service Integration' },
        priceByn: 300,
        perUnit: true,
        maxUnits: 5,
        unitLabel: { ru: 'интеграций (до 5)', en: 'integrations (up to 5)' },
      },
    ],
  },

  // ГРУППА 2: Боты и заявки (bots)
  {
    id: 'telegram-boty',
    calcKey: 'bot',
    groupId: 'bots',
    vizType: 'bot',
    hasDetailPage: true,
    title: { ru: 'Telegram-боты', en: 'Telegram Bots' },
    calcTitle: { ru: 'Telegram-бот', en: 'Telegram Bot' },
    shortDesc: {
      ru: 'Разработка Telegram-ботов: от простого бота для заявок и ответов до решений с базой данных, CRM, оплатой или личным кабинетом.',
      en: 'Telegram bots: from a simple lead/FAQ bot to solutions with a database, CRM, online payment, or user account.',
    },
    basePriceByn: 750,
    baseDays: 7,
    whoSuits: {
      ru: [
        'Малому бизнесу и сервисам для автоматического приёма заявок и консультаций в Telegram',
        'Проектам, которым нужен бот с базой клиентов/товаров или связкой с CRM и оплатой',
      ],
      en: [
        'Small businesses automating lead intake and customer replies in Telegram',
        'Projects needing a bot with a database or full CRM and payment integration',
      ],
    },
    whatIncluded: {
      ru: [
        'Проектирование сценария кнопок и диалогов по техзаданию',
        'Разработка и запуск Telegram-бота',
        'Передача результата и подробное объяснение, как им пользоваться',
      ],
      en: [
        'Designing button menus and conversation flows per specification',
        'Bot coding and deployment',
        'Full handover and clear operating instructions',
      ],
    },
    stages: {
      ru: [
        '1. Заявка и бесплатная оценка задачи',
        '2. Техзадание на ветки и функции бота',
        '3. Разработка и тестирование сценариев',
        '4. Сдача бота и поддержка после запуска',
      ],
      en: [
        '1. Inquiry and free assessment',
        '2. Technical specification of bot flows',
        '3. Development and scenario testing',
        '4. Handover and post-launch support',
      ],
    },
    packages: [
      {
        id: 'simple',
        name: { ru: 'Простой', en: 'Simple' },
        subtitle: { ru: 'Кнопочное меню, ответы на частые вопросы и приём заявок с уведомлением вам (7 дн.)', en: 'Button menu, FAQ answers, and lead intake with alerts (7 days)' },
        priceByn: 750,
        days: 7,
        lines: [
          { label: { ru: 'Сценарий кнопок и сбор заявки', en: 'Button flow & lead intake' }, priceByn: 450 },
          { label: { ru: 'Уведомления в ваш Telegram и запуск', en: 'Telegram alerts & deployment' }, priceByn: 300 },
        ],
      },
      {
        id: 'db',
        name: { ru: 'С базой', en: 'With Database' },
        subtitle: { ru: 'Хранение заявок, пользователей или каталога в базе данных / таблицах (14 дн.)', en: 'Storing leads, users, or catalog in a database / spreadsheet (14 days)' },
        priceByn: 1400,
        days: 14,
        lines: [
          { label: { ru: 'Логика бота и подключение базы данных', en: 'Bot logic & database connection' }, priceByn: 850 },
          { label: { ru: 'Панель/команды управления записями', en: 'Admin management commands & sync' }, priceByn: 550 },
        ],
      },
      {
        id: 'crm',
        name: { ru: 'С CRM, оплатой или кабинетом', en: 'With CRM, Payment or Account' },
        subtitle: { ru: 'Продвинутый бот с приёмом оплаты, личным кабинетом или прямой связкой с CRM (22 дн.)', en: 'Advanced bot with payments, personal cabinet, or CRM integration (22 days)' },
        priceByn: 2200,
        days: 22,
        lines: [
          { label: { ru: 'Разработка бота и личного кабинета', en: 'Bot & user account development' }, priceByn: 1300 },
          { label: { ru: 'Подключение CRM или платёжного модуля', en: 'CRM or payment gateway integration' }, priceByn: 900 },
        ],
      },
    ],
    options: [
      {
        id: 'extra_bot_integration',
        label: { ru: 'Ещё одна интеграция (только для пакета «С CRM, оплатой или кабинетом»)', en: 'Additional Integration (only for CRM/Payment package)' },
        priceByn: 300,
        perUnit: true,
        maxUnits: 5,
        unitLabel: { ru: 'интеграций (до 5)', en: 'integrations (up to 5)' },
        onlyForPackages: ['crm'],
      },
    ],
    faq: [
      {
        q: { ru: 'Какой пакет бота выбрать для старта?', en: 'Which bot package should I choose to start?' },
        a: {
          ru: 'Если нужно принимать заявки по кнопкам и отвечать на типовые вопросы — подойдёт «Простой» (750 BYN, 7 дн.). Если требуется хранить базу клиентов и каталог — «С базой» (1400 BYN, 14 дн.). Для связки с CRM и приёма оплат — пакет за 2200 BYN.',
          en: 'For button-based lead capture and FAQs, choose Simple (750 BYN, 7 days). If you need a database of users/items, choose With Database (1,400 BYN, 14 days). For CRM & payments, choose the 2,200 BYN tier.',
        },
      },
      {
        q: { ru: 'Можно ли подключить несколько внешних интеграций?', en: 'Can we connect multiple external integrations?' },
        a: {
          ru: 'Да, к пакету «С CRM, оплатой или кабинетом» можно добавить до 5 дополнительных интеграций (+300 BYN за каждую).',
          en: 'Yes, the CRM/Payment package supports up to 5 additional integrations (+300 BYN each).',
        },
      },
    ],
  },
  {
    id: 'zayavki',
    calcKey: 'leads',
    groupId: 'bots',
    vizType: 'flow',
    hasDetailPage: true,
    title: { ru: 'Заявки без потерь', en: 'Zero-Loss Leads' },
    calcTitle: { ru: 'Заявки без потерь', en: 'Zero-Loss Leads' },
    shortDesc: {
      ru: 'Автоматическое сохранение всех входящих заявок с сайта или форм в аккуратную таблицу с мгновенным уведомлением вам.',
      en: 'Automatic logging of all incoming website inquiries into a clean spreadsheet with instant notifications.',
    },
    basePriceByn: 250,
    baseDays: 3,
    whoSuits: {
      ru: [
        'Владельцам сайтов, где письма с заявками иногда теряются или падают в спам',
        'Тем, кому нужен простой и наглядный учёт всех обращений в таблице с уведомлением в Telegram',
      ],
      en: [
        'Website owners whose email inquiries sometimes get lost or land in spam',
        'Teams wanting a clean spreadsheet log of every inquiry with instant Telegram alerts',
      ],
    },
    whatIncluded: {
      ru: [
        'Связка формы заявки с таблицей учёта',
        'Мгновенное уведомление о новой заявке в ваш мессенджер',
        'Проверка доставки и защита от потери обращений',
      ],
      en: [
        'Connecting your lead form to a tracking spreadsheet',
        'Instant notification to your messenger when a lead arrives',
        'Delivery verification so no inquiry is ever lost',
      ],
    },
    stages: {
      ru: [
        '1. Заявка и осмотр ваших форм',
        '2. Настройка записи в таблицу и уведомлений',
        '3. Тестовая проверка и сдача (3 дн.)',
      ],
      en: [
        '1. Inquiry and form inspection',
        '2. Configuring sheet logging and notifications',
        '3. Testing and handover (3 days)',
      ],
    },
    packages: [
      {
        id: 'sheet_notify',
        name: { ru: 'В таблицу с уведомлением', en: 'To Spreadsheet with Notification' },
        subtitle: { ru: 'Запись каждой заявки в таблицу + мгновенное уведомление вам (3 дн.)', en: 'Logging every lead into a spreadsheet + instant alert to you (3 days)' },
        priceByn: 250,
        days: 3,
        lines: [
          { label: { ru: 'Интеграция формы с таблицей и уведомлениями', en: 'Form to spreadsheet & notification setup' }, priceByn: 250 },
        ],
      },
    ],
    options: [],
  },

  // ГРУППА 3: Автоматизация и данные (automation)
  {
    id: 'dannye',
    calcKey: 'data',
    groupId: 'automation',
    vizType: 'chart',
    hasDetailPage: true,
    title: { ru: 'Данные и отчёты', en: 'Data & Reports' },
    calcTitle: { ru: 'Данные и отчёты', en: 'Data & Reports' },
    shortDesc: {
      ru: 'Автоматический сбор данных с сайта, сведение цифр в понятные отчёты и наведение порядка в рабочих таблицах.',
      en: 'Automated data collection from a website, consolidating metrics into clear reports, and organizing spreadsheets.',
    },
    basePriceByn: 250,
    baseDays: 5,
    whoSuits: {
      ru: [
        'Тем, кому нужно собрать каталог или открытые данные с сайта в удобную таблицу',
        'Руководителям, которым нужен понятный управленческий отчёт или порядок в формулах и таблицах',
      ],
      en: [
        'Businesses needing structured data collected from a website into a spreadsheet',
        'Managers needing clean reports or well-organized formulas and tables',
      ],
    },
    whatIncluded: {
      ru: [
        'Сбор данных с одного сайта (250 BYN, 5 дн.) либо отчёт и наведение порядка в таблицах (250 BYN, 5 дн.)',
        'При большом объёме можно добавить дополнительные часы работы (+50 BYN/ч, до 10 ч)',
      ],
      en: [
        'Data collection from one site (250 BYN, 5 days) or spreadsheet cleanup & reporting (250 BYN, 5 days)',
        'Optional additional hours (+50 BYN/hr, up to 10 hrs) for custom tasks',
      ],
    },
    stages: {
      ru: [
        '1. Заявка и пример исходных данных',
        '2. Согласование структуры итоговой таблицы/отчёта',
        '3. Сбор/настройка и проверка точности цифр',
        '4. Сдача готовой таблицы или скрипта',
      ],
      en: [
        '1. Inquiry and sample data review',
        '2. Agreeing on output spreadsheet/report structure',
        '3. Script/formula setup and accuracy check',
        '4. Handover of clean spreadsheet or tool',
      ],
    },
    packages: [
      {
        id: 'scraping',
        name: { ru: 'Сбор данных с одного сайта', en: 'Data Collection from One Website' },
        subtitle: { ru: 'Парсинг и выгрузка нужных позиций в чистую таблицу (5 дн.)', en: 'Scraping and exporting structured items into a clean sheet (5 days)' },
        priceByn: 250,
        days: 5,
        lines: [
          { label: { ru: 'Настройка сбора и очистка данных в таблицу', en: 'Scraper setup & clean spreadsheet export' }, priceByn: 250 },
        ],
      },
      {
        id: 'report',
        name: { ru: 'Отчёт или наведение порядка в таблицах', en: 'Report or Spreadsheet Organization' },
        subtitle: { ru: 'Структурирование таблиц, формул и сборка сводного отчёта (5 дн.)', en: 'Structuring sheets, formulas, and building a summary report (5 days)' },
        priceByn: 250,
        days: 5,
        lines: [
          { label: { ru: 'Наведение порядка в формулах и сводный лист', en: 'Formula cleanup & summary report tab' }, priceByn: 250 },
        ],
      },
    ],
    options: [
      {
        id: 'extra_hours_data',
        label: { ru: 'Дополнительные часы', en: 'Additional Hours' },
        priceByn: 50,
        perUnit: true,
        maxUnits: 10,
        unitLabel: { ru: 'ч. (до 10)', en: 'hrs (up to 10)' },
      },
    ],
    faq: [
      {
        q: { ru: 'В каком формате я получу собранные данные или отчёт?', en: 'In what format will I receive the collected data or report?' },
        a: {
          ru: 'В удобной рабочей таблице (Google Таблицы или Excel) с настроенной структурой, формулами и понятным сводным листом.',
          en: 'In a clean spreadsheet (Google Sheets or Excel) with structured columns, verified formulas, and an executive summary tab.',
        },
      },
    ],
  },
  {
    id: 'zakupki',
    calcKey: 'procurement',
    groupId: 'automation',
    vizType: 'chart',
    hasDetailPage: true,
    title: { ru: 'Закупки и сравнение предложений', en: 'Procurement & Offer Comparison' },
    calcTitle: { ru: 'Закупки и сравнение предложений', en: 'Procurement & Offer Comparison' },
    shortDesc: {
      ru: 'Разовое сравнение прайсов или настройка постоянной системы сравнения предложений поставщиков под вашу номенклатуру.',
      en: 'One-time supplier quote comparison or configuring a reusable comparison system tailored to your SKU catalog.',
    },
    basePriceByn: 250,
    baseDays: 3,
    whoSuits: {
      ru: [
        'Снабженцам и руководителям для быстрого выбора лучших цен среди нескольких поставщиков',
        'Компаниям, которым нужна регулярная система сведения прайс-листов и отчёт для руководителя',
      ],
      en: [
        'Buyers and owners comparing prices across multiple suppliers',
        'Companies needing a repeatable price comparison matrix and executive summary',
      ],
    },
    whatIncluded: {
      ru: [
        'Пакет «Разовое сравнение» (250 BYN, 3 дн.) или «Настройка системы сравнения под вашу номенклатуру» (1200 BYN, 10 дн.)',
        'Подключение нужного количества поставщиков/источников (+50 BYN за каждого, до 20) и отчёта для руководителя (+150 BYN)',
      ],
      en: [
        'One-time comparison (250 BYN, 3 days) or full comparison system setup for your SKUs (1,200 BYN, 10 days)',
        'Add suppliers/sources (+50 BYN each, up to 20) and an executive report (+150 BYN)',
      ],
    },
    stages: {
      ru: [
        '1. Заявка и изучение прайс-листов поставщиков',
        '2. Техзадание на правила сопоставления позиций',
        '3. Сборка таблицы/системы сравнения',
        '4. Сдача и объяснение работы',
      ],
      en: [
        '1. Inquiry and supplier price list review',
        '2. Specification of SKU matching rules',
        '3. Building comparison sheet/system',
        '4. Handover and walkthrough',
      ],
    },
    packages: [
      {
        id: 'once',
        name: { ru: 'Разовое сравнение', en: 'One-Time Comparison' },
        subtitle: { ru: 'Сведение и сравнение предложений поставщиков по вашей заявке (3 дн.)', en: 'Consolidating and comparing supplier offers for a batch (3 days)' },
        priceByn: 250,
        days: 3,
        lines: [
          { label: { ru: 'Сведение предложений в единую таблицу сравнения', en: 'Consolidating offers into comparison sheet' }, priceByn: 250 },
        ],
      },
      {
        id: 'system',
        name: { ru: 'Настройка системы сравнения под вашу номенклатуру', en: 'Custom Comparison System Setup' },
        subtitle: { ru: 'Постоянный инструмент сопоставления прайсов под ваши артикулы (10 дн.)', en: 'Reusable price matching system tailored to your nomenclature (10 days)' },
        priceByn: 1200,
        days: 10,
        lines: [
          { label: { ru: 'База номенклатуры и правила сопоставления цен', en: 'SKU database & automated price matching rules' }, priceByn: 1200 },
        ],
      },
    ],
    options: [
      {
        id: 'suppliers_count',
        label: { ru: 'Поставщики или источники предложений', en: 'Suppliers or Offer Sources' },
        priceByn: 50,
        perUnit: true,
        maxUnits: 20,
        unitLabel: { ru: 'источников (до 20)', en: 'sources (up to 20)' },
      },
      {
        id: 'exec_report',
        label: { ru: 'Отчёт для руководителя', en: 'Executive Summary Report' },
        priceByn: 150,
      },
    ],
    faq: [
      {
        q: { ru: 'Чем отличается разовое сравнение от настройки системы?', en: 'What is the difference between a one-time comparison and a custom system?' },
        a: {
          ru: 'Разовое сравнение (250 BYN, 3 дн.) подходит для одной конкретной закупки. Система сравнения (1200 BYN, 10 дн.) настраивается под вашу номенклатуру для регулярной работы.',
          en: 'One-time comparison (250 BYN, 3 days) covers a single procurement batch. The custom system (1,200 BYN, 10 days) is built for ongoing supplier comparisons.',
        },
      },
    ],
  },
  {
    id: 'audit',
    calcKey: 'audit',
    groupId: 'automation',
    vizType: 'chart',
    hasDetailPage: true,
    title: { ru: 'Аудит', en: 'Audit' },
    calcTitle: { ru: 'Аудит', en: 'Audit' },
    shortDesc: {
      ru: 'Спокойный разбор текущих процессов, таблиц или счетов с понятным списком: где теряется время или деньги и как это упростить.',
      en: 'Clear review of your current workflows, spreadsheets, or invoices with actionable recommendations.',
    },
    basePriceByn: 250,
    baseDays: 5,
    whoSuits: {
      ru: [
        'Владельцам бизнеса перед доработкой сайта или внедрением автоматизации',
        'Тем, кто хочет проверить корректность счетов, смет или текущих рутинных процессов',
      ],
      en: [
        'Business owners planning website improvements or workflow automation',
        'Teams wanting an independent review of processes, spreadsheets, or contractor invoices',
      ],
    },
    whatIncluded: {
      ru: [
        'Пакет «Аудит процессов или счетов» (250 BYN, 5 дн.)',
        'Понятное заключение с рекомендациями по делу',
        'При необходимости — дополнительные часы глубокого разбора (+50 BYN за час, до 10 ч)',
      ],
      en: [
        'Process or Invoice Audit package (250 BYN, 5 days)',
        'Clear plain-language report with practical recommendations',
        'Optional additional hours for deep analysis (+50 BYN/hr, up to 10 hrs)',
      ],
    },
    stages: {
      ru: [
        '1. Заявка и передача вводных материалов',
        '2. Проверка процессов, таблиц или счетов',
        '3. Подготовка понятного отчёта и разбор с вами (5 дн.)',
      ],
      en: [
        '1. Inquiry and input materials review',
        '2. Inspection of workflows, sheets, or invoices',
        '3. Clear report and walkthrough (5 days)',
      ],
    },
    packages: [
      {
        id: 'process_audit',
        name: { ru: 'Аудит процессов или счетов', en: 'Process or Invoice Audit' },
        subtitle: { ru: 'Проверка текущих процессов, таблиц или счетов с конкретными выводами (5 дн.)', en: 'Review of workflows, sheets, or invoices with concrete findings (5 days)' },
        priceByn: 250,
        days: 5,
        lines: [
          { label: { ru: 'Анализ и подготовка письменного заключения', en: 'Analysis & written action report' }, priceByn: 250 },
        ],
      },
    ],
    options: [
      {
        id: 'extra_hours_audit',
        label: { ru: 'Дополнительные часы', en: 'Additional Hours' },
        priceByn: 50,
        perUnit: true,
        maxUnits: 10,
        unitLabel: { ru: 'ч. (до 10)', en: 'hrs (up to 10)' },
      },
    ],
  },

  // ГРУППА 4: Доработка и запуск (rework)
  {
    id: 'podderzhka',
    calcKey: 'support',
    groupId: 'rework',
    vizType: 'browser',
    isMonthly: true,
    title: { ru: 'Поддержка сайта', en: 'Website Maintenance' },
    calcTitle: { ru: 'Поддержка сайта', en: 'Website Maintenance' },
    shortDesc: {
      ru: 'Ежемесячное сопровождение сайта: присмотр за работой, резервные копии и внесение текущих правок без лишней головной боли.',
      en: 'Monthly website care: uptime monitoring, backups, and routine content/layout updates.',
    },
    basePriceByn: 100,
    baseDays: 1,
    whoSuits: {
      ru: [
        'Владельцам сайтов, которым нужен постоянный присмотр за доменом, хостингом и формами',
        'Компаниям, где периодически нужно обновить цены, тексты или фотографии',
      ],
      en: [
        'Website owners wanting reliable ongoing care for their domain, hosting, and forms',
        'Businesses needing periodic updates to prices, texts, or photos',
      ],
    },
    whatIncluded: {
      ru: [
        'Тариф «Базовая» (100 BYN в месяц) или «Стандарт» (220 BYN в месяц)',
        'Контроль работоспособности сайта, резервные копии и текущие обновления',
        'Фиксированная помесячная оплата (не зависит от коэффициента срочности)',
      ],
      en: [
        'Basic plan (100 BYN/month) or Standard plan (220 BYN/month)',
        'Uptime checks, regular backups, and routine content updates',
        'Fixed monthly fee (unaffected by urgency multipliers)',
      ],
    },
    stages: {
      ru: [
        '1. Приём сайта на сопровождение и настройка резервных копий',
        '2. Выполнение задач по мере обращения в течение месяца',
      ],
      en: [
        '1. Onboarding website and configuring backups',
        '2. Handling ongoing update requests throughout the month',
      ],
    },
    packages: [
      {
        id: 'basic',
        name: { ru: 'Базовая', en: 'Basic' },
        subtitle: { ru: 'Присмотр за сайтом, бэкапы и мелкие обновления (100 BYN в месяц)', en: 'Uptime monitoring, backups, and minor updates (100 BYN/month)' },
        priceByn: 100,
        days: 0,
        lines: [
          { label: { ru: 'Абонентская поддержка (Базовая)', en: 'Monthly maintenance (Basic)' }, priceByn: 100 },
        ],
      },
      {
        id: 'standard',
        name: { ru: 'Стандарт', en: 'Standard' },
        subtitle: { ru: 'Регулярное обновление материалов, правки и техническое сопровождение (220 BYN в месяц)', en: 'Regular content updates, layout tweaks, and technical care (220 BYN/month)' },
        priceByn: 220,
        days: 0,
        lines: [
          { label: { ru: 'Абонентская поддержка (Стандарт)', en: 'Monthly maintenance (Standard)' }, priceByn: 220 },
        ],
      },
    ],
    options: [],
  },
  {
    id: 'dorabotka',
    calcKey: 'rework',
    groupId: 'rework',
    vizType: 'browser',
    isHourly: true,
    title: { ru: 'Доработка сайтов', en: 'Website Improvements' },
    calcTitle: { ru: 'Доработка сайтов', en: 'Website Improvements' },
    shortDesc: {
      ru: 'Почасовая доработка существующего сайта: починка вёрстки, правка форм, добавление блоков и устранение ошибок.',
      en: 'Hourly improvements for your existing website: fixing layout issues, updating forms, and adding new sections.',
    },
    basePriceByn: 50,
    baseDays: 1,
    whoSuits: {
      ru: [
        'Если на сайте нужно аккуратно исправить конкретные замечания без полной переделки',
        'Когда требуется понятная почасовая оценка (первый час — 50 BYN, далее +50 BYN за час)',
      ],
      en: [
        'When your existing site needs targeted fixes without a full rebuild',
        'When you prefer transparent hourly billing (50 BYN first hour, +50 BYN per extra hour)',
      ],
    },
    whatIncluded: {
      ru: [
        'Пакет «Первый час» (50 BYN)',
        'Счётчик «Дополнительные часы» (+50 BYN за час, до 39 часов) под объём вашей задачи',
      ],
      en: [
        'First Hour package (50 BYN)',
        'Additional Hours counter (+50 BYN/hour, up to 39 hours) matched to your task scope',
      ],
    },
    stages: {
      ru: [
        '1. Оценка списка правок в часах до старта работ',
        '2. Выполнение доработок и проверка результата',
      ],
      en: [
        '1. Estimating the fix list in hours before starting',
        '2. Implementing fixes and verifying results',
      ],
    },
    packages: [
      {
        id: 'first_hour',
        name: { ru: 'Первый час', en: 'First Hour' },
        subtitle: { ru: 'Базовая ставка за первый час работы по доработке сайта (50 BYN)', en: 'Base rate for the first hour of website rework (50 BYN)' },
        priceByn: 50,
        days: 1,
        lines: [
          { label: { ru: 'Первый час работы специалиста', en: 'First hour of developer work' }, priceByn: 50 },
        ],
      },
    ],
    options: [
      {
        id: 'extra_hours_rework',
        label: { ru: 'Дополнительные часы', en: 'Additional Hours' },
        priceByn: 50,
        perUnit: true,
        maxUnits: 39,
        unitLabel: { ru: 'ч. (до 39)', en: 'hrs (up to 39)' },
      },
    ],
  },
  {
    id: 'perenos-cms',
    calcKey: 'migration',
    groupId: 'rework',
    vizType: 'flow',
    title: { ru: 'Перенос сайта на другую систему', en: 'Website System Migration' },
    calcTitle: { ru: 'Перенос сайта на другую систему', en: 'Website System Migration' },
    shortDesc: {
      ru: 'Бережный перенос сайта с конструктора или старой CMS с сохранением страниц, каталога товаров и адресов ссылок (редиректов).',
      en: 'Careful migration of your website from a builder or legacy CMS while preserving pages, catalog, and URL redirects.',
    },
    basePriceByn: 600,
    baseDays: 5,
    whoSuits: {
      ru: [
        'Владельцам сайтов до 10 или до 30 страниц (и более), желающим уйти с неудобной платформы',
        'Магазинам, которым нужно перенести каталог товаров и сохранить адреса страниц для поиска',
      ],
      en: [
        'Owners of websites up to 10 or 30+ pages moving away from a restrictive platform',
        'Stores needing product catalog migration and URL redirect preservation',
      ],
    },
    whatIncluded: {
      ru: [
        'Пакеты «Простой, до 10 страниц» (600 BYN, 5 дн.) и «Стандарт, до 30 страниц» (1000 BYN, 10 дн.)',
        'Дополнения: «Ещё страницы» (+100 BYN за каждые 10 страниц), «Перенос каталога товаров» (+250 BYN), «Сохранение адресов страниц / редиректы» (+100 BYN)',
      ],
      en: [
        'Simple up to 10 pages (600 BYN, 5 days) and Standard up to 30 pages (1,000 BYN, 10 days)',
        'Add-ons: More pages (+100 BYN per 10 pages), Product catalog migration (+250 BYN), URL preservation / redirects (+100 BYN)',
      ],
    },
    stages: {
      ru: [
        '1. Оценка объёма страниц и структуры старого сайта',
        '2. Перенос контента и вёрстки на новую систему',
        '3. Настройка редиректов и запуск',
      ],
      en: [
        '1. Auditing page count and legacy structure',
        '2. Migrating content and layout to the new system',
        '3. Configuring redirects and launching',
      ],
    },
    packages: [
      {
        id: 'simple10',
        name: { ru: 'Простой, до 10 страниц', en: 'Simple, up to 10 pages' },
        subtitle: { ru: 'Перенос небольшого сайта объёмом до 10 страниц (5 дн.)', en: 'Migrating a small website up to 10 pages (5 days)' },
        priceByn: 600,
        days: 5,
        lines: [
          { label: { ru: 'Перенос структуры и до 10 страниц контента', en: 'Structure & up to 10 pages migration' }, priceByn: 600 },
        ],
      },
      {
        id: 'std30',
        name: { ru: 'Стандарт, до 30 страниц', en: 'Standard, up to 30 pages' },
        subtitle: { ru: 'Перенос многостраничного сайта объёмом до 30 страниц (10 дн.)', en: 'Migrating a multi-page website up to 30 pages (10 days)' },
        priceByn: 1000,
        days: 10,
        lines: [
          { label: { ru: 'Перенос структуры и до 30 страниц контента', en: 'Structure & up to 30 pages migration' }, priceByn: 1000 },
        ],
      },
    ],
    options: [
      {
        id: 'more_pages',
        label: { ru: 'Ещё страницы (+100 BYN за каждые 10 страниц)', en: 'More Pages (+100 BYN per 10 pages)' },
        priceByn: 100,
        perUnit: true,
        maxUnits: 10,
        unitLabel: { ru: '×10 стр. (до 10)', en: '×10 pages (up to 10)' },
      },
      {
        id: 'catalog_transfer',
        label: { ru: 'Перенос каталога товаров', en: 'Product Catalog Migration' },
        priceByn: 250,
      },
      {
        id: 'keep_urls',
        label: { ru: 'Сохранение адресов страниц / редиректы', en: 'Preserve Page URLs / Redirects' },
        priceByn: 100,
      },
    ],
  },
  {
    id: 'oplata',
    calcKey: 'payments',
    groupId: 'rework',
    vizType: 'flow',
    title: { ru: 'Подключение онлайн-оплаты', en: 'Online Payment Integration' },
    calcTitle: { ru: 'Подключение онлайн-оплаты', en: 'Online Payment Integration' },
    shortDesc: {
      ru: 'Подключение платёжной системы на сайт или в бот (300 BYN, 3 дн.) с возможностью добавить дополнительные шлюзы и уведомления о заказе.',
      en: 'Connecting an online payment system to your website or bot (300 BYN, 3 days) with optional extra gateways and order notifications.',
    },
    basePriceByn: 300,
    baseDays: 3,
    whoSuits: {
      ru: [
        'Магазинам и сервисам для приёма оплаты картами и через ЕРИП',
        'Проектам, которым нужно подключить одну или несколько платёжных систем с уведомлениями',
      ],
      en: [
        'Stores and services accepting card and ERIP online payments',
        'Projects needing one or multiple payment gateways with order alerts',
      ],
    },
    whatIncluded: {
      ru: [
        'Пакет «Базовый» — подключение одной платёжной системы (300 BYN, 3 дн.)',
        'Дополнения: «Ещё одна платёжная система» (+150 BYN за каждую, до 5) и «Уведомления о заказе» (+100 BYN)',
      ],
      en: [
        'Basic package — integrating one payment system (300 BYN, 3 days)',
        'Add-ons: Additional payment system (+150 BYN each, up to 5) and Order notifications (+100 BYN)',
      ],
    },
    stages: {
      ru: [
        '1. Проверка технических требований платёжного шлюза',
        '2. Интеграция и тестовые платежи',
        '3. Переключение в рабочий режим и сдача (3 дн.)',
      ],
      en: [
        '1. Reviewing payment provider technical requirements',
        '2. Sandbox integration and test transactions',
        '3. Production activation and handover (3 days)',
      ],
    },
    packages: [
      {
        id: 'basic',
        name: { ru: 'Базовый', en: 'Basic' },
        subtitle: { ru: 'Подключение и проверка одной системы онлайн-оплаты (3 дн.)', en: 'Integration and verification of one payment gateway (3 days)' },
        priceByn: 300,
        days: 3,
        lines: [
          { label: { ru: 'Интеграция платёжного модуля на сайт/в бот', en: 'Payment module integration' }, priceByn: 300 },
        ],
      },
    ],
    options: [
      {
        id: 'extra_gateway',
        label: { ru: 'Ещё одна платёжная система', en: 'Additional Payment System' },
        priceByn: 150,
        perUnit: true,
        maxUnits: 5,
        unitLabel: { ru: 'систем (до 5)', en: 'systems (up to 5)' },
      },
      {
        id: 'order_notify',
        label: { ru: 'Уведомления о заказе', en: 'Order Notifications' },
        priceByn: 100,
      },
    ],
  },
  {
    id: 'hosting',
    calcKey: 'hosting',
    groupId: 'rework',
    vizType: 'browser',
    title: { ru: 'Хостинг и домен: настройка', en: 'Hosting & Domain: Setup' },
    calcTitle: { ru: 'Хостинг и домен: настройка', en: 'Hosting & Domain: Setup' },
    shortDesc: {
      ru: 'Привязка домена, настройка хостинга и SSL-сертификата (150 BYN, 2 дн.) + подключение почты на вашем домене (+50 BYN).',
      en: 'Domain binding, hosting configuration, and SSL setup (150 BYN, 2 days) + custom domain email (+50 BYN).',
    },
    basePriceByn: 150,
    baseDays: 2,
    whoSuits: {
      ru: [
        'При запуске нового сайта или переносе проекта на ваш собственный хостинг',
        'Когда нужно настроить домен, HTTPS и рабочую почту вида info@ваш-домен.by',
      ],
      en: [
        'When launching a new site or moving a project to your own hosting account',
        'When you need DNS, HTTPS, and branded domain email configured properly',
      ],
    },
    whatIncluded: {
      ru: [
        'Пакет «Настройка» (150 BYN, 2 дн.): привязка домена, DNS, размещение на хостинге и SSL',
        'Дополнение «Почта на домене» (+50 BYN)',
      ],
      en: [
        'Setup package (150 BYN, 2 days): domain DNS binding, hosting setup, and SSL',
        'Optional Domain Email setup (+50 BYN)',
      ],
    },
    stages: {
      ru: [
        '1. Подготовка хостинга и DNS-записей домена',
        '2. Выпуск SSL-сертификата и проверка работы сайта (2 дн.)',
      ],
      en: [
        '1. Configuring hosting and domain DNS records',
        '2. Issuing SSL certificate and verifying site operation (2 days)',
      ],
    },
    packages: [
      {
        id: 'setup',
        name: { ru: 'Настройка', en: 'Setup' },
        subtitle: { ru: 'Настройка хостинга, привязка домена и подключение SSL (2 дн.)', en: 'Hosting setup, domain DNS binding, and SSL certificate (2 days)' },
        priceByn: 150,
        days: 2,
        lines: [
          { label: { ru: 'Настройка хостинга, DNS и SSL', en: 'Hosting, DNS & SSL configuration' }, priceByn: 150 },
        ],
      },
    ],
    options: [
      {
        id: 'domain_mail',
        label: { ru: 'Почта на домене', en: 'Email on Domain' },
        priceByn: 50,
      },
    ],
  },
];

export const HERO_BOT_SCENARIOS = [
  {
    id: 'site-simple',
    chip: { ru: 'Сайт под ключ', en: 'Turnkey Website' },
    botQuestion: {
      ru: 'Опишите задачу в форме или напишите в Telegram. Оценка бесплатно.',
      en: 'Describe your task in the form or write on Telegram. Free estimate.',
    },
    userReply: {
      ru: 'Нужен сайт «Простой» с формой заявки и публикацией на домене',
      en: 'Need a Simple website with lead form and domain publication',
    },
    botConfirm: {
      ru: 'В пакет «Простой» (500 BYN, 5 дн.) публикация, домен и форма заявки с уведомлением уже входят бесплатно.',
      en: 'In the Simple package (500 BYN, 5 days) publication, domain, and lead form are included free.',
    },
    smetaTitle: { ru: 'Сайт — пакет «Простой»', en: 'Website — Simple Package' },
    smetaLines: [
      { ru: 'Пакет «Простой» (базовая разработка)', en: 'Simple package (core build)', byn: 500 },
      { ru: 'Публикация, домен и настройка (входит)', en: 'Publication, domain & setup (included)', byn: 0 },
      { ru: 'Форма заявки с уведомлением вам (входит)', en: 'Lead form with notification (included)', byn: 0 },
    ],
    totalByn: 500,
    days: 5,
  },
  {
    id: 'bot-simple',
    chip: { ru: 'Telegram-бот', en: 'Telegram Bot' },
    botQuestion: {
      ru: 'Какой Telegram-бот нужен для вашей задачи: простой, с базой или с CRM/оплатой?',
      en: 'Which Telegram bot fits your task: Simple, With Database, or With CRM/Payment?',
    },
    userReply: {
      ru: 'Telegram-бот «Простой» + Заявки без потерь в таблицу',
      en: 'Simple Telegram Bot + Zero-loss leads to spreadsheet',
    },
    botConfirm: {
      ru: 'Отлично: бот принимает обращения, сохраняет в таблицу и мгновенно присылает уведомление.',
      en: 'Great: the bot captures requests, logs them to a sheet, and sends instant notifications.',
    },
    smetaTitle: { ru: 'Telegram-бот + Заявки без потерь', en: 'Telegram Bot + Zero-Loss Leads' },
    smetaLines: [
      { ru: 'Telegram-бот (пакет «Простой»)', en: 'Telegram Bot (Simple package)', byn: 750 },
      { ru: 'Заявки без потерь (в таблицу с уведомлением)', en: 'Zero-loss leads (to sheet with alert)', byn: 250 },
    ],
    totalByn: 1000,
    days: 10,
  },
  {
    id: 'quiz-calc',
    chip: { ru: 'Квиз-сайт', en: 'Quiz Website' },
    botQuestion: {
      ru: 'Квиз-сайт помогает клиенту ответить на вопросы и сразу отправить параметризованную заявку.',
      en: 'A quiz website helps clients answer key questions and submit a structured inquiry.',
    },
    userReply: {
      ru: 'Квиз-сайт «Простой» + Ветвление вопросов + Расчёт стоимости в конце',
      en: 'Simple Quiz Site + Question Branching + End Cost Calculation',
    },
    botConfirm: {
      ru: 'Публикация и форма заявки с уведомлением уже включены в пакет «Простой».',
      en: 'Publication and notification lead form are already included in the Simple package.',
    },
    smetaTitle: { ru: 'Квиз-сайт с ветвлением и расчётом цены', en: 'Quiz Site with Branching & Price Calc' },
    smetaLines: [
      { ru: 'Квиз-сайт «Простой» (вкл. публикацию и форму)', en: 'Simple Quiz Site (incl. publish & form)', byn: 700 },
      { ru: 'Ветвление вопросов', en: 'Question branching', byn: 200 },
      { ru: 'Расчёт стоимости в конце', en: 'Cost calculation at the end', byn: 250 },
    ],
    totalByn: 1150,
    days: 7,
  },
];

// Ровно 6 шагов из ru.json для раздела «Как проходит работа»
export const PROCESS_STEPS = [
  {
    num: '01',
    title: { ru: 'Заявка', en: 'Inquiry' },
    desc: {
      ru: 'Вы описываете задачу в форме или пишете в Telegram. Оценка бесплатно.',
      en: 'You describe the task in the form or write on Telegram. Estimation is free.',
    },
  },
  {
    num: '02',
    title: { ru: 'Техзадание', en: 'Specification' },
    desc: {
      ru: 'Уточняем детали и записываем в техзадание: что делаем и что вы получите в итоге.',
      en: 'We clarify details and record them in the specification: what we do and what you get in the end.',
    },
  },
  {
    num: '03',
    title: { ru: 'Условия', en: 'Terms' },
    desc: {
      ru: 'Согласуем стоимость и условия.',
      en: 'We agree on the cost and terms.',
    },
  },
  {
    num: '04',
    title: { ru: 'Разработка', en: 'Development' },
    desc: {
      ru: 'Делаю решение по согласованному техзаданию.',
      en: 'I build the solution according to the agreed specification.',
    },
  },
  {
    num: '05',
    title: { ru: 'Сдача', en: 'Handover' },
    desc: {
      ru: 'Передаю результат и объясняю, как им пользоваться.',
      en: 'I hand over the result and explain how to use it.',
    },
  },
  {
    num: '06',
    title: { ru: 'После сдачи', en: 'After Handover' },
    desc: {
      ru: 'После сдачи остаёмся на связи.',
      en: 'After handover, we stay in touch.',
    },
  },
];

// Карточка «Сайт архитектурного бюро» для раздела «Работы» (из ru.json)
export const ARCH_BUREAU_PROJECT = {
  title: { ru: 'Сайт архитектурного бюро', en: 'Architectural Bureau Website' },
  caption: {
    ru: '2026 год. Сейчас дорабатывается.',
    en: '2026. Currently being refined.',
  },
  whatDoneTitle: { ru: 'Что сделано', en: 'What was done' },
  whatDoneList: {
    ru: [
      'Собрана структура страниц и каталога архитектурных проектов с фильтрацией',
      'Свёрстана адаптивная витрина с акцентом на чертежи, планы и фотографии объектов',
      'Настроена форма предварительной заявки на проектирование с уведомлением в Telegram',
      'Подготовлена быстрая загрузка тяжёлых изображений и галерей без потери качества',
      'Заложена удобная структура для самостоятельного добавления новых проектов в портфолио',
    ],
    en: [
      'Structured pages and architectural project catalog with category filtering',
      'Built a responsive showcase highlighting floor plans, drawings, and project photography',
      'Configured design inquiry form with instant Telegram notifications',
      'Optimized high-resolution project galleries for fast loading',
      'Created a clean structure for easily adding new portfolio projects',
    ],
  },
};
