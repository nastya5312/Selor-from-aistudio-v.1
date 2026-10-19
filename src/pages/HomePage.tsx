import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Sliders,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import {
  Lang,
  PageId,
  SERVICES,
  HERO_BOT_SCENARIOS,
  PROCESS_STEPS,
  ARCH_BUREAU_PROJECT,
  formatBynUsd,
} from '../data/servicesData';
import { CssViz } from '../components/CssViz';

interface HomePageProps {
  lang: Lang;
  navigate: (p: PageId, opts?: { serviceId?: string; leadText?: string }) => void;
  onlyWorksSection?: boolean;
  onNotify?: (title: string, description?: string, variant?: 'success' | 'info' | 'error') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  lang,
  navigate,
  onlyWorksSection = false,
  onNotify,
}) => {
  // Состояние для первого экрана «Сборка» (чипсы диалога бота и мини-сметы)
  const [heroScenarioIdx, setHeroScenarioIdx] = useState(0);
  const currentScenario = HERO_BOT_SCENARIOS[heroScenarioIdx];

  // Состояние для блока «Как проходит работа» (6 шагов)
  const [activeProcessIdx, setActiveProcessIdx] = useState(0);

  // Состояние для превью в браузерной рамке (.mock)
  const [mockPreviewTab, setMockPreviewTab] = useState<'arch' | 'okna' | 'potolki'>('arch');

  // Состояние для раздела «Живая смета» (.smeta)
  const [smetaServiceId, setSmetaServiceId] = useState<string>('sajty');
  const [smetaPkgIdx, setSmetaPkgIdx] = useState<number>(0);
  const [copiedSmeta, setCopiedSmeta] = useState(false);

  const selectedSmetaService =
    SERVICES.find((s) => s.id === smetaServiceId) || SERVICES[0];
  const selectedSmetaPkg =
    selectedSmetaService.packages[smetaPkgIdx] ||
    selectedSmetaService.packages[0];

  const smetaPriceFormatted = formatBynUsd(
    selectedSmetaPkg.priceByn,
    lang,
    selectedSmetaService.isMonthly
  );

  const buildSmetaSummaryText = () => {
    const linesText = selectedSmetaPkg.lines
      .map((line) => {
        if (line.priceByn === 0) {
          return `• ${line.label[lang]}: ${lang === 'ru' ? 'входит' : 'included'}`;
        }
        return `• ${line.label[lang]}: ${
          formatBynUsd(line.priceByn, lang, selectedSmetaService.isMonthly).fullText
        }`;
      })
      .join('\n');

    return lang === 'ru'
      ? `[Быстрая смета с главной страницы]\nУслуга: ${selectedSmetaService.title.ru}\nПакет: ${selectedSmetaPkg.name.ru}\n\nСостав работ:\n${linesText}\n\nИтого ориентир: ${smetaPriceFormatted.fullText}${
          selectedSmetaPkg.days > 0
            ? `\nОриентировочный срок: ~${selectedSmetaPkg.days} дн.`
            : ''
        }`
      : `[Quick Estimate from Home Page]\nService: ${selectedSmetaService.title.en}\nPackage: ${selectedSmetaPkg.name.en}\n\nBreakdown:\n${linesText}\n\nEstimated Total: ${smetaPriceFormatted.fullText}${
          selectedSmetaPkg.days > 0
            ? `\nEstimated Timeframe: ~${selectedSmetaPkg.days} days`
            : ''
        }`;
  };

  const handleTransferSmetaToLead = () => {
    const summaryText = buildSmetaSummaryText();
    if (onNotify) {
      onNotify(
        lang === 'ru' ? 'Смета перенесена в заявку' : 'Estimate transferred to inquiry',
        lang === 'ru'
          ? 'Расчёт подставлен в поле «Задача» на странице Контакты.'
          : 'Your estimate has been added to the task field on the Contacts page.',
        'info'
      );
    }
    navigate('contacts', { leadText: summaryText });
  };

  const handleCopySmeta = () => {
    const summaryText = buildSmetaSummaryText();
    navigator.clipboard.writeText(summaryText);
    setCopiedSmeta(true);
    if (onNotify) {
      onNotify(
        lang === 'ru' ? 'Расчёт скопирован' : 'Calculation copied',
        lang === 'ru'
          ? 'Быстрая смета сохранена в буфер обмена.'
          : 'The quick estimate has been copied to your clipboard.',
        'success'
      );
    }
    setTimeout(() => setCopiedSmeta(false), 2500);
  };

  // Карточки для Bento-сетки на главной
  const bentoItems = [
    {
      service: SERVICES.find((s) => s.id === 'sajty')!,
      spanClass: 'lg:col-span-7',
      tag: { ru: 'Группа «Сайты»', en: 'Websites Group' },
      action: () => navigate('sajty'),
    },
    {
      service: SERVICES.find((s) => s.id === 'telegram-boty')!,
      spanClass: 'lg:col-span-5',
      tag: { ru: 'Группа «Боты и заявки»', en: 'Bots & Leads Group' },
      action: () => navigate('telegram-boty'),
    },
    {
      service: SERVICES.find((s) => s.id === 'kviz-sajt')!,
      spanClass: 'lg:col-span-4',
      tag: { ru: 'Группа «Сайты»', en: 'Websites Group' },
      action: () => navigate('services', { serviceId: 'kviz-sajt' }),
    },
    {
      service: SERVICES.find((s) => s.id === 'dannye')!,
      spanClass: 'lg:col-span-4',
      tag: { ru: 'Группа «Автоматизация и данные»', en: 'Automation & Data' },
      action: () => navigate('services', { serviceId: 'dannye' }),
    },
    {
      service: SERVICES.find((s) => s.id === 'dorabotka')!,
      spanClass: 'lg:col-span-4',
      tag: { ru: 'Группа «Доработка и запуск»', en: 'Rework & Launch' },
      action: () => navigate('services', { serviceId: 'dorabotka' }),
    },
  ];

  return (
    <div>
      {/* 1. ПЕРВЫЙ ЭКРАН («СБОРКА») — .on-deep (точные тексты из ru.json) */}
      {!onlyWorksSection && (
        <section className="on-deep relative overflow-hidden pt-10 pb-20 sm:py-24 border-b border-white/10">
          <div
            className="pointer-events-none absolute -top-24 left-1/4 w-[520px] h-[520px] rounded-full opacity-25 blur-[130px]"
            style={{ background: 'radial-gradient(circle, #2E54F5 0%, transparent 70%)' }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute bottom-0 right-10 w-[440px] h-[440px] rounded-full opacity-20 blur-[120px]"
            style={{
              background: 'radial-gradient(circle, #3FCFE6 0%, #CDF26B 60%, transparent 80%)',
            }}
            aria-hidden="true"
          />

          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Левая колонка: точный заголовок, подзаголовок, кнопки и подпись из ru.json */}
              <div className="lg:col-span-6 space-y-6">
                <div className="text-xs font-mono uppercase tracking-widest text-[#3FD9B4]">
                  {lang === 'ru'
                    ? 'SELOR · САЙТЫ, АВТОМАТИЗАЦИИ И БОТЫ'
                    : 'SELOR · WEBSITES, AUTOMATIONS & BOTS'}
                </div>

                <h1
                  style={{ fontSize: 'clamp(2.25rem, 4vw, 3.6rem)', lineHeight: 1.1 }}
                  className="font-display font-bold text-[#E8EEF7] tracking-tight"
                >
                  {lang === 'ru'
                    ? 'Сайты, автоматизации и боты'
                    : 'Websites, automations and bots'}
                </h1>

                <p className="text-lg sm:text-xl text-[#DCEAFB] leading-relaxed max-w-xl">
                  {lang === 'ru'
                    ? 'Вы ставите задачу, я довожу её до результата.'
                    : 'You set the task, I bring it to a result.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('contacts')}
                    className="inline-flex items-center gap-3 bg-[#2E54F5] hover:bg-[#3B60F7] text-white font-medium px-6 py-3.5 text-sm sm:text-base btn-pill-dots cursor-pointer"
                  >
                    <span>{lang === 'ru' ? 'Оставить заявку' : 'Leave a Request'}</span>
                    <span className="dot-seq flex items-center gap-1" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                      <span />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('services')}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/15 hover:border-[#3FCFE6] text-[#E8EEF7] hover:text-white text-sm sm:text-base font-medium transition-colors cursor-pointer"
                  >
                    <span>{lang === 'ru' ? 'Смотреть услуги' : 'View Services'}</span>
                    <ArrowRight className="w-4 h-4 text-[#3FCFE6]" />
                  </button>
                </div>

                <p className="text-sm text-[#A9B6CA] pt-1">
                  {lang === 'ru'
                    ? 'Отвечу, как только увижу заявку.'
                    : 'I will reply as soon as I see your request.'}
                </p>
              </div>

              {/* Правая колонка: Интерактивная многослойная композиция «Сборка» */}
              <div className="lg:col-span-6 space-y-4">
                {/* Верхний слой: Карточка макета сайта */}
                <div className="deep-glass-card p-4 sm:p-5 border border-[rgba(150,175,255,0.24)]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2E54F5]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3FCFE6]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3FD9B4]" />
                      <span className="text-xs font-mono text-[#A9B6CA] ml-1">
                        {lang === 'ru' ? 'Слой 1 · Сайт и форма заявки' : 'Layer 1 · Website & Lead Form'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#3FD9B4]">Mobile-First</span>
                  </div>

                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-7 space-y-2">
                      <div className="text-xs font-medium text-[#DCEAFB]">
                        {currentScenario.smetaTitle[lang]}
                      </div>
                      <div className="h-2 w-4/5 rounded bg-white/15" />
                      <div className="h-2 w-3/5 rounded bg-white/10" />
                    </div>
                    <div className="col-span-5 bg-white/[0.04] border border-white/10 rounded-xl p-2.5 text-right">
                      <div className="text-[10px] text-[#A9B6CA]">
                        {lang === 'ru' ? 'По прайсу' : 'Rate card'}
                      </div>
                      <div className="text-sm font-bold text-[#CDF26B] tabular-nums">
                        {formatBynUsd(currentScenario.totalByn, lang).bynText}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Средний слой: Карточка диалога Telegram-бота с кликабельными чипсами */}
                <div className="deep-glass-card p-4 sm:p-5 border border-[#3FCFE6]/35 relative">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="text-xs font-mono text-[#3FCFE6] uppercase tracking-wider">
                      {lang === 'ru'
                        ? 'Слой 2 · Интерактивный сценарий'
                        : 'Layer 2 · Interactive Scenario'}
                    </div>
                    <span className="text-[11px] text-[#A9B6CA]">
                      {lang === 'ru' ? 'Выберите задачу:' : 'Select task:'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {HERO_BOT_SCENARIOS.map((sc, idx) => (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => setHeroScenarioIdx(idx)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          heroScenarioIdx === idx
                            ? 'bg-[#2E54F5] text-white shadow-[0_0_16px_rgba(46,84,245,0.6)] border border-[#3FCFE6]/60'
                            : 'bg-white/6 hover:bg-white/12 text-[#DCEAFB] border border-white/10'
                        }`}
                      >
                        {sc.chip[lang]}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2.5 text-xs sm:text-sm bg-[#05080D]/70 rounded-2xl p-3.5 border border-white/8">
                    <div className="bg-white/8 text-[#E8EEF7] rounded-2xl rounded-tl-xs px-3.5 py-2 max-w-[90%]">
                      {currentScenario.botQuestion[lang]}
                    </div>
                    <div className="bg-[#2E54F5]/35 border border-[#2E54F5]/60 text-white rounded-2xl rounded-tr-xs px-3.5 py-2 max-w-[85%] ml-auto">
                      {currentScenario.userReply[lang]}
                    </div>
                    <div className="bg-[#3FD9B4]/15 border border-[#3FD9B4]/35 text-[#DCEAFB] rounded-2xl rounded-tl-xs px-3.5 py-2 max-w-[92%] flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#3FD9B4] shrink-0 mt-0.5" />
                      <span>{currentScenario.botConfirm[lang]}</span>
                    </div>
                  </div>
                </div>

                {/* Нижний слой: Карточка живой мини-сметы */}
                <div className="deep-glass-card p-4 sm:p-5 border border-[#3FD9B4]/35 bg-gradient-to-r from-[#0B1322]/90 to-[#0E2280]/50">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#3FD9B4]">
                      {lang === 'ru' ? 'Слой 3 · Живая мини-смета' : 'Layer 3 · Live Mini-Estimate'}
                    </span>
                    <span className="text-xs font-mono text-[#CDF26B] tabular-nums">
                      ~{currentScenario.days} {lang === 'ru' ? 'дн.' : 'days'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#DCEAFB] mb-3">
                    {currentScenario.smetaLines.map((line, i) => (
                      <div key={i} className="flex items-baseline justify-between">
                        <span className="text-[#A9B6CA]">{line[lang]}</span>
                        <span className="smeta-dots" />
                        <span className="font-mono tabular-nums text-[#E8EEF7]">
                          {line.byn === 0
                            ? lang === 'ru'
                              ? 'входит'
                              : 'included'
                            : `${line.byn} BYN`}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-white/12 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] text-[#A9B6CA]">
                        {lang === 'ru' ? 'Итого по прайсу:' : 'Estimated total:'}
                      </div>
                      <div className="text-lg sm:text-xl font-display font-bold text-white tabular-nums">
                        {formatBynUsd(currentScenario.totalByn, lang).bynText}{' '}
                        <span className="text-xs font-normal text-[#3FCFE6]">
                          ({formatBynUsd(currentScenario.totalByn, lang).usdText})
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (onNotify) {
                          onNotify(
                            lang === 'ru'
                              ? 'Мини-смета перенесена в заявку'
                              : 'Mini-estimate added to inquiry',
                            currentScenario.smetaTitle[lang],
                            'info'
                          );
                        }
                        navigate('contacts', {
                          leadText:
                            lang === 'ru'
                              ? `[Из мини-сметы первого экрана]\nЗадача: ${currentScenario.smetaTitle.ru}\nСтоимость: ${
                                  formatBynUsd(currentScenario.totalByn, 'ru').fullText
                                }\nСрок: ~${currentScenario.days} дн.`
                              : `[From Hero Mini-Estimate]\nTask: ${currentScenario.smetaTitle.en}\nCost: ${
                                  formatBynUsd(currentScenario.totalByn, 'en').fullText
                                }\nTimeframe: ~${currentScenario.days} days`,
                        });
                      }}
                      className="px-4 py-2 rounded-full bg-white/10 hover:bg-[#2E54F5] text-xs font-medium text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{lang === 'ru' ? 'Перенести в заявку' : 'Use in Request'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. РАЗДЕЛ «УСЛУГИ» (BENTO-СЕТКА) — Светлая / Адаптивная сцена */}
      {!onlyWorksSection && (
        <section className="adaptive-scene py-16 sm:py-24 overflow-hidden">
          <div
            className="pointer-events-none absolute top-20 left-10 w-96 h-96 rounded-full opacity-25 blur-[110px]"
            style={{ background: 'radial-gradient(circle, #2E54F5 0%, transparent 70%)' }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute bottom-16 right-10 w-96 h-96 rounded-full opacity-25 blur-[110px]"
            style={{
              background: 'radial-gradient(circle, #3FCFE6 0%, #CDF26B 70%, transparent 100%)',
            }}
            aria-hidden="true"
          />

          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-3 max-w-2xl">
                <div className="text-xs font-bold uppercase tracking-widest text-[#2E54F5]">
                  {lang === 'ru' ? 'УСЛУГИ (4 ГРУППЫ · 15 НАПРАВЛЕНИЙ)' : 'SERVICES (4 GROUPS · 15 ITEMS)'}
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-4xl tracking-tight">
                  {lang === 'ru'
                    ? 'Сайты, боты и заявки, автоматизация и доработка'
                    : 'Websites, bots & leads, automation, and rework'}
                </h2>
                <p className="text-sm sm:text-base opacity-80">
                  {lang === 'ru'
                    ? 'Все 15 услуг с точными тарифами в BYN (~USD) и сроками выполнения.'
                    : 'All 15 services with exact rates in BYN (~USD) and delivery timeframes.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('services')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#2E54F5] text-white text-sm font-medium hover:bg-[#1E40D8] transition-colors self-start md:self-auto shrink-0 cursor-pointer"
              >
                <span>{lang === 'ru' ? 'Все 15 услуг списком' : 'View all 15 services'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {bentoItems.map((item) => {
                const { service, spanClass, tag, action } = item;
                const priceInfo = formatBynUsd(
                  service.basePriceByn,
                  lang,
                  service.isMonthly
                );
                return (
                  <div
                    key={service.id}
                    onClick={action}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') action();
                    }}
                    className={`${spanClass} glass-card bento-service-card p-6 sm:p-7 flex flex-col justify-between gap-6 group cursor-pointer`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs opacity-75">
                        <span>{tag[lang]}</span>
                        <span className="font-mono tabular-nums">
                          ~{service.baseDays} {lang === 'ru' ? 'дн.' : 'days'}
                        </span>
                      </div>

                      <CssViz type={service.vizType} lang={lang} />

                      <div className="space-y-2 pt-1">
                        <h3 className="font-display font-bold text-xl sm:text-2xl group-hover:text-[#2E54F5] transition-colors">
                          {service.title[lang]}
                        </h3>
                        <p className="text-sm opacity-80 leading-relaxed">
                          {service.shortDesc[lang]}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-current/10 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs opacity-70">
                          {lang === 'ru' ? 'Базовый тариф' : 'Starting at'}
                        </div>
                        <div className="font-display font-bold text-lg sm:text-xl tabular-nums">
                          {lang === 'ru' ? 'от ' : 'from '}
                          {priceInfo.bynText}{' '}
                          <span className="text-xs font-normal opacity-75">
                            ({priceInfo.usdText})
                          </span>
                        </div>
                      </div>

                      <span className="w-11 h-11 rounded-full bg-[#2E54F5] text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-[#0E2280] group-hover:shadow-[0_0_18px_rgba(46,84,245,0.55)] transition-all shrink-0">
                        <ArrowUpRight className="w-5 h-5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 3. РАЗДЕЛ «КАК ПРОХОДИТ РАБОТА» (ПРОЦЕСС — РОВНО 6 ШАГОВ ИЗ ru.json) — .on-deep */}
      {!onlyWorksSection && (
        <section className="on-deep py-16 sm:py-24 border-y border-white/10">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Слева липкий заголовок и навигация по 6 шагам */}
              <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
                <div className="text-xs font-bold uppercase tracking-widest text-[#3FD9B4]">
                  {lang === 'ru' ? 'КАК ПРОХОДИТ РАБОТА' : 'HOW WE WORK'}
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-4xl text-[#E8EEF7]">
                  {lang === 'ru'
                    ? 'Как проходит работа'
                    : 'How the work is organized'}
                </h2>
                <p className="text-sm sm:text-base text-[#A9B6CA] leading-relaxed">
                  {lang === 'ru'
                    ? 'Вы ставите задачу, я довожу её до результата — прозрачно на каждом из 6 шагов.'
                    : 'You set the task, I bring it to a result — clearly across all 6 steps.'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 pt-2">
                  {PROCESS_STEPS.map((st, idx) => (
                    <button
                      key={st.num}
                      type="button"
                      onClick={() => setActiveProcessIdx(idx)}
                      className={`text-left px-4 py-2.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        activeProcessIdx === idx
                          ? 'bg-[#2E54F5]/25 border-[#3FCFE6] text-white'
                          : 'bg-white/[0.03] border-white/10 text-[#A9B6CA] hover:text-white'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-medium truncate">
                        <span className="font-mono text-[#3FD9B4] mr-2">{st.num}.</span>
                        {st.title[lang]}
                      </span>
                      {activeProcessIdx === idx && (
                        <span className="w-2 h-2 rounded-full bg-[#CDF26B] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Справа ровно 6 шагов со стеклянными номерными плашками */}
              <div className="lg:col-span-7 space-y-4">
                {PROCESS_STEPS.map((st, idx) => {
                  const isActive = activeProcessIdx === idx;
                  return (
                    <div
                      key={st.num}
                      onClick={() => setActiveProcessIdx(idx)}
                      className={`deep-glass-card p-5 sm:p-7 transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#3FCFE6] shadow-[0_0_35px_rgba(46,84,245,0.28)]'
                          : 'border-white/10 opacity-85 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start gap-4 sm:gap-5">
                        <div
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-mono font-bold text-base shrink-0 border ${
                            isActive
                              ? 'bg-[#2E54F5] border-[#3FCFE6] text-white'
                              : 'bg-white/6 border-white/15 text-[#3FD9B4]'
                          }`}
                        >
                          {st.num}
                        </div>

                        <div className="space-y-1.5 flex-1">
                          <h3 className="font-display font-bold text-lg sm:text-xl text-[#E8EEF7]">
                            {st.title[lang]}
                          </h3>
                          <p className="text-sm sm:text-base text-[#A9B6CA] leading-relaxed">
                            {st.desc[lang]}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. РАЗДЕЛ «РАБОТЫ» — Карточка «Сайт архитектурного бюро» + браузерная рамка (.mock) + 2 демо-квиза */}
      <section className="adaptive-scene py-16 sm:py-24">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-10">
          <div className="space-y-3 max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-widest text-[#2E54F5]">
              {lang === 'ru' ? 'РАБОТЫ И ДЕМО' : 'WORKS & LIVE DEMOS'}
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-4xl">
              {lang === 'ru' ? 'Работы и интерактивные демо' : 'Works and Interactive Demos'}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Слева: Браузерная рамка (.mock) + карточка «Сайт архитектурного бюро» */}
            <div className="lg:col-span-7 space-y-6">
              <div className="mock p-4 sm:p-6 text-[#E8EEF7]">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-white/12">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#2E54F5]" />
                    <span className="w-3 h-3 rounded-full bg-[#3FCFE6]" />
                    <span className="w-3 h-3 rounded-full bg-[#3FD9B4]" />
                    <span className="ml-2 text-xs font-mono text-[#A9B6CA] bg-white/6 px-3 py-1 rounded-full">
                      {mockPreviewTab === 'arch'
                        ? 'arch-bureau.by (2026)'
                        : mockPreviewTab === 'okna'
                        ? 'selor.by/demo-okna'
                        : 'selor.by/demo-potolki'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-white/8 p-1 rounded-full text-xs">
                    <button
                      type="button"
                      onClick={() => setMockPreviewTab('arch')}
                      className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                        mockPreviewTab === 'arch'
                          ? 'bg-[#2E54F5] text-white'
                          : 'text-[#A9B6CA] hover:text-white'
                      }`}
                    >
                      {lang === 'ru' ? 'Архитектурное бюро' : 'Arch Bureau'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMockPreviewTab('okna')}
                      className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                        mockPreviewTab === 'okna'
                          ? 'bg-[#2E54F5] text-white'
                          : 'text-[#A9B6CA] hover:text-white'
                      }`}
                    >
                      {lang === 'ru' ? 'Демо: окна' : 'Demo: Windows'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMockPreviewTab('potolki')}
                      className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                        mockPreviewTab === 'potolki'
                          ? 'bg-[#2E54F5] text-white'
                          : 'text-[#A9B6CA] hover:text-white'
                      }`}
                    >
                      {lang === 'ru' ? 'Демо: потолки' : 'Demo: Ceilings'}
                    </button>
                  </div>
                </div>

                {mockPreviewTab === 'arch' && (
                  <div className="space-y-4 bg-white/[0.03] border border-white/10 rounded-2xl p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display font-bold text-xl sm:text-2xl text-white">
                        {ARCH_BUREAU_PROJECT.title[lang]}
                      </h3>
                      <span className="text-xs font-mono text-[#3FD9B4]">
                        {ARCH_BUREAU_PROJECT.caption[lang]}
                      </span>
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#3FCFE6]">
                        {ARCH_BUREAU_PROJECT.whatDoneTitle[lang]}:
                      </div>
                      <ul className="space-y-2 text-xs sm:text-sm text-[#DCEAFB]">
                        {ARCH_BUREAU_PROJECT.whatDoneList[lang].map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-[#3FD9B4] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {mockPreviewTab === 'okna' && (
                  <div className="space-y-4 bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                    <div className="text-xs text-[#3FD9B4] font-mono">
                      {lang === 'ru' ? 'ИНТЕРАКТИВНОЕ ДЕМО · КВИЗ-САЙТ' : 'INTERACTIVE DEMO · QUIZ SITE'}
                    </div>
                    <h3 className="font-display font-bold text-xl text-white">
                      {lang === 'ru'
                        ? 'Посмотреть демо: подбор окон'
                        : 'View demo: window selection'}
                    </h3>
                    <p className="text-sm text-[#A9B6CA]">
                      {lang === 'ru'
                        ? 'Пошаговый подбор окон ПВХ с расчётом ориентировочной стоимости в BYN.'
                        : 'Step-by-step PVC windows quiz with BYN price calculation.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('demo-okna')}
                      className="px-4 py-2 rounded-full bg-[#2E54F5] hover:bg-[#3A60F7] text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>
                        {lang === 'ru'
                          ? 'Посмотреть демо: подбор окон'
                          : 'View demo: window selection'}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {mockPreviewTab === 'potolki' && (
                  <div className="space-y-4 bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                    <div className="text-xs text-[#3FCFE6] font-mono">
                      {lang === 'ru' ? 'ИНТЕРАКТИВНОЕ ДЕМО · КВИЗ-САЙТ' : 'INTERACTIVE DEMO · QUIZ SITE'}
                    </div>
                    <h3 className="font-display font-bold text-xl text-white">
                      {lang === 'ru'
                        ? 'Посмотреть демо: натяжные потолки'
                        : 'View demo: stretch ceilings'}
                    </h3>
                    <p className="text-sm text-[#A9B6CA]">
                      {lang === 'ru'
                        ? 'Расчёт натяжных потолков по площади м², фактуре полотна и освещению.'
                        : 'Stretch ceilings calculator by area m², finish, and lighting.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('demo-potolki')}
                      className="px-4 py-2 rounded-full bg-[#2E54F5] hover:bg-[#3A60F7] text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>
                        {lang === 'ru'
                          ? 'Посмотреть демо: натяжные потолки'
                          : 'View demo: stretch ceilings'}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Справа: Карточка проекта «Сайт архитектурного бюро» + кнопки двух демо-квизов */}
            <div className="lg:col-span-5 space-y-5">
              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display font-bold text-xl">
                    {ARCH_BUREAU_PROJECT.title[lang]}
                  </h3>
                  <span className="text-xs font-mono text-[#2E54F5]">
                    {ARCH_BUREAU_PROJECT.caption[lang]}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#2E54F5]">
                    {ARCH_BUREAU_PROJECT.whatDoneTitle[lang]}:
                  </div>
                  <ul className="space-y-1.5 text-xs sm:text-sm opacity-85">
                    {ARCH_BUREAU_PROJECT.whatDoneList[lang].map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#2E54F5] font-bold">·</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="glass-card p-6 space-y-3">
                <div className="text-xs font-mono uppercase text-[#2E54F5]">
                  {lang === 'ru' ? 'ДЕМО КВИЗ-САЙТОВ' : 'QUIZ WEBSITE DEMOS'}
                </div>
                <h3 className="font-display font-bold text-lg">
                  {lang === 'ru'
                    ? 'Протестируйте интерактивные демо квиз-сайтов'
                    : 'Test interactive quiz website demos'}
                </h3>
                <div className="flex flex-col gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => navigate('demo-okna')}
                    className="w-full py-3 px-4 rounded-full bg-[#2E54F5] hover:bg-[#1E40D8] text-white text-xs sm:text-sm font-medium inline-flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>
                      {lang === 'ru'
                        ? 'Посмотреть демо: подбор окон'
                        : 'View demo: window selection'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('demo-potolki')}
                    className="w-full py-3 px-4 rounded-full bg-[#0E2280] hover:bg-[#2E54F5] text-white text-xs sm:text-sm font-medium inline-flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>
                      {lang === 'ru'
                        ? 'Посмотреть демо: натяжные потолки'
                        : 'View demo: stretch ceilings'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. РАЗДЕЛ «ЖИВАЯ СМЕТА» (.price-scene) — Кобальтово-тёмная сцена */}
      {!onlyWorksSection && (
        <section className="price-scene py-16 sm:py-24 border-t border-white/10">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="text-xs font-bold uppercase tracking-widest text-[#3FD9B4]">
                  {lang === 'ru' ? 'ЖИВАЯ СМЕТА (.SMETA)' : 'LIVE ESTIMATE SHEET'}
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-4xl text-white">
                  {lang === 'ru'
                    ? 'Быстрая прикидка цены по любой из 15 услуг'
                    : 'Quick price check across all 15 services'}
                </h2>
                <p className="text-sm sm:text-base text-[#DCEAFB]/85 leading-relaxed">
                  {lang === 'ru'
                    ? 'Выберите услугу и пакет — лист расчёта сразу покажет базовую стоимость в BYN (~USD) и ориентировочный срок в днях.'
                    : 'Choose a service and package tier to see the base price in BYN (~USD) and timeframe in days.'}
                </p>

                <div className="pt-2 space-y-2 text-xs text-[#A9B6CA]">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#3FCFE6]" />
                    <span>
                      {lang === 'ru'
                        ? 'Нужны дополнения, счётчики и выбор срочности?'
                        : 'Need add-ons, unit counters, and urgency options?'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('calc', { serviceId: smetaServiceId })}
                    className="text-[#3FD9B4] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>
                      {lang === 'ru'
                        ? 'Открыть полный 4-шаговый калькулятор →'
                        : 'Open the full 4-step calculator →'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="smeta p-6 sm:p-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                    <div className="sm:col-span-6 space-y-1.5">
                      <label
                        htmlFor="smeta-service-select"
                        className="block text-xs font-mono uppercase tracking-wider text-[#A9B6CA]"
                      >
                        {lang === 'ru' ? '1. Выберите услугу (из 15):' : '1. Choose service (of 15):'}
                      </label>
                      <select
                        id="smeta-service-select"
                        value={smetaServiceId}
                        onChange={(e) => {
                          setSmetaServiceId(e.target.value);
                          setSmetaPkgIdx(0);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-[14px] bg-[#05080D]/90 border border-[rgba(150,175,255,0.3)] text-white text-sm focus:outline-none focus:border-[#3FCFE6]"
                      >
                        {SERVICES.map((svc) => (
                          <option key={svc.id} value={svc.id} className="bg-[#070D19] text-white">
                            {svc.title[lang]} — {lang === 'ru' ? 'от' : 'from'} {svc.basePriceByn} BYN
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-6 space-y-1.5">
                      <span className="block text-xs font-mono uppercase tracking-wider text-[#A9B6CA]">
                        {lang === 'ru' ? '2. Пакет:' : '2. Package:'}
                      </span>
                      <div
                        className={`grid gap-1 bg-[#05080D]/80 p-1 rounded-[14px] border border-white/12 ${
                          selectedSmetaService.packages.length === 1
                            ? 'grid-cols-1'
                            : selectedSmetaService.packages.length === 2
                            ? 'grid-cols-2'
                            : 'grid-cols-3'
                        }`}
                      >
                        {selectedSmetaService.packages.map((pkg, idx) => (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() => setSmetaPkgIdx(idx)}
                            className={`py-2 px-2 rounded-[10px] text-xs font-medium truncate transition-colors cursor-pointer ${
                              smetaPkgIdx === idx
                                ? 'bg-[#2E54F5] text-white'
                                : 'text-[#A9B6CA] hover:text-white'
                            }`}
                          >
                            {pkg.name[lang]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {selectedSmetaPkg.name[lang]}
                      </div>
                      <div className="text-xs text-[#A9B6CA] mt-0.5">
                        {selectedSmetaPkg.subtitle[lang]}
                      </div>
                    </div>
                    {selectedSmetaPkg.days > 0 && (
                      <span className="text-xs font-mono text-[#3FD9B4] shrink-0 tabular-nums">
                        ~{selectedSmetaPkg.days} {lang === 'ru' ? 'дн.' : 'days'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 py-2">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#A9B6CA]">
                      {lang === 'ru' ? 'Состав пакета:' : 'Package breakdown:'}
                    </div>
                    {selectedSmetaPkg.lines.map((line, index) => {
                      const lineFormatted = formatBynUsd(
                        line.priceByn,
                        lang,
                        selectedSmetaService.isMonthly
                      );
                      return (
                        <div
                          key={index}
                          className="flex items-baseline justify-between text-xs sm:text-sm"
                        >
                          <span className="text-[#DCEAFB]">{line.label[lang]}</span>
                          <span className="smeta-dots" />
                          <span className="font-mono tabular-nums text-white shrink-0">
                            {line.priceByn === 0 ? (
                              <span className="text-[#3FD9B4]">
                                {lang === 'ru' ? 'бесплатно' : 'included'}
                              </span>
                            ) : (
                              <>
                                {lineFormatted.bynText}{' '}
                                <span className="text-[11px] text-[#A9B6CA]">
                                  ({lineFormatted.usdText})
                                </span>
                              </>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-5 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-[#A9B6CA]">
                        {lang === 'ru' ? 'Итого по выбранному пакету:' : 'Package Total:'}
                      </div>
                      <div className="text-2xl sm:text-3xl font-display font-bold text-white tabular-nums mt-0.5">
                        {smetaPriceFormatted.bynText}{' '}
                        <span className="text-base font-normal text-[#3FCFE6]">
                          ({smetaPriceFormatted.usdText})
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleCopySmeta}
                        className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/18 border border-white/20 text-white font-medium px-4 py-3.5 rounded-full text-xs sm:text-sm transition-all cursor-pointer shrink-0"
                      >
                        {copiedSmeta ? (
                          <>
                            <Check className="w-4 h-4 text-[#3FD9B4]" />
                            <span className="text-[#3FD9B4]">
                              {lang === 'ru' ? 'Скопировано' : 'Copied'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-[#3FCFE6]" />
                            <span>
                              {lang === 'ru' ? 'Скопировать расчёт' : 'Copy Estimate'}
                            </span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleTransferSmetaToLead}
                        className="inline-flex items-center justify-center gap-2.5 bg-[#2E54F5] hover:bg-[#3A60F7] text-white font-medium px-6 py-3.5 rounded-full text-sm transition-all cursor-pointer shrink-0"
                      >
                        <span>{lang === 'ru' ? 'Перенести в заявку' : 'Transfer to Inquiry'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. ФИНАЛЬНЫЙ ПРИЗЫВ (CTA) — .on-deep */}
      <section className="on-deep py-16 sm:py-24 border-t border-white/10 relative overflow-hidden">
        <div
          className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[640px] h-[300px] rounded-full opacity-25 blur-[120px]"
          style={{
            background: 'radial-gradient(circle, #2E54F5 0%, #3FD9B4 70%, transparent 100%)',
          }}
          aria-hidden="true"
        />
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          <div className="text-xs font-mono uppercase tracking-widest text-[#3FD9B4]">
            {lang === 'ru' ? 'ОСТАВИТЬ ЗАЯВКУ' : 'GET IN TOUCH'}
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-[#E8EEF7]">
            {lang === 'ru'
              ? 'Вы ставите задачу, я довожу её до результата.'
              : 'You set the task, I bring it to a result.'}
          </h2>
          <p className="text-sm sm:text-base text-[#A9B6CA] max-w-2xl mx-auto">
            {lang === 'ru'
              ? 'Опишите задачу в форме или напишите в Telegram. Оценка бесплатно. Отвечу, как только увижу заявку.'
              : 'Describe your task in the form or write on Telegram. Estimation is free. I will reply as soon as I see your request.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate('contacts')}
              className="inline-flex items-center gap-3 bg-[#2E54F5] hover:bg-[#3A60F7] text-white font-medium px-6 py-3.5 btn-pill-dots text-sm sm:text-base cursor-pointer"
            >
              <span>{lang === 'ru' ? 'Оставить заявку' : 'Leave a Request'}</span>
              <span className="dot-seq flex items-center gap-1" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate('calc')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/18 hover:border-[#3FD9B4] text-[#E8EEF7] hover:text-white text-sm sm:text-base font-medium transition-colors cursor-pointer"
            >
              <span>{lang === 'ru' ? 'Посчитать стоимость' : 'Calculate Cost'}</span>
              <ArrowRight className="w-4 h-4 text-[#3FD9B4]" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
