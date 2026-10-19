import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Sliders,
  Zap,
  ArrowUpRight,
  Calculator,
  Crosshair,
  Download,
} from 'lucide-react';
import { Lang, ServiceItem, formatBynUsd } from '../data/servicesData';
import { downloadRoiPdfReport } from '../utils/pdfReportGenerator';
import { ToastVariant } from './Toast';

interface AutomationSuccessMetricProps {
  service: ServiceItem;
  lang: Lang;
  onSelectService?: (serviceId: string) => void;
  onSendRoiToLead?: (summaryText: string) => void;
  onNotify?: (title: string, description?: string, variant?: ToastVariant) => void;
}

interface PresetMetricConfig {
  defaultWeeklyHours: number;
  defaultHourlyRate: number;
  defaultReductionPct: number;
  tasksLabel: { ru: string; en: string };
  beforeAfterTasks: {
    stage: { ru: string; en: string };
    manualMin: number;
    automatedMin: number;
  }[];
}

interface RoiTimelinePoint {
  month: string;
  monthIndex: number;
  cumulativeHoursSaved: number;
  workdaysSaved: number;
  hourlyRateByn: number;
  cumulativeSavings: number;
  investment: number;
  netBalance: number;
  isBreakEvenReached: boolean;
  isFirstBreakEvenMonth: boolean;
  paybackMonths: number;
  remainingToBreakEvenByn: number;
  formulaExpression: string;
}

interface TaskStagePoint {
  name: string;
  manual: number;
  automated: number;
  savedMinPerWeek: number;
  savedHoursPerMonth: number;
  savedBynPerMonth: number;
  hourlyRateByn: number;
  stageReductionPct: number;
}

const SERVICE_METRIC_PRESETS: Record<string, PresetMetricConfig> = {
  'dannye': {
    defaultWeeklyHours: 12,
    defaultHourlyRate: 25,
    defaultReductionPct: 82,
    tasksLabel: {
      ru: 'Сбор данных с сайтов и сведение отчётов в таблицах',
      en: 'Web data collection and spreadsheet report consolidation',
    },
    beforeAfterTasks: [
      { stage: { ru: 'Сбор позиций', en: 'Data scraping' }, manualMin: 180, automatedMin: 15 },
      { stage: { ru: 'Очистка таблиц', en: 'Sheet cleanup' }, manualMin: 120, automatedMin: 20 },
      { stage: { ru: 'Сверка формул', en: 'Formula check' }, manualMin: 90, automatedMin: 10 },
      { stage: { ru: 'Сводный отчёт', en: 'Summary report' }, manualMin: 90, automatedMin: 15 },
    ],
  },
  'zakupki': {
    defaultWeeklyHours: 14,
    defaultHourlyRate: 30,
    defaultReductionPct: 78,
    tasksLabel: {
      ru: 'Сведение прайс-листов поставщиков и поиск лучших цен',
      en: 'Consolidating supplier price lists and finding best offers',
    },
    beforeAfterTasks: [
      { stage: { ru: 'Сбор прайсов', en: 'Price gathering' }, manualMin: 150, automatedMin: 25 },
      { stage: { ru: 'Сопоставление SKU', en: 'SKU matching' }, manualMin: 210, automatedMin: 30 },
      { stage: { ru: 'Сравнение цен', en: 'Price comparison' }, manualMin: 120, automatedMin: 15 },
      { stage: { ru: 'Отчёт закупщика', en: 'Buyer report' }, manualMin: 80, automatedMin: 15 },
    ],
  },
  'audit': {
    defaultWeeklyHours: 10,
    defaultHourlyRate: 30,
    defaultReductionPct: 68,
    tasksLabel: {
      ru: 'Ревизия счетов, подписок и узких мест в процессах',
      en: 'Auditing recurring bills, subscriptions, and process bottlenecks',
    },
    beforeAfterTasks: [
      { stage: { ru: 'Проверка счетов', en: 'Invoice audit' }, manualMin: 140, automatedMin: 35 },
      { stage: { ru: 'Поиск дублей', en: 'Duplicate check' }, manualMin: 110, automatedMin: 25 },
      { stage: { ru: 'Ручные сверки', en: 'Manual checks' }, manualMin: 130, automatedMin: 40 },
      { stage: { ru: 'План экономии', en: 'Savings plan' }, manualMin: 80, automatedMin: 25 },
    ],
  },
  'telegram-boty': {
    defaultWeeklyHours: 15,
    defaultHourlyRate: 22,
    defaultReductionPct: 76,
    tasksLabel: {
      ru: 'Приём заявок, ответы на частые вопросы и квалификация в Telegram',
      en: 'Lead intake, FAQ replies, and client qualification in Telegram',
    },
    beforeAfterTasks: [
      { stage: { ru: 'Ответы на FAQ', en: 'FAQ replies' }, manualMin: 200, automatedMin: 20 },
      { stage: { ru: 'Сбор контактов', en: 'Contact capture' }, manualMin: 140, automatedMin: 15 },
      { stage: { ru: 'Передача в CRM', en: 'CRM logging' }, manualMin: 110, automatedMin: 10 },
      { stage: { ru: 'Статус заказа', en: 'Order status' }, manualMin: 90, automatedMin: 15 },
    ],
  },
  'zayavki': {
    defaultWeeklyHours: 8,
    defaultHourlyRate: 22,
    defaultReductionPct: 88,
    tasksLabel: {
      ru: 'Фиксация обращений с сайта в таблицу и мгновенные уведомления',
      en: 'Logging website inquiries to spreadsheets with instant alerts',
    },
    beforeAfterTasks: [
      { stage: { ru: 'Проверка почты', en: 'Inbox checking' }, manualMin: 90, automatedMin: 5 },
      { stage: { ru: 'Перенос в таблицу', en: 'Sheet entry' }, manualMin: 120, automatedMin: 5 },
      { stage: { ru: 'Уведомление', en: 'Team alert' }, manualMin: 60, automatedMin: 5 },
      { stage: { ru: 'Контроль потерь', en: 'Loss prevention' }, manualMin: 70, automatedMin: 10 },
    ],
  },
};

/* Кастомная всплывающая подсказка Recharts для 6-месячного графика ROI */
const CustomRoiTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
  lang: Lang;
  packageName: string;
}> = ({ active, payload, lang, packageName }) => {
  if (!active || !payload || !payload.length) return null;

  const data: RoiTimelinePoint = payload[0].payload;
  const grossFormatted = formatBynUsd(data.cumulativeSavings, lang);
  const investFormatted = formatBynUsd(data.investment, lang);
  const netAbsFormatted = formatBynUsd(Math.abs(data.netBalance), lang);
  const remainingFormatted = formatBynUsd(data.remainingToBreakEvenByn, lang);

  return (
    <div
      style={{
        backgroundColor: 'rgba(7, 12, 22, 0.96)',
        backdropFilter: 'blur(16px)',
      }}
      className="rounded-2xl border border-[rgba(150,175,255,0.28)] shadow-[0_20px_50px_rgba(0,0,0,0.75)] p-4 text-xs text-[#E8EEF7] min-w-[285px] max-w-[345px] space-y-3"
    >
      {/* Шапка точки: период и статус окупаемости через разделитель · */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2.5">
        <div className="font-display font-bold text-sm text-white">
          {data.monthIndex === 0
            ? lang === 'ru'
              ? 'Старт внедрения (0 мес.)'
              : 'Implementation Start (Mo 0)'
            : lang === 'ru'
            ? `Итог за ${data.month}`
            : `Projection at ${data.month}`}
        </div>
        <span
          className={`font-mono text-[11px] tabular-nums ${
            data.isFirstBreakEvenMonth
              ? 'text-[#CDF26B] font-semibold'
              : data.isBreakEvenReached
              ? 'text-[#3FD9B4]'
              : 'text-[#3FCFE6]'
          }`}
        >
          {data.isFirstBreakEvenMonth
            ? lang === 'ru'
              ? '· Точка окупаемости'
              : '· Break-even point'
            : data.isBreakEvenReached
            ? lang === 'ru'
              ? '· Окупилось (в плюсе)'
              : '· Break-even reached'
            : lang === 'ru'
            ? '· Этап окупаемости'
            : '· Recovering cost'}
        </span>
      </div>

      {/* Индикатор точного срока окупаемости на первом месяце выхода в плюс */}
      {data.isFirstBreakEvenMonth && (
        <div className="rounded-xl bg-[#CDF26B]/12 border border-[#CDF26B]/40 px-3 py-2 flex items-center justify-between gap-2 text-[11px] font-mono text-[#CDF26B]">
          <span>
            {lang === 'ru'
              ? 'Момент выхода в чистый плюс:'
              : 'Break-even threshold crossed:'}
          </span>
          <strong className="tabular-nums">
            ~{data.paybackMonths} {lang === 'ru' ? 'мес.' : 'mo'}
          </strong>
        </div>
      )}

      {/* Высвобожденное время (часы и 8-часовые рабочие дни) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[#A9B6CA]">
          <span>
            {lang === 'ru' ? 'Высвобождено времени:' : 'Cumulative time saved:'}
          </span>
          <span className="font-mono font-bold text-white tabular-nums">
            {data.cumulativeHoursSaved} {lang === 'ru' ? 'ч' : 'hrs'}{' '}
            <span className="text-[#3FD9B4] font-normal">
              ({data.workdaysSaved} {lang === 'ru' ? 'раб. дн.' : 'workdays'})
            </span>
          </span>
        </div>

        {/* Точная формула расчёта экономии: Часы × Ставка − Стоимость пакета */}
        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-2.5 space-y-1.5 font-mono">
          <div className="text-[10px] uppercase tracking-wider text-[#A9B6CA] flex items-center justify-between">
            <span>
              {lang === 'ru' ? 'Формула расчёта точки' : 'Point Calculation Formula'}
            </span>
            <span className="text-[#3FCFE6]">{packageName}</span>
          </div>
          <div className="text-[11px] text-[#DCEAFB] tabular-nums leading-relaxed">
            {data.formulaExpression}
          </div>
          <div className="pt-1 border-t border-white/10 flex items-center justify-between text-[11px] tabular-nums">
            <span className="text-[#A9B6CA]">
              {lang === 'ru' ? 'Валовая экономия:' : 'Gross time value:'}
            </span>
            <span className="text-[#3FD9B4] font-semibold">
              {grossFormatted.bynText} ({grossFormatted.usdText})
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] tabular-nums">
            <span className="text-[#A9B6CA]">
              {lang === 'ru' ? 'Стоимость пакета:' : 'Package cost:'}
            </span>
            <span className="text-[#DCEAFB]">
              −{investFormatted.bynText} ({investFormatted.usdText})
            </span>
          </div>
        </div>
      </div>

      {/* Итоговый чистый баланс точки в BYN и ~USD + остаток до окупаемости */}
      <div className="pt-2 border-t border-white/10 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[#A9B6CA]">
            {lang === 'ru' ? 'Чистый баланс (ROI):' : 'Net ROI Balance:'}
          </span>
          <span
            className={`font-display font-bold text-sm tabular-nums ${
              data.netBalance >= 0 ? 'text-[#3FD9B4]' : 'text-[#DCEAFB]'
            }`}
          >
            {data.netBalance >= 0 ? '+' : '−'}
            {netAbsFormatted.bynText}{' '}
            <span className="text-xs font-mono opacity-80">
              ({netAbsFormatted.usdText})
            </span>
          </span>
        </div>

        {!data.isBreakEvenReached && data.remainingToBreakEvenByn > 0 && (
          <div className="flex items-center justify-between text-[11px] font-mono text-[#A9B6CA] tabular-nums">
            <span>
              {lang === 'ru' ? 'До полной окупаемости:' : 'Left to break-even:'}
            </span>
            <span className="text-[#3FCFE6]">
              {remainingFormatted.bynText} ({remainingFormatted.usdText})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

/* Кастомная всплывающая подсказка Recharts для графика сокращения задач (До / После) */
const CustomTaskTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
  lang: Lang;
}> = ({ active, payload, lang }) => {
  if (!active || !payload || !payload.length) return null;

  const data: TaskStagePoint = payload[0].payload;
  const stageSavingsFormatted = formatBynUsd(data.savedBynPerMonth, lang);

  return (
    <div
      style={{
        backgroundColor: 'rgba(7, 12, 22, 0.96)',
        backdropFilter: 'blur(16px)',
      }}
      className="rounded-2xl border border-[rgba(63,217,180,0.3)] shadow-[0_20px_50px_rgba(0,0,0,0.75)] p-4 text-xs text-[#E8EEF7] min-w-[270px] max-w-[330px] space-y-3"
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
        <span className="font-display font-bold text-sm text-white">
          {data.name}
        </span>
        <span className="font-mono text-[11px] text-[#3FD9B4] tabular-nums">
          · −{data.stageReductionPct}% {lang === 'ru' ? 'времени' : 'time'}
        </span>
      </div>

      <div className="space-y-1.5 font-mono text-[11px] tabular-nums">
        <div className="flex items-center justify-between text-[#A9B6CA]">
          <span>{lang === 'ru' ? 'До (вручную):' : 'Before (manual):'}</span>
          <span className="text-white">
            {data.manual} {lang === 'ru' ? 'мин / нед' : 'min / wk'}
          </span>
        </div>
        <div className="flex items-center justify-between text-[#A9B6CA]">
          <span>
            {lang === 'ru' ? 'После автоматизации:' : 'After automation:'}
          </span>
          <span className="text-[#3FD9B4] font-bold">
            {data.automated} {lang === 'ru' ? 'мин / нед' : 'min / wk'}
          </span>
        </div>
        <div className="flex items-center justify-between text-[#DCEAFB] pt-1 border-t border-white/10">
          <span>
            {lang === 'ru' ? 'Чистая экономия этапа:' : 'Stage time saved:'}
          </span>
          <span className="text-[#3FCFE6] font-bold">
            {data.savedMinPerWeek} {lang === 'ru' ? 'мин/нед' : 'min/wk'} (~
            {data.savedHoursPerMonth} {lang === 'ru' ? 'ч/мес' : 'hrs/mo'})
          </span>
        </div>
      </div>

      <div className="rounded-xl bg-white/[0.04] border border-white/10 p-2.5 font-mono text-[11px] tabular-nums space-y-1">
        <div className="text-[10px] uppercase tracking-wider text-[#A9B6CA]">
          {lang === 'ru'
            ? 'Расчёт выгоды на этом этапе за месяц'
            : 'Monthly Stage Savings Formula'}
        </div>
        <div className="text-[#DCEAFB]">
          {data.savedHoursPerMonth} {lang === 'ru' ? 'ч/мес' : 'hrs/mo'} ×{' '}
          {data.hourlyRateByn} BYN/{lang === 'ru' ? 'ч' : 'hr'} ={' '}
          <strong className="text-[#3FD9B4]">
            {stageSavingsFormatted.bynText}
          </strong>{' '}
          ({stageSavingsFormatted.usdText})
        </div>
      </div>
    </div>
  );
};

export const AutomationSuccessMetric: React.FC<AutomationSuccessMetricProps> = ({
  service,
  lang,
  onSendRoiToLead,
  onNotify,
}) => {
  const preset =
    SERVICE_METRIC_PRESETS[service.id] || SERVICE_METRIC_PRESETS['dannye'];

  const [selectedPkgIndex, setSelectedPkgIndex] = useState<number>(0);
  const [weeklyHours, setWeeklyHours] = useState<number>(preset.defaultWeeklyHours);
  const [hourlyRateByn, setHourlyRateByn] = useState<number>(preset.defaultHourlyRate);
  const [reductionPct, setReductionPct] = useState<number>(preset.defaultReductionPct);
  const [chartTab, setChartTab] = useState<'roi' | 'tasks'>('roi');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Сброс пресетов при переключении услуги
  useEffect(() => {
    const nextPreset =
      SERVICE_METRIC_PRESETS[service.id] || SERVICE_METRIC_PRESETS['dannye'];
    setSelectedPkgIndex(0);
    setWeeklyHours(nextPreset.defaultWeeklyHours);
    setHourlyRateByn(nextPreset.defaultHourlyRate);
    setReductionPct(nextPreset.defaultReductionPct);
  }, [service.id]);

  const activePackage =
    service.packages[selectedPkgIndex] || service.packages[0];
  const investmentByn = activePackage ? activePackage.priceByn : service.basePriceByn;

  // Расчёт показателей экономии времени и окупаемости (ROI) за 6 месяцев
  const metrics = useMemo(() => {
    const weeksPerMonth = 4.33;
    const savedHoursPerWeek = +(weeklyHours * (reductionPct / 100)).toFixed(1);
    const remainingHoursPerWeek = +(weeklyHours - savedHoursPerWeek).toFixed(1);
    const savedHoursPerMonth = Math.round(savedHoursPerWeek * weeksPerMonth);
    const savedBynPerMonth = Math.round(savedHoursPerMonth * hourlyRateByn);
    const sixMonthGrossSavingsByn = savedBynPerMonth * 6;
    const sixMonthNetBenefitByn = sixMonthGrossSavingsByn - investmentByn;
    const roiPercent =
      investmentByn > 0
        ? Math.round((sixMonthNetBenefitByn / investmentByn) * 100)
        : 0;
    const paybackMonths =
      savedBynPerMonth > 0
        ? +(investmentByn / savedBynPerMonth).toFixed(1)
        : 0;

    let firstBreakEvenFound = false;

    // Помесячный ряд (M0..M6) с предвычисленной формулой и флагом первого месяца окупаемости
    const timelineData: RoiTimelinePoint[] = Array.from(
      { length: 7 },
      (_, monthIdx) => {
        const cumulativeHoursSaved = Math.round(savedHoursPerMonth * monthIdx);
        const workdaysSaved = +(cumulativeHoursSaved / 8).toFixed(1);
        const cumulativeSavings = Math.round(
          cumulativeHoursSaved * hourlyRateByn
        );
        const netBalance = cumulativeSavings - investmentByn;
        const isBreakEvenReached = monthIdx > 0 && netBalance >= 0;
        const isFirstBreakEvenMonth =
          isBreakEvenReached && !firstBreakEvenFound;

        if (isFirstBreakEvenMonth) {
          firstBreakEvenFound = true;
        }

        const remainingToBreakEvenByn = Math.max(
          0,
          investmentByn - cumulativeSavings
        );

        const formulaExpression =
          lang === 'ru'
            ? `${cumulativeHoursSaved} ч × ${hourlyRateByn} BYN/ч − ${investmentByn} BYN = ${
                netBalance >= 0 ? '+' : '−'
              }${Math.abs(netBalance)} BYN`
            : `${cumulativeHoursSaved} hrs × ${hourlyRateByn} BYN/hr − ${investmentByn} BYN = ${
                netBalance >= 0 ? '+' : '−'
              }${Math.abs(netBalance)} BYN`;

        return {
          month:
            monthIdx === 0
              ? lang === 'ru'
                ? 'Старт'
                : 'Start'
              : lang === 'ru'
              ? `${monthIdx} мес.`
              : `Mo ${monthIdx}`,
          monthIndex: monthIdx,
          cumulativeHoursSaved,
          workdaysSaved,
          hourlyRateByn,
          cumulativeSavings,
          investment: investmentByn,
          netBalance,
          isBreakEvenReached,
          isFirstBreakEvenMonth,
          paybackMonths,
          remainingToBreakEvenByn,
          formulaExpression,
        };
      }
    );

    const breakEvenPoint =
      timelineData.find((pt) => pt.isFirstBreakEvenMonth) || null;

    // Данные сокращения времени по операциям (в минутах в неделю и часах в месяц)
    const scaleFactor = weeklyHours / preset.defaultWeeklyHours;
    const tasksChartData: TaskStagePoint[] = preset.beforeAfterTasks.map(
      (item) => {
        const manual = Math.round(item.manualMin * scaleFactor);
        const automated = Math.max(
          5,
          Math.round(manual * (1 - reductionPct / 100))
        );
        const savedMinPerWeek = Math.max(0, manual - automated);
        const savedHoursPerMonthStage = +(
          (savedMinPerWeek * weeksPerMonth) /
          60
        ).toFixed(1);
        const savedBynPerMonthStage = Math.round(
          savedHoursPerMonthStage * hourlyRateByn
        );
        const stageReductionPct =
          manual > 0 ? Math.round((savedMinPerWeek / manual) * 100) : 0;

        return {
          name: item.stage[lang],
          manual,
          automated,
          savedMinPerWeek,
          savedHoursPerMonth: savedHoursPerMonthStage,
          savedBynPerMonth: savedBynPerMonthStage,
          hourlyRateByn,
          stageReductionPct,
        };
      }
    );

    return {
      savedHoursPerWeek,
      remainingHoursPerWeek,
      savedHoursPerMonth,
      savedBynPerMonth,
      sixMonthGrossSavingsByn,
      sixMonthNetBenefitByn,
      roiPercent,
      paybackMonths,
      timelineData,
      breakEvenPoint,
      tasksChartData,
    };
  }, [
    weeklyHours,
    hourlyRateByn,
    reductionPct,
    investmentByn,
    lang,
    preset,
  ]);

  const netFormatted = formatBynUsd(
    Math.max(0, metrics.sixMonthNetBenefitByn),
    lang
  );
  const monthlySavingsFormatted = formatBynUsd(metrics.savedBynPerMonth, lang);
  const investmentFormatted = formatBynUsd(investmentByn, lang);

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const fileName = await downloadRoiPdfReport({
        service,
        packageName: activePackage.name[lang],
        investmentByn,
        weeklyHours,
        hourlyRateByn,
        reductionPct,
        savedHoursPerWeek: metrics.savedHoursPerWeek,
        savedHoursPerMonth: metrics.savedHoursPerMonth,
        savedBynPerMonth: metrics.savedBynPerMonth,
        sixMonthGrossSavingsByn: metrics.sixMonthGrossSavingsByn,
        sixMonthNetBenefitByn: metrics.sixMonthNetBenefitByn,
        roiPercent: metrics.roiPercent,
        paybackMonths: metrics.paybackMonths,
        timelineData: metrics.timelineData,
        breakEvenPoint: metrics.breakEvenPoint,
        tasksChartData: metrics.tasksChartData,
        lang,
      });

      if (onNotify) {
        onNotify(
          lang === 'ru'
            ? 'PDF-отчёт успешно сформирован'
            : 'PDF report downloaded',
          lang === 'ru'
            ? `Файл ${fileName} (светлый печатный бланк A4 с графиком ROI и таблицами)`
            : `Saved ${fileName} (A4 print-ready ROI report)`,
          'success'
        );
      }
    } catch {
      if (onNotify) {
        onNotify(
          lang === 'ru'
            ? 'Не удалось сформировать PDF'
            : 'Could not generate PDF',
          lang === 'ru'
            ? 'Попробуйте ещё раз через секунду'
            : 'Please try again in a moment',
          'error'
        );
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6" id="success-metric-roi">
      {/* Заголовок секции Success Metric */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#2E54F5]">
            <TrendingUp className="w-4 h-4" />
            <span>
              {lang === 'ru'
                ? 'SUCCESS METRIC · ПРОГНОЗ ОКУПАЕМОСТИ (ROI)'
                : 'SUCCESS METRIC · PROJECTED ROI & TIME SAVINGS'}
            </span>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl">
            {lang === 'ru'
              ? 'Экономия времени, сокращение рутины и возврат инвестиций'
              : 'Time savings, task reduction, and projected return on investment'}
          </h2>
          <p className="text-sm opacity-80 max-w-2xl">
            {preset.tasksLabel[lang]}
          </p>
        </div>

        {/* Переключатель режима графика + быстрая кнопка «Скачать PDF-отчёт» */}
        <div className="flex flex-wrap items-center gap-2.5 self-start">
          <div className="inline-flex items-center p-1 rounded-full border border-current/15 bg-current/[0.03]">
            <button
              type="button"
              onClick={() => setChartTab('roi')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                chartTab === 'roi'
                  ? 'bg-[#2E54F5] text-white'
                  : 'opacity-75 hover:opacity-100'
              }`}
            >
              {lang === 'ru' ? 'График окупаемости (6 мес.)' : '6-Month ROI Projection'}
            </button>
            <button
              type="button"
              onClick={() => setChartTab('tasks')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                chartTab === 'tasks'
                  ? 'bg-[#2E54F5] text-white'
                  : 'opacity-75 hover:opacity-100'
              }`}
            >
              {lang === 'ru' ? 'Сокращение задач (До / После)' : 'Task Reduction (Before / After)'}
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#2E54F5] text-[#2E54F5] hover:bg-[#2E54F5] hover:text-white text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer disabled:opacity-60"
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {isGeneratingPdf
                ? lang === 'ru'
                  ? 'Формируем PDF…'
                  : 'Generating PDF…'
                : lang === 'ru'
                ? 'Скачать PDF-отчёт'
                : 'Download Report'}
            </span>
          </button>
        </div>
      </div>

      {/* 4 карточки ключевых метрик (KPI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono opacity-70">
            <span>{lang === 'ru' ? 'ЭКОНОМИЯ ВРЕМЕНИ' : 'TIME SAVED'}</span>
            <Clock className="w-4 h-4 text-[#2E54F5]" />
          </div>
          <div className="font-display font-bold text-2xl sm:text-3xl tabular-nums">
            {metrics.savedHoursPerMonth}{' '}
            <span className="text-base font-normal opacity-80">
              {lang === 'ru' ? 'ч / мес' : 'hrs / mo'}
            </span>
          </div>
          <div className="text-xs opacity-75 font-mono tabular-nums">
            {lang === 'ru'
              ? `~${metrics.savedHoursPerWeek} ч/нед · ${(
                  metrics.savedHoursPerMonth / 8
                ).toFixed(1)} раб. дн./мес`
              : `~${metrics.savedHoursPerWeek} hrs/wk · ${(
                  metrics.savedHoursPerMonth / 8
                ).toFixed(1)} workdays/mo`}
          </div>
        </div>

        <div className="glass-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono opacity-70">
            <span>{lang === 'ru' ? 'СОКРАЩЕНИЕ РУТИНЫ' : 'TASK REDUCTION'}</span>
            <Zap className="w-4 h-4 text-[#0E9F7E]" />
          </div>
          <div className="font-display font-bold text-2xl sm:text-3xl text-[#0E9F7E] dark:text-[#3FD9B4] tabular-nums">
            −{reductionPct}%
          </div>
          <div className="text-xs opacity-75 font-mono tabular-nums">
            {lang === 'ru'
              ? `Остаётся ~${metrics.remainingHoursPerWeek} ч/нед контроля`
              : `Only ~${metrics.remainingHoursPerWeek} hrs/wk supervision left`}
          </div>
        </div>

        <div className="glass-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono opacity-70">
            <span>{lang === 'ru' ? 'ОКУПАЕМОСТЬ' : 'BREAK-EVEN POINT'}</span>
            <CheckCircle2 className="w-4 h-4 text-[#2E54F5]" />
          </div>
          <div className="font-display font-bold text-2xl sm:text-3xl tabular-nums">
            {metrics.paybackMonths <= 0.3
              ? lang === 'ru'
                ? '< 2 нед.'
                : '< 2 wks'
              : `${metrics.paybackMonths} ${lang === 'ru' ? 'мес.' : 'mo'}`}
          </div>
          <div className="text-xs opacity-75 font-mono tabular-nums">
            {lang === 'ru'
              ? `Выгода: ${monthlySavingsFormatted.bynText}/мес (${monthlySavingsFormatted.usdText})`
              : `Savings: ${monthlySavingsFormatted.bynText}/mo (${monthlySavingsFormatted.usdText})`}
          </div>
        </div>

        <div className="glass-card p-5 space-y-1.5 ring-1 ring-[#2E54F5]/30">
          <div className="flex items-center justify-between text-xs font-mono text-[#2E54F5] font-bold">
            <span>{lang === 'ru' ? 'ЧИСТЫЙ ЭФФЕКТ ЗА 6 МЕС.' : '6-MO NET BENEFIT'}</span>
            <span>
              ROI {metrics.roiPercent >= 0 ? `+${metrics.roiPercent}%` : `${metrics.roiPercent}%`}
            </span>
          </div>
          <div className="font-display font-bold text-2xl sm:text-3xl text-[#2E54F5] tabular-nums">
            {metrics.sixMonthNetBenefitByn >= 0 ? '+' : '−'}
            {netFormatted.bynText}
          </div>
          <div className="text-xs font-mono opacity-75 tabular-nums">
            {netFormatted.usdText}{' '}
            {lang === 'ru' ? 'после вычета разработки' : 'net after implementation'}
          </div>
        </div>
      </div>

      {/* Основная панель: Настройки параметров слева + График Recharts справа */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Левая колонка: Интерактивные параметры расчёта */}
        <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between gap-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-current/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#2E54F5] font-bold">
                <Sliders className="w-4 h-4" />
                <span>
                  {lang === 'ru'
                    ? 'Вводные вашей задачи'
                    : 'Your Workflow Parameters'}
                </span>
              </div>
              <span className="text-xs font-mono opacity-65">
                {service.title[lang]}
              </span>
            </div>

            {/* Выбор пакета услуги для точной стоимости внедрения */}
            {service.packages.length > 1 && (
              <div className="space-y-2">
                <label className="block text-xs font-medium opacity-80">
                  {lang === 'ru'
                    ? 'Пакет внедрения (стоимость разработки):'
                    : 'Implementation package (cost):'}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {service.packages.map((pkg, idx) => {
                    const isSelected = idx === selectedPkgIndex;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPkgIndex(idx)}
                        className={`px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2 text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#2E54F5] bg-[#2E54F5]/10 font-semibold'
                            : 'border-current/15 hover:border-[#2E54F5]/50 opacity-80'
                        }`}
                      >
                        <span className="truncate">{pkg.name[lang]}</span>
                        <span className="font-mono tabular-nums shrink-0 text-[#2E54F5]">
                          {pkg.priceByn} BYN
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ползунок 1: Часов ручной рутины в неделю */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium">
                  {lang === 'ru'
                    ? 'Ручная работа сейчас (ч/нед):'
                    : 'Current manual work (hrs/wk):'}
                </span>
                <span className="font-mono font-bold text-[#2E54F5] tabular-nums">
                  {weeklyHours} {lang === 'ru' ? 'ч / нед' : 'hrs / wk'}
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={40}
                step={1}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full accent-[#2E54F5] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono opacity-60">
                <span>2 {lang === 'ru' ? 'ч/нед' : 'h/wk'}</span>
                <span>20 {lang === 'ru' ? 'ч/нед' : 'h/wk'}</span>
                <span>40 {lang === 'ru' ? 'ч/нед' : 'h/wk'}</span>
              </div>
            </div>

            {/* Ползунок 2: Стоимость часа работы сотрудника */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium">
                  {lang === 'ru'
                    ? 'Оценка часа времени (BYN/ч):'
                    : 'Hourly time value (BYN/hr):'}
                </span>
                <span className="font-mono font-bold text-[#2E54F5] tabular-nums">
                  {hourlyRateByn} BYN/{lang === 'ru' ? 'ч' : 'hr'}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={80}
                step={5}
                value={hourlyRateByn}
                onChange={(e) => setHourlyRateByn(Number(e.target.value))}
                className="w-full accent-[#2E54F5] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono opacity-60">
                <span>10 BYN</span>
                <span>45 BYN</span>
                <span>80 BYN</span>
              </div>
            </div>

            {/* Ползунок 3: Доля автоматизируемых ручных задач */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium">
                  {lang === 'ru'
                    ? 'Сокращение ручных операций:'
                    : 'Manual task reduction:'}
                </span>
                <span className="font-mono font-bold text-[#0E9F7E] dark:text-[#3FD9B4] tabular-nums">
                  −{reductionPct}%
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={95}
                step={5}
                value={reductionPct}
                onChange={(e) => setReductionPct(Number(e.target.value))}
                className="w-full accent-[#2E54F5] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono opacity-60">
                <span>40%</span>
                <span>70%</span>
                <span>95%</span>
              </div>
            </div>
          </div>

          {/* Итог и кнопка передачи расчёта ROI в заявку */}
          <div className="pt-4 border-t border-current/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="opacity-75">
                {lang === 'ru' ? 'Формула за 1 мес.:' : '1-Month formula:'}
              </span>
              <span className="font-mono tabular-nums text-[#2E54F5]">
                {metrics.savedHoursPerMonth} {lang === 'ru' ? 'ч' : 'h'} × {hourlyRateByn} BYN ={' '}
                <strong>{monthlySavingsFormatted.bynText}</strong>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="opacity-75">
                {lang === 'ru' ? 'Стоимость внедрения:' : 'Implementation cost:'}
              </span>
              <span className="font-mono font-bold tabular-nums">
                {investmentFormatted.bynText} ({investmentFormatted.usdText})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="w-full py-2.5 px-4 rounded-full border border-[#2E54F5] text-[#2E54F5] hover:bg-[#2E54F5] hover:text-white text-xs font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer disabled:opacity-60"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isGeneratingPdf
                    ? lang === 'ru'
                      ? 'Формируем PDF…'
                      : 'Generating PDF…'
                    : lang === 'ru'
                    ? 'Скачать PDF-отчёт'
                    : 'Download Report'}
                </span>
              </button>

              {onSendRoiToLead && (
                <button
                  type="button"
                  onClick={() => {
                    const summary =
                      lang === 'ru'
                        ? `[Прогноз ROI — ${service.title.ru}]\nПакет: ${activePackage.name.ru} (${investmentFormatted.fullText})\nТекущие затраты времени: ${weeklyHours} ч/нед по ${hourlyRateByn} BYN/ч\nСокращение рутины: -${reductionPct}% (экономия ~${metrics.savedHoursPerMonth} ч/мес = ${monthlySavingsFormatted.bynText}/мес)\nОкупаемость: ~${metrics.paybackMonths} мес. · Чистая выгода за 6 мес.: +${netFormatted.fullText}`
                        : `[Projected ROI — ${service.title.en}]\nPackage: ${activePackage.name.en} (${investmentFormatted.fullText})\nCurrent manual load: ${weeklyHours} hrs/wk at ${hourlyRateByn} BYN/hr\nTask reduction: -${reductionPct}% (saving ~${metrics.savedHoursPerMonth} hrs/mo = ${monthlySavingsFormatted.bynText}/mo)\nPayback: ~${metrics.paybackMonths} mo · 6-Month Net Benefit: +${netFormatted.fullText}`;
                    onSendRoiToLead(summary);
                  }}
                  className="w-full py-2.5 px-4 rounded-full bg-[#2E54F5] hover:bg-[#1E40D8] text-white text-xs font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                >
                  <span>
                    {lang === 'ru'
                      ? 'Прикрепить к заявке'
                      : 'Attach to Inquiry'}
                  </span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Правая колонка: Визуализация Recharts в тёмной стеклянной карточке (.on-deep) */}
        <div className="lg:col-span-7 on-deep rounded-3xl p-6 sm:p-7 flex flex-col justify-between border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#3FD9B4] flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" />
                <span>
                  {chartTab === 'roi'
                    ? lang === 'ru'
                      ? 'НАКОПИТЕЛЬНАЯ ЭКОНОМИЯ VS ЗАТРАТЫ НА ВНЕДРЕНИЕ (BYN)'
                      : 'CUMULATIVE SAVINGS VS IMPLEMENTATION COST (BYN)'
                    : lang === 'ru'
                    ? 'ВРЕМЯ НА ТИПОВЫЕ ОПЕРАЦИИ В НЕДЕЛЮ (МИНУТ ДО И ПОСЛЕ)'
                    : 'WEEKLY TIME PER WORKFLOW STAGE (MINUTES BEFORE VS AFTER)'}
                </span>
              </div>
              <div className="text-xs sm:text-sm text-[#DCEAFB] mt-1">
                {chartTab === 'roi'
                  ? metrics.breakEvenPoint
                    ? lang === 'ru'
                      ? `Перекрестие отмечает выход в плюс на точке «${metrics.breakEvenPoint.month}» (окупаемость ~${metrics.paybackMonths} мес.)`
                      : `Crosshair marks break-even at "${metrics.breakEvenPoint.month}" (payback ~${metrics.paybackMonths} mo)`
                    : lang === 'ru'
                    ? `При текущих параметрах окупаемость наступит на ~${metrics.paybackMonths} мес. (за пределами 6-месячного окна)`
                    : `At current settings, break-even occurs at ~${metrics.paybackMonths} mo (beyond the 6-month window)`
                  : lang === 'ru'
                  ? 'Наведите на столбец этапа, чтобы увидеть расчёт экономии минут в неделю и BYN в месяц'
                  : 'Hover over any stage bar to see weekly minutes saved and monthly BYN (~USD) value'}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3.5 text-xs font-mono shrink-0">
              {chartTab === 'roi' ? (
                <>
                  <span className="flex items-center gap-1.5 text-[#3FD9B4]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3FD9B4]" />
                    {lang === 'ru' ? 'Экономия' : 'Savings'}
                  </span>
                  <span className="flex items-center gap-1.5 text-[#3FCFE6]">
                    <span className="w-2.5 h-0.5 bg-[#3FCFE6]" />
                    {lang === 'ru' ? 'Внедрение' : 'Cost'}
                  </span>
                  <span className="flex items-center gap-1.5 text-[#CDF26B]">
                    <Crosshair className="w-3.5 h-3.5 text-[#CDF26B]" />
                    {lang === 'ru' ? 'Окупаемость' : 'Break-even'}
                  </span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1.5 text-[#A9B6CA]">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#4A5E80]" />
                    {lang === 'ru' ? 'Вручную (мин)' : 'Manual (min)'}
                  </span>
                  <span className="flex items-center gap-1.5 text-[#3FD9B4]">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#3FD9B4]" />
                    {lang === 'ru' ? 'Автоматизация' : 'Automated'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Область графика Recharts с перекрестием окупаемости и кастомными подсказками */}
          <div className="h-[310px] sm:h-[340px] w-full pt-4">
            {chartTab === 'roi' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={metrics.timelineData}
                  margin={{ top: 22, right: 20, left: 0, bottom: 4 }}
                >
                  <defs>
                    <linearGradient id="roiSavingsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3FD9B4" stopOpacity={0.44} />
                      <stop offset="95%" stopColor="#2E54F5" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.08)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="#A9B6CA"
                    tick={{ fill: '#A9B6CA', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.15)' }}
                  />
                  <YAxis
                    stroke="#A9B6CA"
                    tick={{ fill: '#A9B6CA', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.15)' }}
                    tickFormatter={(val) => `${val}`}
                  />
                  <Tooltip
                    cursor={{
                      stroke: 'rgba(63, 207, 230, 0.45)',
                      strokeWidth: 1.5,
                      strokeDasharray: '4 4',
                    }}
                    content={
                      <CustomRoiTooltip
                        lang={lang}
                        packageName={activePackage.name[lang]}
                      />
                    }
                  />

                  {/* Горизонтальная линия перекрестия: порог стоимости внедрения */}
                  <ReferenceLine
                    y={investmentByn}
                    stroke="#3FCFE6"
                    strokeDasharray="5 5"
                    strokeWidth={1.75}
                    label={{
                      value:
                        lang === 'ru'
                          ? `Внедрение: ${investmentByn} BYN`
                          : `Cost: ${investmentByn} BYN`,
                      position: 'insideTopRight',
                      fill: '#3FCFE6',
                      fontSize: 11,
                    }}
                  />

                  {/* Вертикальная линия перекрестия на первом месяце выхода в плюс */}
                  {metrics.breakEvenPoint && (
                    <ReferenceLine
                      x={metrics.breakEvenPoint.month}
                      stroke="#CDF26B"
                      strokeDasharray="4 4"
                      strokeWidth={1.75}
                      label={{
                        value:
                          lang === 'ru'
                            ? `Окупаемость · ~${metrics.paybackMonths} мес.`
                            : `Break-even · ~${metrics.paybackMonths} mo`,
                        position: 'top',
                        fill: '#CDF26B',
                        fontSize: 11,
                      }}
                    />
                  )}

                  {/* Светящийся узел пересечения перекрестия на уровне стоимости пакета */}
                  {metrics.breakEvenPoint && (
                    <ReferenceDot
                      x={metrics.breakEvenPoint.month}
                      y={investmentByn}
                      r={4}
                      fill="#070C16"
                      stroke="#3FCFE6"
                      strokeWidth={2}
                    />
                  )}

                  {/* Главный светящийся маркер точки окупаемости на кривой накопленной экономии */}
                  {metrics.breakEvenPoint && (
                    <ReferenceDot
                      x={metrics.breakEvenPoint.month}
                      y={metrics.breakEvenPoint.cumulativeSavings}
                      r={8}
                      fill="#CDF26B"
                      stroke="#FFFFFF"
                      strokeWidth={2.5}
                      shape={(props: any) => {
                        const { cx, cy } = props;
                        if (typeof cx !== 'number' || typeof cy !== 'number') {
                          return <g />;
                        }
                        return (
                          <g>
                            <circle
                              cx={cx}
                              cy={cy}
                              r={13}
                              fill="rgba(205, 242, 107, 0.22)"
                            />
                            <circle
                              cx={cx}
                              cy={cy}
                              r={8.5}
                              fill="rgba(63, 217, 180, 0.35)"
                              stroke="#CDF26B"
                              strokeWidth={1.5}
                            />
                            <circle
                              cx={cx}
                              cy={cy}
                              r={5}
                              fill="#CDF26B"
                              stroke="#070C16"
                              strokeWidth={1.5}
                            />
                          </g>
                        );
                      }}
                    />
                  )}

                  <Area
                    type="monotone"
                    dataKey="cumulativeSavings"
                    stroke="#3FD9B4"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#roiSavingsGrad)"
                    dot={(dotProps: any) => {
                      const { cx, cy, payload } = dotProps;
                      if (typeof cx !== 'number' || typeof cy !== 'number') {
                        return <g key={dotProps.key} />;
                      }
                      if (payload?.isFirstBreakEvenMonth) {
                        return (
                          <circle
                            key={dotProps.key}
                            cx={cx}
                            cy={cy}
                            r={5}
                            fill="#CDF26B"
                            stroke="#070C16"
                            strokeWidth={2}
                          />
                        );
                      }
                      return (
                        <circle
                          key={dotProps.key}
                          cx={cx}
                          cy={cy}
                          r={4}
                          fill="#070C16"
                          stroke="#3FD9B4"
                          strokeWidth={2}
                        />
                      );
                    }}
                    activeDot={{
                      r: 6,
                      fill: '#3FD9B4',
                      stroke: '#FFFFFF',
                      strokeWidth: 2,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="netBalance"
                    stroke="#2E54F5"
                    strokeWidth={2}
                    fillOpacity={0}
                    dot={{
                      r: 3,
                      fill: '#070C16',
                      stroke: '#2E54F5',
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 5,
                      fill: '#2E54F5',
                      stroke: '#FFFFFF',
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.tasksChartData}
                  margin={{ top: 14, right: 18, left: 0, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.08)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#A9B6CA"
                    tick={{ fill: '#A9B6CA', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.15)' }}
                  />
                  <YAxis
                    stroke="#A9B6CA"
                    tick={{ fill: '#A9B6CA', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.15)' }}
                    unit={lang === 'ru' ? ' м' : 'm'}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                    content={<CustomTaskTooltip lang={lang} />}
                  />
                  <Bar
                    dataKey="manual"
                    fill="#4A5E80"
                    radius={[6, 6, 0, 0]}
                    name="manual"
                  />
                  <Bar
                    dataKey="automated"
                    fill="#3FD9B4"
                    radius={[6, 6, 0, 0]}
                    name="automated"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Нижняя строка резюме под графиком */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-[#A9B6CA]">
            <span>
              {lang === 'ru'
                ? `За 6 месяцев высвобождается ~${metrics.savedHoursPerMonth * 6} рабочих часов (${(
                    (metrics.savedHoursPerMonth * 6) /
                    8
                  ).toFixed(1)} полных рабочих дней по 8 ч).`
                : `Over 6 months, ~${metrics.savedHoursPerMonth * 6} work hours (${(
                    (metrics.savedHoursPerMonth * 6) /
                    8
                  ).toFixed(1)} full 8-hr workdays) are saved.`}
            </span>
            <span className="font-mono text-[#3FD9B4] tabular-nums">
              {lang === 'ru'
                ? `Валовая экономия за 6 мес.: ${metrics.sixMonthGrossSavingsByn} BYN`
                : `Gross 6-mo savings: ${metrics.sixMonthGrossSavingsByn} BYN`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
