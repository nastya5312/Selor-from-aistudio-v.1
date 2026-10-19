import React, { useEffect } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Calculator,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import {
  Lang,
  PageId,
  SERVICE_GROUPS,
  SERVICES,
  ServiceItem,
  formatBynUsd,
} from '../data/servicesData';
import { CssViz } from '../components/CssViz';
import { AutomationSuccessMetric } from '../components/AutomationSuccessMetric';
import { ToastVariant } from '../components/Toast';

interface ServicesPageProps {
  lang: Lang;
  focusedServiceId?: string | null;
  navigate: (p: PageId, opts?: { serviceId?: string; leadText?: string }) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  lang,
  focusedServiceId,
  navigate,
}) => {
  useEffect(() => {
    if (focusedServiceId) {
      const el = document.getElementById(`svc-${focusedServiceId}`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 80);
      }
    }
  }, [focusedServiceId]);

  return (
    <div>
      {/* Тёмная шапка страницы услуг (.on-deep) */}
      <section className="on-deep py-14 sm:py-20 border-b border-white/10 relative overflow-hidden">
        <div
          className="pointer-events-none absolute top-0 right-1/4 w-96 h-96 rounded-full opacity-20 blur-[110px]"
          style={{
            background: 'radial-gradient(circle, #2E54F5 0%, #3FCFE6 70%, transparent 100%)',
          }}
          aria-hidden="true"
        />
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="text-xs font-mono uppercase tracking-widest text-[#3FD9B4]">
                {lang === 'ru'
                  ? 'ПОЛНЫЙ КАТАЛОГ · 15 УСЛУГ В 4 ГРУППАХ'
                  : 'COMPLETE CATALOG · 15 SERVICES ACROSS 4 GROUPS'}
              </div>
              <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#E8EEF7]">
                {lang === 'ru'
                  ? 'Сайты, боты и заявки, автоматизация и доработка'
                  : 'Websites, bots & leads, automation, and rework'}
              </h1>
              <p className="text-sm sm:text-base text-[#A9B6CA] max-w-2xl leading-relaxed">
                {lang === 'ru'
                  ? 'Раскройте любую карточку, чтобы посмотреть кому подходит услуга, что входит в работу, этапы и базовый тариф в BYN (~USD).'
                  : 'Expand any card to inspect who it suits, what is included, stages, and starting rate in BYN (~USD).'}
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="deep-glass-card p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-[#A9B6CA]">
                  <span>SELOR · CATALOG</span>
                  <span className="text-[#3FD9B4]">15 / 15</span>
                </div>
                <CssViz type="flow" lang={lang} />
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#DCEAFB] pt-1">
                  <span>
                    {lang === 'ru' ? 'Подробные страницы:' : 'Detailed pages:'}
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate('sajty')}
                      className="text-[#3FCFE6] hover:underline font-medium cursor-pointer"
                    >
                      {lang === 'ru' ? 'Сайты →' : 'Websites →'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('telegram-boty')}
                      className="text-[#3FD9B4] hover:underline font-medium cursor-pointer"
                    >
                      {lang === 'ru' ? 'Telegram-боты →' : 'Telegram Bots →'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('dannye')}
                      className="text-[#3FD9B4] hover:underline font-medium cursor-pointer"
                    >
                      {lang === 'ru' ? 'Автоматизация + ROI →' : 'Automation + ROI →'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Список всех 15 услуг по 4 группам (<details class="svc">) */}
      <section className="adaptive-scene py-14 sm:py-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-16">
          {SERVICE_GROUPS.map((group) => {
            const groupServices = SERVICES.filter((s) => s.groupId === group.id);
            return (
              <div key={group.id} className="space-y-6">
                <div className="border-b border-current/10 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-[#2E54F5]">
                      {group.title[lang]}
                    </div>
                    <p className="text-sm opacity-80 mt-1">{group.subtitle[lang]}</p>
                  </div>
                  <span className="text-xs font-mono opacity-60">
                    {groupServices.length}{' '}
                    {lang === 'ru' ? 'услуг в группе' : 'services in group'}
                  </span>
                </div>

                <div className="space-y-4">
                  {groupServices.map((svc) => {
                    const priceInfo = formatBynUsd(
                      svc.basePriceByn,
                      lang,
                      svc.isMonthly
                    );
                    const isInitiallyOpen =
                      focusedServiceId === svc.id || svc.id === 'kviz-sajt';

                    return (
                      <details
                        key={svc.id}
                        id={`svc-${svc.id}`}
                        className="svc group overflow-hidden"
                        open={isInitiallyOpen}
                      >
                        <summary className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 flex-1">
                            <CssViz type={svc.vizType} compact lang={lang} />

                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-display font-bold text-lg sm:text-xl">
                                  {svc.title[lang]}
                                </h3>
                                {svc.isMonthly && (
                                  <span className="text-xs font-mono text-[#2E54F5]">
                                    · {lang === 'ru' ? 'в месяц' : 'monthly'}
                                  </span>
                                )}
                                {svc.isHourly && (
                                  <span className="text-xs font-mono text-[#2E54F5]">
                                    · {lang === 'ru' ? 'почасовая' : 'hourly'}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm opacity-80 max-w-2xl leading-relaxed">
                                {svc.shortDesc[lang]}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-current/10 shrink-0">
                            <div className="text-left md:text-right">
                              <div className="text-[11px] opacity-65">
                                {svc.isMonthly
                                  ? lang === 'ru'
                                    ? 'Ежемесячно'
                                    : 'Monthly'
                                  : lang === 'ru'
                                  ? `Срок от ~${svc.baseDays} дн.`
                                  : `From ~${svc.baseDays} days`}
                              </div>
                              <div className="font-display font-bold text-lg tabular-nums">
                                {lang === 'ru' ? 'от ' : 'from '}
                                {priceInfo.bynText}
                              </div>
                              <div className="text-xs font-mono opacity-75 tabular-nums">
                                {priceInfo.usdText}
                              </div>
                            </div>

                            <span className="w-10 h-10 rounded-full bg-[#2E54F5] text-white flex items-center justify-center transition-transform group-open:rotate-90 shrink-0">
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </summary>

                        <div className="px-5 sm:px-6 pb-6 pt-4 border-t border-current/10 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Кому подходит */}
                            <div className="space-y-2.5">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E54F5]">
                                {lang === 'ru' ? 'Кому подходит' : 'Who It Suits'}
                              </h4>
                              <ul className="space-y-2 text-sm opacity-85">
                                {svc.whoSuits[lang].map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-[#2E54F5] font-bold">·</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Что входит в работу */}
                            <div className="space-y-2.5">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E54F5]">
                                {lang === 'ru' ? 'Тарифы и что входит' : 'Rates & What Is Included'}
                              </h4>
                              <ul className="space-y-2 text-sm opacity-85">
                                {svc.whatIncluded[lang].map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-[#2E54F5] shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Этапы */}
                            <div className="space-y-2.5">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E54F5]">
                                {lang === 'ru' ? 'Этапы работы' : 'Stages'}
                              </h4>
                              <ul className="space-y-2 text-xs font-mono opacity-85">
                                {svc.stages[lang].map((item, idx) => (
                                  <li
                                    key={idx}
                                    className="py-1 border-b border-current/10 last:border-b-0"
                                  >
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-current/10 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <button
                                type="button"
                                onClick={() => navigate('calc', { serviceId: svc.id })}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2E54F5] hover:bg-[#1E40D8] text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                              >
                                <Calculator className="w-4 h-4" />
                                <span>
                                  {lang === 'ru'
                                    ? 'Рассчитать в калькуляторе'
                                    : 'Calculate in Configurator'}
                                </span>
                              </button>

                              {svc.hasDetailPage && (
                                <button
                                  type="button"
                                  onClick={() => navigate(svc.id as PageId)}
                                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#2E54F5] text-[#2E54F5] hover:bg-[#2E54F5] hover:text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                                >
                                  <span>
                                    {svc.groupId === 'automation' || svc.groupId === 'bots'
                                      ? lang === 'ru'
                                        ? 'Подробная страница + прогноз ROI'
                                        : 'Detailed Page + Projected ROI'
                                      : lang === 'ru'
                                      ? 'Подробная страница с пакетами и FAQ'
                                      : 'Detailed Page with Packages & FAQ'}
                                  </span>
                                  <ArrowUpRight className="w-4 h-4" />
                                </button>
                              )}

                              {/* Для Квиз-сайта — точные кнопки перехода на 2 демо-квиза */}
                              {svc.hasDemoQuizzes && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => navigate('demo-okna')}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#0E2280] hover:bg-[#2E54F5] text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                                  >
                                    <span>
                                      {lang === 'ru'
                                        ? 'Посмотреть демо: подбор окон'
                                        : 'View demo: window selection'}
                                    </span>
                                    <ExternalLink className="w-3.5 h-3.5 text-[#3FD9B4]" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => navigate('demo-potolki')}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#0E2280] hover:bg-[#2E54F5] text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                                  >
                                    <span>
                                      {lang === 'ru'
                                        ? 'Посмотреть демо: натяжные потолки'
                                        : 'View demo: stretch ceilings'}
                                    </span>
                                    <ExternalLink className="w-3.5 h-3.5 text-[#3FCFE6]" />
                                  </button>
                                </>
                              )}
                            </div>

                            <span className="text-xs opacity-65 font-mono">
                              {svc.id} ({svc.calcKey})
                            </span>
                          </div>
                        </div>
                      </details>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

/* ДЕТАЛЬНАЯ СТРАНИЦА УСЛУГИ (Сайты, Боты и Услуги автоматизации с графиком ROI на Recharts) */
interface ServiceDetailPageProps {
  serviceId:
    | 'sajty'
    | 'telegram-boty'
    | 'zayavki'
    | 'dannye'
    | 'zakupki'
    | 'audit';
  lang: Lang;
  navigate: (p: PageId, opts?: { serviceId?: string; leadText?: string }) => void;
  onNotify?: (title: string, description?: string, variant?: ToastVariant) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  serviceId,
  lang,
  navigate,
  onNotify,
}) => {
  const service: ServiceItem =
    SERVICES.find((s) => s.id === serviceId) || SERVICES[0];
  const baseFormatted = formatBynUsd(service.basePriceByn, lang);
  const isAutomationOrBot =
    service.groupId === 'automation' || service.groupId === 'bots';
  const automationDetailServices = SERVICES.filter(
    (s) => s.groupId === 'automation' || s.groupId === 'bots'
  );

  return (
    <div>
      {/* Тёмная шапка с хлебными крошками */}
      <section className="on-deep py-12 sm:py-18 border-b border-white/10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-6">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-[#A9B6CA]"
          >
            <button
              type="button"
              onClick={() => navigate('home')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {lang === 'ru' ? 'Главная' : 'Home'}
            </button>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            <button
              type="button"
              onClick={() => navigate('services')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {lang === 'ru' ? 'Услуги' : 'Services'}
            </button>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            <span className="text-[#3FD9B4] font-medium">{service.title[lang]}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="text-xs font-mono uppercase tracking-widest text-[#3FD9B4]">
                {lang === 'ru'
                  ? 'ДЕТАЛЬНАЯ СТРАНИЦА НАПРАВЛЕНИЯ'
                  : 'DETAILED SERVICE SPECIFICATION'}
              </div>
              <h1 className="font-display font-bold text-3xl sm:text-5xl text-white">
                {service.title[lang]}
              </h1>
              <p className="text-base sm:text-lg text-[#A9B6CA] leading-relaxed">
                {service.shortDesc[lang]}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate('calc', { serviceId: service.id })}
                  className="inline-flex items-center gap-2.5 bg-[#2E54F5] hover:bg-[#3A60F7] text-white font-medium px-6 py-3 btn-pill-dots text-sm cursor-pointer"
                >
                  <span>
                    {lang === 'ru'
                      ? 'Рассчитать в калькуляторе'
                      : 'Calculate in Configurator'}
                  </span>
                  <span className="dot-seq flex items-center gap-1" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                  </span>
                </button>
                <div className="text-xs text-[#DCEAFB] font-mono tabular-nums">
                  {lang === 'ru' ? 'Старт от ' : 'Starts at '}
                  <strong className="text-white">{baseFormatted.bynText}</strong> (
                  {baseFormatted.usdText}) · ~{service.baseDays}{' '}
                  {lang === 'ru' ? 'дн.' : 'days'}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="deep-glass-card p-5 space-y-3">
                <CssViz type={service.vizType} lang={lang} />
                <div className="text-xs text-[#A9B6CA] flex items-center justify-between pt-1">
                  <span>
                    {lang === 'ru'
                      ? 'Вы ставите задачу, я довожу её до результата.'
                      : 'You set the task, I bring it to a result.'}
                  </span>
                  <span className="font-mono text-[#3FD9B4]">
                    {isAutomationOrBot ? 'ROI Analytics' : 'Mobile-First'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Быстрое переключение между услугами автоматизации и ботов */}
          {isAutomationOrBot && (
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-[#A9B6CA] mr-1">
                {lang === 'ru'
                  ? 'Направления автоматизации:'
                  : 'Automation services:'}
              </span>
              {automationDetailServices.map((item) => {
                const active = item.id === service.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.id as PageId)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#2E54F5] text-white'
                        : 'bg-white/5 text-[#DCEAFB] hover:bg-white/10'
                    }`}
                  >
                    {item.title[lang]}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Пакеты стоимости, Success Metric (ROI Recharts), дополнения и блок FAQ */}
      <section className="adaptive-scene py-14 sm:py-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-16">
          {/* Блок Success Metric (Recharts) для услуг автоматизации и ботов */}
          {isAutomationOrBot && (
            <AutomationSuccessMetric
              service={service}
              lang={lang}
              onNotify={onNotify}
              onSendRoiToLead={(summaryText) => {
                if (onNotify) {
                  onNotify(
                    lang === 'ru'
                      ? 'Прогноз ROI добавлен в заявку'
                      : 'ROI projection attached to inquiry',
                    lang === 'ru'
                      ? `${service.title.ru} — расчёт экономии перенесён в форму`
                      : `${service.title.en} — savings projection transferred to form`,
                    'info'
                  );
                }
                navigate('contacts', { leadText: summaryText });
              }}
            />
          )}

          {/* 1. Пакеты стоимости */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-widest text-[#2E54F5]">
                {lang === 'ru' ? 'ПАКЕТЫ СТОИМОСТИ' : 'PRICING PACKAGES'}
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl">
                {lang === 'ru'
                  ? 'Базовые пакеты и сроки выполнения'
                  : 'Base packages and delivery timeframes'}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {service.packages.map((pkg, idx) => {
                const pkgFormatted = formatBynUsd(pkg.priceByn, lang);
                const isHighlighted = idx === 1;
                return (
                  <div
                    key={pkg.id}
                    className={`glass-card p-6 sm:p-7 flex flex-col justify-between gap-6 ${
                      isHighlighted ? 'ring-2 ring-[#2E54F5]' : ''
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#2E54F5] font-bold uppercase">
                          {pkg.id}
                        </span>
                        <span className="opacity-75 tabular-nums">
                          {pkg.days} {lang === 'ru' ? 'дн.' : 'days'}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-display font-bold text-xl">
                          {pkg.name[lang]}
                        </h3>
                        <p className="text-xs sm:text-sm opacity-80 mt-1">
                          {pkg.subtitle[lang]}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-current/10">
                        <div className="font-display font-bold text-2xl sm:text-3xl tabular-nums">
                          {pkgFormatted.bynText}
                        </div>
                        <div className="text-xs font-mono opacity-75 tabular-nums">
                          {pkgFormatted.usdText}
                        </div>
                      </div>

                      <div className="space-y-2.5 pt-2">
                        <div className="text-xs font-semibold opacity-75">
                          {lang === 'ru' ? 'Что включено:' : 'Included:'}
                        </div>
                        {pkg.lines.map((line, i) => (
                          <div
                            key={i}
                            className="flex items-start justify-between gap-2 text-xs sm:text-sm"
                          >
                            <span className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-[#2E54F5] shrink-0 mt-0.5" />
                              <span>{line.label[lang]}</span>
                            </span>
                            <span className="font-mono text-xs opacity-75 tabular-nums shrink-0">
                              {line.priceByn === 0
                                ? lang === 'ru'
                                  ? 'входит'
                                  : 'included'
                                : `${line.priceByn} BYN`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-current/10 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigate('contacts', {
                            leadText:
                              lang === 'ru'
                                ? `[Запрос со страницы «${service.title.ru}»]\nПакет: ${pkg.name.ru}\nСтоимость: ${pkgFormatted.fullText}\nСрок: ~${pkg.days} дн.`
                                : `[Inquiry from "${service.title.en}" page]\nPackage: ${pkg.name.en}\nPrice: ${pkgFormatted.fullText}\nTimeframe: ~${pkg.days} days`,
                          })
                        }
                        className="w-full py-3 px-4 rounded-full bg-[#2E54F5] hover:bg-[#1E40D8] text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                      >
                        {lang === 'ru'
                          ? 'Выбрать пакет и оставить заявку'
                          : 'Select Package & Inquire'}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('calc', { serviceId: service.id })}
                        className="w-full py-2.5 px-4 rounded-full border border-current/15 hover:border-[#2E54F5] text-xs font-medium transition-colors cursor-pointer"
                      >
                        {lang === 'ru'
                          ? 'Настроить с дополнениями в калькуляторе'
                          : 'Customize in Calculator'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Список дополнений */}
          {service.options.length > 0 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-widest text-[#2E54F5]">
                  {lang === 'ru' ? 'ДОПОЛНЕНИЯ' : 'OPTIONAL ADD-ONS'}
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl">
                  {lang === 'ru'
                    ? 'Дополнительные опции к базовым пакетам'
                    : 'Add-ons available for packages'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.options.map((opt) => {
                  const optFormatted = formatBynUsd(opt.priceByn, lang);
                  return (
                    <div
                      key={opt.id}
                      className="glass-card p-5 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="font-medium text-sm sm:text-base">
                          {opt.label[lang]}
                        </div>
                        {opt.includedInPackages?.includes('simple') && (
                          <div className="text-xs font-mono text-[#2E54F5]">
                            {lang === 'ru'
                              ? 'В пакет «Простой» уже входит бесплатно'
                              : 'Already included free in the Simple package'}
                          </div>
                        )}
                        {opt.perUnit && opt.unitLabel && (
                          <div className="text-xs opacity-70 font-mono">
                            {lang === 'ru'
                              ? `За единицу: ${opt.unitLabel.ru}`
                              : `Per unit: ${opt.unitLabel.en}`}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-display font-bold text-base sm:text-lg text-[#2E54F5] tabular-nums">
                          +{optFormatted.bynText}
                        </div>
                        <div className="text-xs font-mono opacity-75 tabular-nums">
                          {optFormatted.usdText}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Блок частых вопросов (FAQ) */}
          {service.faq && service.faq.length > 0 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-widest text-[#2E54F5]">
                  {lang === 'ru' ? 'ЧАСТЫЕ ВОПРОСЫ (FAQ)' : 'FREQUENTLY ASKED QUESTIONS'}
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl">
                  {lang === 'ru'
                    ? 'Ответы на частые вопросы'
                    : 'Frequently Asked Questions'}
                </h2>
              </div>

              <div className="space-y-3">
                {service.faq.map((f, idx) => (
                  <details key={idx} className="svc p-5 sm:p-6" open={idx === 0}>
                    <summary className="flex items-center justify-between gap-4 font-display font-bold text-base sm:text-lg">
                      <span className="flex items-center gap-2.5">
                        <HelpCircle className="w-5 h-5 text-[#2E54F5] shrink-0" />
                        <span>{f.q[lang]}</span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#2E54F5] shrink-0" />
                    </summary>
                    <p className="mt-3 pt-3 border-t border-current/10 text-sm sm:text-base opacity-85 leading-relaxed">
                      {f.a[lang]}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
