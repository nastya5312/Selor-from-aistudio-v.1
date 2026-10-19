import React, { useState, useEffect, useMemo } from 'react';
import {
  Check,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Send,
  Copy,
  RotateCcw,
  Clock,
} from 'lucide-react';
import pricesData from '../data/prices.json';
import {
  Lang,
  PageId,
  UrgencyMode,
  SERVICE_GROUPS,
  SERVICES,
  formatBynUsd,
  roundToTen,
} from '../data/servicesData';

interface CalculatorPageProps {
  lang: Lang;
  initialServiceId?: string | null;
  navigate: (p: PageId, opts?: { serviceId?: string; leadText?: string }) => void;
  onNotify?: (
    title: string,
    description?: string,
    variant?: 'success' | 'info' | 'error'
  ) => void;
}

interface ServiceConfigState {
  packageId: string;
  checkedOptions: string[];
  unitCounts: Record<string, number>;
}

export const CalculatorPage: React.FC<CalculatorPageProps> = ({
  lang,
  initialServiceId,
  navigate,
  onNotify,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    initialServiceId ? [initialServiceId] : ['sajty']
  );

  // Инициализация состояния по всем 15 группам услуг из prices.json
  const [configs, setConfigs] = useState<Record<string, ServiceConfigState>>(() => {
    const map: Record<string, ServiceConfigState> = {};
    pricesData.groups.forEach((g) => {
      map[g.serviceId] = {
        packageId: g.packages[0].id,
        checkedOptions: [],
        unitCounts: {},
      };
    });
    return map;
  });

  // Шаг 3: Срочность («Как быстро?»: normal / faster / urgent)
  const [urgency, setUrgency] = useState<UrgencyMode>('normal');
  const [copiedSummary, setCopiedSummary] = useState(false);

  useEffect(() => {
    if (initialServiceId && !selectedServiceIds.includes(initialServiceId)) {
      setSelectedServiceIds((prev) =>
        prev.length === 0 ? [initialServiceId] : [...prev, initialServiceId]
      );
    }
  }, [initialServiceId]);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const setPackageForService = (svcId: string, pkgId: string) => {
    setConfigs((prev) => ({
      ...prev,
      [svcId]: { ...prev[svcId], packageId: pkgId },
    }));
  };

  const toggleOptionCheckbox = (svcId: string, optId: string) => {
    setConfigs((prev) => {
      const current = prev[svcId].checkedOptions;
      const next = current.includes(optId)
        ? current.filter((o) => o !== optId)
        : [...current, optId];
      return {
        ...prev,
        [svcId]: { ...prev[svcId], checkedOptions: next },
      };
    });
  };

  const changeOptionUnits = (
    svcId: string,
    optId: string,
    delta: number,
    maxUnits = 10
  ) => {
    setConfigs((prev) => {
      const currentVal = prev[svcId].unitCounts[optId] || 0;
      const nextVal = Math.max(0, Math.min(maxUnits, currentVal + delta));
      return {
        ...prev,
        [svcId]: {
          ...prev[svcId],
          unitCounts: {
            ...prev[svcId].unitCounts,
            [optId]: nextVal,
          },
        },
      };
    });
  };

  // Точный расчёт по всем 15 группам из prices.json + формула срочности (normal/faster/urgent) с округлением до 10
  const calculation = useMemo(() => {
    let rawOneTimeByn = 0;
    let monthlyByn = 0;
    let rawDays = 0;

    const itemSummaries: {
      serviceId: string;
      calcKey: string;
      title: string;
      pkgName: string;
      isMonthly: boolean;
      baseSubtotalByn: number;
      adjustedSubtotalByn: number;
      days: number;
      details: string[];
    }[] = [];

    const urgencyRule = pricesData.urgency[urgency];
    const priceMultiplier = urgencyRule.priceNum / urgencyRule.priceDen;
    const daysMultiplier = urgencyRule.daysNum / urgencyRule.daysDen;

    selectedServiceIds.forEach((id) => {
      const priceGroup = pricesData.groups.find((g) => g.serviceId === id);
      if (!priceGroup) return;

      const cfg = configs[id] || {
        packageId: priceGroup.packages[0].id,
        checkedOptions: [],
        unitCounts: {},
      };
      const pkg =
        priceGroup.packages.find((p) => p.id === cfg.packageId) ||
        priceGroup.packages[0];

      let svcByn = pkg.priceByn;
      const svcDays = pkg.days;
      const details: string[] = [];

      priceGroup.options.forEach((opt) => {
        const onlyForPackages = (opt as { onlyForPackages?: string[] }).onlyForPackages;
        const includedInPackages = (opt as { includedInPackages?: string[] })
          .includedInPackages;
        const isPerUnit = Boolean((opt as { perUnit?: boolean }).perUnit);

        // Проверка ограничения пакета (например, индивидуальный дизайн только к «Простой» или доп. интеграция бота только к «crm»)
        if (onlyForPackages && !onlyForPackages.includes(pkg.id)) {
          return;
        }

        // Проверка включённости бесплатно в выбранный пакет
        if (includedInPackages && includedInPackages.includes(pkg.id)) {
          details.push(
            lang === 'ru'
              ? `${opt.label.ru} (входит бесплатно в пакет «${pkg.name.ru}»)`
              : `${opt.label.en} (included free in "${pkg.name.en}")`
          );
          return;
        }

        if (isPerUnit) {
          const count = cfg.unitCounts[opt.id] || 0;
          if (count > 0) {
            const addByn = count * opt.priceByn;
            svcByn += addByn;
            details.push(
              `${opt.label[lang]}: ${count} × ${opt.priceByn} = +${addByn} BYN`
            );
          }
        } else {
          if (cfg.checkedOptions.includes(opt.id)) {
            svcByn += opt.priceByn;
            details.push(`${opt.label[lang]} (+${opt.priceByn} BYN)`);
          }
        }
      });

      const isMonthly = Boolean(priceGroup.isMonthly);
      if (isMonthly) {
        monthlyByn += svcByn;
      } else {
        rawOneTimeByn += svcByn;
        rawDays += svcDays;
      }

      const adjustedSubtotalByn = isMonthly
        ? svcByn
        : roundToTen(svcByn * priceMultiplier);

      itemSummaries.push({
        serviceId: priceGroup.serviceId,
        calcKey: priceGroup.key,
        title: priceGroup.title[lang],
        pkgName: pkg.name[lang],
        isMonthly,
        baseSubtotalByn: svcByn,
        adjustedSubtotalByn,
        days: svcDays,
        details,
      });
    });

    // Применение формулы срочности и округления roundTo: 10 к разовой сумме
    const finalOneTimeByn =
      rawOneTimeByn > 0 ? roundToTen(rawOneTimeByn * priceMultiplier) : 0;
    const finalDays =
      rawDays > 0 ? Math.max(1, Math.round(rawDays * daysMultiplier)) : 0;

    // Справочный расчёт для всех 3 режимов срочности на Шаге 3
    const previewByUrgency: Record<
      UrgencyMode,
      { oneTimeByn: number; days: number }
    > = {
      normal: {
        oneTimeByn: rawOneTimeByn > 0 ? roundToTen(rawOneTimeByn * 1) : 0,
        days: rawDays > 0 ? Math.max(1, Math.round(rawDays * 1)) : 0,
      },
      faster: {
        oneTimeByn: rawOneTimeByn > 0 ? roundToTen((rawOneTimeByn * 5) / 4) : 0,
        days: rawDays > 0 ? Math.max(1, Math.round((rawDays * 2) / 3)) : 0,
      },
      urgent: {
        oneTimeByn: rawOneTimeByn > 0 ? roundToTen((rawOneTimeByn * 3) / 2) : 0,
        days: rawDays > 0 ? Math.max(1, Math.round((rawDays * 1) / 2)) : 0,
      },
    };

    const urgencyLabel =
      urgency === 'normal'
        ? lang === 'ru'
          ? 'Обычный (цена × 1, срок × 1)'
          : 'Normal (price × 1, time × 1)'
        : urgency === 'faster'
        ? lang === 'ru'
          ? 'Быстрее (цена × 5/4 [+25%], срок × 2/3)'
          : 'Faster (price × 5/4 [+25%], time × 2/3)'
        : lang === 'ru'
        ? 'Срочно (цена × 3/2 [+50%], срок × 1/2)'
        : 'Urgent (price × 3/2 [+50%], time × 1/2)';

    return {
      rawOneTimeByn,
      oneTimeByn: finalOneTimeByn,
      monthlyByn,
      rawDays,
      totalDays: finalDays,
      itemSummaries,
      urgencyLabel,
      previewByUrgency,
    };
  }, [selectedServiceIds, configs, urgency, lang]);

  const buildFormattedCalculationText = (): string => {
    const itemsBlock = calculation.itemSummaries
      .map((item) => {
        const priceStr = formatBynUsd(
          item.baseSubtotalByn,
          lang,
          item.isMonthly
        ).fullText;
        const optsStr =
          item.details.length > 0
            ? `\n   Дополнения: ${item.details.join('; ')}`
            : '';
        return `• ${item.title} — пакет «${item.pkgName}»: ${priceStr}${optsStr}`;
      })
      .join('\n');

    const oneTimeText =
      calculation.oneTimeByn > 0
        ? formatBynUsd(calculation.oneTimeByn, lang, false).fullText
        : '0 BYN';
    const monthlyText =
      calculation.monthlyByn > 0
        ? `\nЕжемесячно (Поддержка сайта): ${
            formatBynUsd(calculation.monthlyByn, lang, true).fullText
          }`
        : '';

    return lang === 'ru'
      ? `Расчёт из калькулятора Selor:\n${itemsBlock}\n\nКак быстро (срочность): ${calculation.urgencyLabel}\nИтого разовая часть (с округлением до ${pricesData.roundTo} BYN): ${oneTimeText}${monthlyText}\nОриентировочный срок: ${calculation.totalDays} дн.`
      : `Estimate from Selor Calculator:\n${itemsBlock}\n\nUrgency: ${calculation.urgencyLabel}\nOne-time Total (rounded to ${pricesData.roundTo} BYN): ${oneTimeText}${monthlyText}\nEstimated Timeframe: ${calculation.totalDays} days`;
  };

  const handleSendAsLead = () => {
    const text = buildFormattedCalculationText();
    if (onNotify) {
      onNotify(
        lang === 'ru'
          ? 'Расчёт перенесён в заявку'
          : 'Calculation added to inquiry',
        lang === 'ru'
          ? 'Сводка подставлена в поле «Задача» на странице Контакты.'
          : 'Your summary has been pre-filled in the task field on the Contacts page.',
        'info'
      );
    }
    navigate('contacts', { leadText: text });
  };

  const handleCopySummary = () => {
    const text = buildFormattedCalculationText();
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    if (onNotify) {
      onNotify(
        lang === 'ru' ? 'Расчёт скопирован' : 'Calculation copied',
        lang === 'ru'
          ? 'Сводка расчёта сохранена в буфер обмена.'
          : 'The itemized estimate has been copied to your clipboard.',
        'success'
      );
    }
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const stepLabels = [
    { num: 1, title: { ru: 'Выбор услуг (15)', en: 'Select Services (15)' } },
    { num: 2, title: { ru: 'Пакеты и дополнения', en: 'Packages & Add-ons' } },
    { num: 3, title: { ru: 'Как быстро?', en: 'How Fast?' } },
    { num: 4, title: { ru: 'Итог расчёта', en: 'Final Estimate' } },
  ];

  const urgencyModes: UrgencyMode[] = ['normal', 'faster', 'urgent'];

  return (
    <div className={step === 2 || step === 3 ? 'pb-28' : ''}>
      {/* Тёмная шапка калькулятора (.on-deep) */}
      <section className="on-deep py-12 sm:py-16 border-b border-white/10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-[#3FD9B4]">
                {lang === 'ru'
                  ? `КАЛЬКУЛЯТОР СТОИМОСТИ · 15 ГРУПП УСЛУГ · ОКРУГЛЕНИЕ ДО ${pricesData.roundTo} ${pricesData.currency}`
                  : `COST CALCULATOR · 15 SERVICE GROUPS · ROUNDED TO ${pricesData.roundTo} ${pricesData.currency}`}
              </div>
              <h1 className="font-display font-bold text-2xl sm:text-4xl text-white">
                {lang === 'ru'
                  ? 'Расчёт стоимости и сроков по прайсу'
                  : 'Project Cost & Timeframe Calculator'}
              </h1>
            </div>

            <button
              type="button"
              onClick={() => {
                const resetMap: Record<string, ServiceConfigState> = {};
                pricesData.groups.forEach((g) => {
                  resetMap[g.serviceId] = {
                    packageId: g.packages[0].id,
                    checkedOptions: [],
                    unitCounts: {},
                  };
                });
                setConfigs(resetMap);
                setSelectedServiceIds(['sajty']);
                setUrgency('normal');
                setStep(1);
                if (onNotify) {
                  onNotify(
                    lang === 'ru' ? 'Расчёт сброшен' : 'Calculator reset',
                    lang === 'ru'
                      ? 'Восстановлены базовые настройки калькулятора.'
                      : 'Default calculator settings restored.',
                    'info'
                  );
                }
              }}
              className="inline-flex items-center gap-2 text-xs text-[#A9B6CA] hover:text-white transition-colors self-start md:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'ru' ? 'Сбросить расчёт' : 'Reset calculator'}</span>
            </button>
          </div>

          {/* Навигация по 4 шагам с кружками-номерами */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stepLabels.map((s) => {
              const isCurrent = step === s.num;
              const isDone = step > s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    if (selectedServiceIds.length > 0 || s.num === 1) {
                      setStep(s.num as 1 | 2 | 3 | 4);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                    isCurrent
                      ? 'bg-[#2E54F5]/30 border-[#3FCFE6] text-white shadow-[0_0_24px_rgba(46,84,245,0.35)]'
                      : isDone
                      ? 'bg-white/[0.06] border-[#3FD9B4]/40 text-[#E8EEF7]'
                      : 'bg-white/[0.02] border-white/10 text-[#A9B6CA] hover:text-white'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isCurrent
                        ? 'bg-[#2E54F5] text-white'
                        : isDone
                        ? 'bg-[#3FD9B4] text-[#05080D]'
                        : 'bg-white/10 text-[#A9B6CA]'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : s.num}
                  </span>
                  <div className="truncate">
                    <div className="text-[11px] font-mono opacity-75">
                      {lang === 'ru' ? `Шаг ${s.num}` : `Step ${s.num}`}
                    </div>
                    <div className="text-xs sm:text-sm font-medium truncate">
                      {s.title[lang]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="adaptive-scene py-12 sm:py-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          {/* ШАГ 1: Выбор одной или нескольких из 15 услуг (сгруппированных по 4 направлениям) */}
          {step === 1 && (
            <div className="space-y-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-bold text-xl sm:text-2xl">
                    {lang === 'ru'
                      ? 'Шаг 1. Выберите одну или несколько услуг (из 15 групп прайса)'
                      : 'Step 1. Select one or multiple services (from 15 price groups)'}
                  </h2>
                  <p className="text-sm opacity-80 mt-1">
                    {lang === 'ru'
                      ? 'Отметьте нужные направления — на Шаге 2 вы выберете пакет, чекбоксы и счётчики для каждой услуги.'
                      : 'Check the services you need — on Step 2 you will configure packages, checkboxes, and unit counters.'}
                  </p>
                </div>

                <div className="text-sm font-mono">
                  {lang === 'ru' ? 'Выбрано услуг: ' : 'Selected: '}
                  <strong className="text-[#2E54F5]">{selectedServiceIds.length}</strong> / 15
                </div>
              </div>

              {SERVICE_GROUPS.map((grp) => {
                const groupServices = SERVICES.filter((s) => s.groupId === grp.id);
                return (
                  <div key={grp.id} className="space-y-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-[#2E54F5]">
                      {grp.title[lang]}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupServices.map((svc) => {
                        const isChecked = selectedServiceIds.includes(svc.id);
                        const priceGroup = pricesData.groups.find(
                          (g) => g.serviceId === svc.id
                        );
                        const minPkgPrice = priceGroup
                          ? priceGroup.packages[0].priceByn
                          : svc.basePriceByn;
                        const minPkgDays = priceGroup
                          ? priceGroup.packages[0].days
                          : svc.baseDays;
                        const priceInfo = formatBynUsd(
                          minPkgPrice,
                          lang,
                          svc.isMonthly
                        );
                        return (
                          <div
                            key={svc.id}
                            onClick={() => toggleService(svc.id)}
                            role="checkbox"
                            aria-checked={isChecked}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleService(svc.id);
                              }
                            }}
                            className={`glass-card p-5 cursor-pointer transition-all flex flex-col justify-between gap-4 ${
                              isChecked
                                ? 'ring-2 ring-[#2E54F5] border-[#2E54F5]'
                                : 'hover:border-[#2E54F5]/50'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-[11px] font-mono text-[#2E54F5] uppercase">
                                    {svc.calcKey}
                                  </div>
                                  <h3 className="font-display font-bold text-base sm:text-lg">
                                    {svc.calcTitle[lang]}
                                  </h3>
                                </div>
                                <span
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${
                                    isChecked
                                      ? 'bg-[#2E54F5] border-[#2E54F5] text-white'
                                      : 'border-current/25'
                                  }`}
                                >
                                  {isChecked && <Check className="w-4 h-4" />}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
                                {svc.shortDesc[lang]}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-current/10 flex items-center justify-between text-xs font-mono tabular-nums">
                              <span className="font-semibold text-[#2E54F5]">
                                {lang === 'ru' ? 'от ' : 'from '}
                                {priceInfo.bynText} ({priceInfo.usdText})
                              </span>
                              <span className="opacity-70">
                                {svc.isMonthly
                                  ? lang === 'ru'
                                    ? 'в месяц'
                                    : 'monthly'
                                  : `~${minPkgDays} ${lang === 'ru' ? 'дн.' : 'days'}`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={selectedServiceIds.length === 0}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#2E54F5] hover:bg-[#1E40D8] disabled:opacity-40 text-white font-medium text-sm sm:text-base transition-colors cursor-pointer"
                >
                  <span>
                    {lang === 'ru'
                      ? 'Далее: Пакеты и дополнения (Шаг 2)'
                      : 'Next: Packages & Add-ons (Step 2)'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ШАГ 2: Настройка пакетов, чекбоксов и счётчиков (perUnit) из prices.json */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display font-bold text-xl sm:text-2xl">
                  {lang === 'ru'
                    ? 'Шаг 2. Выберите пакет и дополнения для каждой услуги'
                    : 'Step 2. Choose package and add-ons for each service'}
                </h2>
                <p className="text-sm opacity-80 mt-1">
                  {lang === 'ru'
                    ? 'Пакеты, чекбоксы и счётчики (+/-) загружены напрямую из prices.json.'
                    : 'Packages, checkboxes, and unit counters (+/-) are loaded directly from prices.json.'}
                </p>
              </div>

              <div className="space-y-6">
                {selectedServiceIds.map((svcId) => {
                  const priceGroup = pricesData.groups.find(
                    (g) => g.serviceId === svcId
                  );
                  if (!priceGroup) return null;

                  const cfg = configs[svcId] || {
                    packageId: priceGroup.packages[0].id,
                    checkedOptions: [],
                    unitCounts: {},
                  };
                  const activePkg =
                    priceGroup.packages.find((p) => p.id === cfg.packageId) ||
                    priceGroup.packages[0];

                  return (
                    <div
                      key={priceGroup.serviceId}
                      className="glass-card p-6 sm:p-8 space-y-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-current/10 pb-4">
                        <div>
                          <div className="text-xs font-mono text-[#2E54F5] uppercase">
                            {priceGroup.key} · {priceGroup.serviceId}
                          </div>
                          <h3 className="font-display font-bold text-xl sm:text-2xl">
                            {priceGroup.title[lang]}
                          </h3>
                        </div>
                        {selectedServiceIds.length > 1 && (
                          <button
                            type="button"
                            onClick={() => toggleService(priceGroup.serviceId)}
                            className="text-xs opacity-65 hover:opacity-100 underline self-start sm:self-auto cursor-pointer"
                          >
                            {lang === 'ru' ? 'Убрать из расчёта' : 'Remove from quote'}
                          </button>
                        )}
                      </div>

                      {/* Выбор пакета */}
                      <div className="space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider opacity-75">
                          {lang === 'ru' ? 'Пакет:' : 'Package:'}
                        </div>
                        <div
                          className={`grid grid-cols-1 gap-4 ${
                            priceGroup.packages.length === 1
                              ? 'md:grid-cols-1'
                              : priceGroup.packages.length === 2
                              ? 'md:grid-cols-2'
                              : 'md:grid-cols-3'
                          }`}
                        >
                          {priceGroup.packages.map((pkg) => {
                            const isSelected = activePkg.id === pkg.id;
                            const pFormat = formatBynUsd(
                              pkg.priceByn,
                              lang,
                              priceGroup.isMonthly
                            );
                            return (
                              <label
                                key={pkg.id}
                                onClick={() =>
                                  setPackageForService(priceGroup.serviceId, pkg.id)
                                }
                                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                                  isSelected
                                    ? 'border-[#2E54F5] bg-[#2E54F5]/10 ring-1 ring-[#2E54F5]'
                                    : 'border-current/15 hover:border-[#2E54F5]/40'
                                }`}
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-display font-bold text-sm sm:text-base">
                                      {pkg.name[lang]}
                                    </span>
                                    <input
                                      type="radio"
                                      name={`pkg-${priceGroup.serviceId}`}
                                      checked={isSelected}
                                      onChange={() =>
                                        setPackageForService(
                                          priceGroup.serviceId,
                                          pkg.id
                                        )
                                      }
                                      className="accent-[#2E54F5]"
                                    />
                                  </div>
                                  <p className="text-xs opacity-80 leading-relaxed">
                                    {pkg.subtitle[lang]}
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-current/10 flex items-center justify-between text-xs font-mono tabular-nums">
                                  <span className="font-bold text-[#2E54F5]">
                                    {pFormat.bynText} ({pFormat.usdText})
                                  </span>
                                  {pkg.days > 0 && (
                                    <span className="opacity-70">
                                      {pkg.days} {lang === 'ru' ? 'дн.' : 'days'}
                                    </span>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Дополнения (чекбоксы, включённые бесплатно и счётчики perUnit) */}
                      {priceGroup.options.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <div className="text-xs font-bold uppercase tracking-wider opacity-75">
                            {lang === 'ru' ? 'Дополнения:' : 'Add-ons:'}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {priceGroup.options.map((opt) => {
                              const onlyForPackages = (
                                opt as { onlyForPackages?: string[] }
                              ).onlyForPackages;
                              const includedInPackages = (
                                opt as { includedInPackages?: string[] }
                              ).includedInPackages;
                              const isPerUnit = Boolean(
                                (opt as { perUnit?: boolean }).perUnit
                              );
                              const maxUnits =
                                (opt as { maxUnits?: number }).maxUnits || 10;
                              const unitLabel = (
                                opt as { unitLabel?: { ru: string; en: string } }
                              ).unitLabel;

                              const isRestrictedOut = Boolean(
                                onlyForPackages &&
                                  !onlyForPackages.includes(activePkg.id)
                              );
                              const isIncludedFree = Boolean(
                                includedInPackages &&
                                  includedInPackages.includes(activePkg.id)
                              );

                              // Если это счётчик (perUnit: true)
                              if (isPerUnit) {
                                const count = cfg.unitCounts[opt.id] || 0;
                                return (
                                  <div
                                    key={opt.id}
                                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                      isRestrictedOut
                                        ? 'border-current/10 opacity-45'
                                        : count > 0
                                        ? 'border-[#2E54F5] bg-[#2E54F5]/10'
                                        : 'border-current/15'
                                    }`}
                                  >
                                    <div className="space-y-0.5">
                                      <div className="text-xs sm:text-sm font-medium">
                                        {opt.label[lang]}
                                      </div>
                                      <div className="text-xs font-mono text-[#2E54F5]">
                                        +{opt.priceByn} BYN{' '}
                                        {unitLabel ? `· ${unitLabel[lang]}` : ''}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2.5 shrink-0">
                                      <button
                                        type="button"
                                        disabled={isRestrictedOut || count === 0}
                                        onClick={() =>
                                          changeOptionUnits(
                                            priceGroup.serviceId,
                                            opt.id,
                                            -1,
                                            maxUnits
                                          )
                                        }
                                        className="w-8 h-8 rounded-full border border-current/25 disabled:opacity-30 flex items-center justify-center hover:border-[#2E54F5] cursor-pointer"
                                      >
                                        <Minus className="w-3.5 h-3.5" />
                                      </button>
                                      <span className="w-8 text-center font-mono font-bold text-sm tabular-nums">
                                        {isRestrictedOut ? 0 : count}
                                      </span>
                                      <button
                                        type="button"
                                        disabled={isRestrictedOut || count >= maxUnits}
                                        onClick={() =>
                                          changeOptionUnits(
                                            priceGroup.serviceId,
                                            opt.id,
                                            1,
                                            maxUnits
                                          )
                                        }
                                        className="w-8 h-8 rounded-full border border-current/25 disabled:opacity-30 flex items-center justify-center hover:border-[#2E54F5] cursor-pointer"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              }

                              // Если уже входит бесплатно в выбранный пакет
                              if (isIncludedFree) {
                                return (
                                  <div
                                    key={opt.id}
                                    className="p-3.5 rounded-xl border border-[#3FD9B4]/50 bg-[#3FD9B4]/10 flex items-center justify-between gap-3 text-xs sm:text-sm"
                                  >
                                    <span className="flex items-center gap-2.5">
                                      <Check className="w-4 h-4 text-[#2E54F5] shrink-0" />
                                      <span>{opt.label[lang]}</span>
                                    </span>
                                    <span className="font-mono text-xs text-[#2E54F5] font-semibold shrink-0">
                                      {lang === 'ru'
                                        ? `входит в «${activePkg.name.ru}» (0 BYN)`
                                        : `included in ${activePkg.name.en} (0 BYN)`}
                                    </span>
                                  </div>
                                );
                              }

                              // Обычный чекбокс дополнения
                              const checked =
                                !isRestrictedOut &&
                                cfg.checkedOptions.includes(opt.id);
                              const optPrice = formatBynUsd(
                                opt.priceByn,
                                lang,
                                priceGroup.isMonthly
                              );

                              return (
                                <label
                                  key={opt.id}
                                  onClick={() => {
                                    if (!isRestrictedOut) {
                                      toggleOptionCheckbox(
                                        priceGroup.serviceId,
                                        opt.id
                                      );
                                    }
                                  }}
                                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm transition-colors ${
                                    isRestrictedOut
                                      ? 'border-current/10 opacity-45 cursor-not-allowed'
                                      : checked
                                      ? 'border-[#2E54F5] bg-[#2E54F5]/10 cursor-pointer'
                                      : 'border-current/15 hover:border-[#2E54F5]/40 cursor-pointer'
                                  }`}
                                >
                                  <span className="flex items-center gap-2.5">
                                    <input
                                      type="checkbox"
                                      disabled={isRestrictedOut}
                                      checked={checked}
                                      onChange={() => {}}
                                      className="accent-[#2E54F5] w-4 h-4"
                                    />
                                    <span>{opt.label[lang]}</span>
                                  </span>
                                  <span className="font-mono text-xs tabular-nums shrink-0 text-[#2E54F5] font-medium">
                                    +{optPrice.bynText}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-current/20 text-sm font-medium hover:border-[#2E54F5] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{lang === 'ru' ? 'Назад к выбору услуг' : 'Back to Services'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#2E54F5] hover:bg-[#1E40D8] text-white font-medium text-sm sm:text-base transition-colors cursor-pointer"
                >
                  <span>
                    {lang === 'ru'
                      ? 'Далее: Как быстро? (Шаг 3)'
                      : 'Next: How Fast? (Step 3)'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ШАГ 3: Формула срочности («Как быстро?»: normal / faster / urgent) с округлением до 10 BYN */}
          {step === 3 && (
            <div className="space-y-8 max-w-4xl mx-auto">
              <div>
                <h2 className="font-display font-bold text-xl sm:text-2xl">
                  {lang === 'ru' ? 'Шаг 3. Как быстро?' : 'Step 3. How Fast?'}
                </h2>
                <p className="text-sm opacity-80 mt-1">
                  {lang === 'ru'
                    ? `Формула срочности из prices.json применяется к разовой стоимости с округлением до ${pricesData.roundTo} BYN. Ежемесячная оплата поддержки сайта остаётся неизменной.`
                    : `The urgency formula from prices.json applies to the one-time total rounded to ${pricesData.roundTo} BYN. Monthly website maintenance remains unchanged.`}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {urgencyModes.map((modeKey) => {
                  const u = pricesData.urgency[modeKey];
                  const active = urgency === modeKey;
                  const preview = calculation.previewByUrgency[modeKey];
                  const previewFormatted = formatBynUsd(
                    preview.oneTimeByn,
                    lang
                  );

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setUrgency(modeKey)}
                      className={`glass-card p-6 text-left transition-all flex flex-col justify-between gap-5 cursor-pointer ${
                        active
                          ? 'ring-2 ring-[#2E54F5] border-[#2E54F5]'
                          : 'hover:border-[#2E54F5]/50'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-display font-bold text-lg">
                            {u.title[lang]}
                          </span>
                          <Clock className="w-4 h-4 text-[#2E54F5]" />
                        </div>
                        <div className="text-xs font-mono text-[#2E54F5] font-semibold">
                          {u.formula[lang]}
                        </div>
                        <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
                          {u.desc[lang]}
                        </p>
                      </div>

                      {calculation.rawOneTimeByn > 0 && (
                        <div className="pt-3 border-t border-current/10 flex items-center justify-between text-xs font-mono tabular-nums">
                          <span className="font-bold text-[#2E54F5]">
                            {previewFormatted.bynText}
                          </span>
                          <span className="opacity-75">
                            ~{preview.days} {lang === 'ru' ? 'дн.' : 'days'}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-current/20 text-sm font-medium hover:border-[#2E54F5] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{lang === 'ru' ? 'Назад к пакетам' : 'Back to Packages'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#2E54F5] hover:bg-[#1E40D8] text-white font-medium text-sm sm:text-base transition-colors cursor-pointer"
                >
                  <span>
                    {lang === 'ru'
                      ? 'Посмотреть итог расчёта (Шаг 4)'
                      : 'View Final Estimate (Step 4)'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ШАГ 4: Итог расчёта (.calc-result и .calc-summary) + 2 кнопки */}
          {step === 4 && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="calc-result p-6 sm:p-10 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-6">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-[#3FD9B4]">
                      {lang === 'ru'
                        ? `ШАГ 4 · ИТОГОВЫЙ РАСЧЁТ СТОИМОСТИ (ROUNDTO: ${pricesData.roundTo})`
                        : `STEP 4 · FINAL COST ESTIMATE (ROUNDTO: ${pricesData.roundTo})`}
                    </div>
                    <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
                      {lang === 'ru'
                        ? 'Сводка выбранных услуг и сроков'
                        : 'Summary of Selected Services & Timeframe'}
                    </h2>
                  </div>

                  {calculation.totalDays > 0 && (
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-[#A9B6CA]">
                        {lang === 'ru' ? 'Ориентировочный срок:' : 'Estimated timeframe:'}
                      </div>
                      <div className="font-mono font-bold text-xl text-[#CDF26B] tabular-nums">
                        ~{calculation.totalDays}{' '}
                        {lang === 'ru' ? 'дн.' : 'days'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Подробная сводка выбранных пунктов (.calc-summary) */}
                <div className="calc-summary space-y-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#A9B6CA]">
                    {lang === 'ru'
                      ? 'Выбранные позиции и дополнения:'
                      : 'Selected services & add-ons:'}
                  </div>

                  {calculation.itemSummaries.map((item) => {
                    const formatted = formatBynUsd(
                      item.baseSubtotalByn,
                      lang,
                      item.isMonthly
                    );
                    return (
                      <div
                        key={item.serviceId}
                        className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="font-display font-bold text-base sm:text-lg text-white">
                              {item.title}
                            </span>
                            <span className="text-xs text-[#3FCFE6] ml-2">
                              · {item.pkgName}
                            </span>
                          </div>
                          <div className="font-mono font-bold text-base text-white tabular-nums">
                            {formatted.bynText}{' '}
                            <span className="text-xs font-normal text-[#A9B6CA]">
                              ({formatted.usdText})
                            </span>
                          </div>
                        </div>

                        {item.details.length > 0 && (
                          <ul className="text-xs text-[#A9B6CA] space-y-1 pl-3 border-l border-white/15">
                            {item.details.map((d, i) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}

                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-1 text-xs sm:text-sm text-[#DCEAFB]">
                    <div className="font-mono text-xs uppercase text-[#3FD9B4]">
                      {lang === 'ru' ? 'Срочность (Как быстро?):' : 'Urgency:'}
                    </div>
                    <div>• {calculation.urgencyLabel}</div>
                    {urgency !== 'normal' && calculation.rawOneTimeByn > 0 && (
                      <div className="text-xs text-[#A9B6CA] font-mono pt-1">
                        {lang === 'ru'
                          ? `Базовая сумма до наценки за срочность: ${calculation.rawOneTimeByn} BYN → после коэффициента и округления до 10: ${calculation.oneTimeByn} BYN`
                          : `Base one-time sum before urgency: ${calculation.rawOneTimeByn} BYN → after multiplier & rounding to 10: ${calculation.oneTimeByn} BYN`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Итоговые суммы и две кнопки: «Отправить расчёт как заявку» и «Скопировать расчёт» */}
                <div className="pt-6 border-t border-white/15 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-6 space-y-3">
                    <div>
                      <div className="text-xs text-[#A9B6CA]">
                        {lang === 'ru'
                          ? `Итоговая разовая сумма (округление до ${pricesData.roundTo} BYN):`
                          : `Total one-time amount (rounded to ${pricesData.roundTo} BYN):`}
                      </div>
                      <div className="text-3xl sm:text-4xl font-display font-bold text-white tabular-nums mt-0.5">
                        {formatBynUsd(calculation.oneTimeByn, lang).bynText}{' '}
                        <span className="text-lg font-normal text-[#3FCFE6]">
                          ({formatBynUsd(calculation.oneTimeByn, lang).usdText})
                        </span>
                      </div>
                    </div>

                    {calculation.monthlyByn > 0 && (
                      <div className="pt-2 border-t border-white/10">
                        <div className="text-xs text-[#3FD9B4]">
                          {lang === 'ru'
                            ? 'Ежемесячная оплата (Поддержка сайта — не меняется от срочности):'
                            : 'Monthly fee (Website maintenance — unaffected by urgency):'}
                        </div>
                        <div className="text-xl font-display font-bold text-white tabular-nums">
                          {formatBynUsd(calculation.monthlyByn, lang, true).bynText}{' '}
                          <span className="text-sm font-normal text-[#A9B6CA]">
                            ({formatBynUsd(calculation.monthlyByn, lang, true).usdText})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-6 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleSendAsLead}
                      className="w-full py-3.5 px-6 rounded-full bg-[#2E54F5] hover:bg-[#3A60F7] text-white font-medium text-sm sm:text-base inline-flex items-center justify-center gap-2.5 shadow-[0_12px_30px_rgba(46,84,245,0.45)] transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        {lang === 'ru'
                          ? 'Отправить расчёт как заявку'
                          : 'Send Estimate as Inquiry'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="w-full py-3 px-6 rounded-full bg-white/10 hover:bg-white/18 border border-white/20 text-white font-medium text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      {copiedSummary ? (
                        <>
                          <Check className="w-4 h-4 text-[#3FD9B4]" />
                          <span className="text-[#3FD9B4]">
                            {lang === 'ru'
                              ? 'Расчёт скопирован в буфер обмена!'
                              : 'Estimate copied to clipboard!'}
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
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* На шагах 2 и 3 внизу экрана закреплена тёмная плашка (.calc-bar) */}
      {(step === 2 || step === 3) && (
        <div className="calc-bar fixed bottom-0 left-0 right-0 z-40 py-3.5 px-4 sm:px-6 shadow-2xl">
          <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <div className="text-[11px] text-[#A9B6CA]">
                  {lang === 'ru' ? 'Разовая сумма:' : 'One-time total:'}
                </div>
                <div className="font-display font-bold text-lg sm:text-xl text-white tabular-nums">
                  {formatBynUsd(calculation.oneTimeByn, lang).bynText}{' '}
                  <span className="text-xs font-normal text-[#3FCFE6]">
                    ({formatBynUsd(calculation.oneTimeByn, lang).usdText})
                  </span>
                </div>
              </div>

              {calculation.monthlyByn > 0 && (
                <div className="border-l border-white/15 pl-5">
                  <div className="text-[11px] text-[#3FD9B4]">
                    {lang === 'ru' ? 'В месяц:' : 'Monthly:'}
                  </div>
                  <div className="font-display font-bold text-base sm:text-lg text-white tabular-nums">
                    {formatBynUsd(calculation.monthlyByn, lang, true).bynText}
                  </div>
                </div>
              )}

              {calculation.totalDays > 0 && (
                <div className="border-l border-white/15 pl-5 hidden sm:block">
                  <div className="text-[11px] text-[#A9B6CA]">
                    {lang === 'ru' ? 'Срок:' : 'Timeframe:'}
                  </div>
                  <div className="font-mono font-bold text-sm sm:text-base text-[#CDF26B] tabular-nums">
                    ~{calculation.totalDays} {lang === 'ru' ? 'дн.' : 'days'}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setStep(step === 2 ? 3 : 4)}
              className="px-5 py-2.5 rounded-full bg-[#2E54F5] hover:bg-[#3A60F7] text-white text-xs sm:text-sm font-medium inline-flex items-center gap-2 cursor-pointer"
            >
              <span>
                {step === 2
                  ? lang === 'ru'
                    ? 'Далее: Как быстро? →'
                    : 'Next: How Fast? →'
                  : lang === 'ru'
                  ? 'Посмотреть итог →'
                  : 'View Final Summary →'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
