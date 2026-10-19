import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  Minus,
  Plus,
  CheckCircle2,
  RotateCcw,
  Copy,
} from 'lucide-react';
import { Lang, PageId, formatBynUsd } from '../data/servicesData';

interface DemoQuizProps {
  quizType: 'demo-okna' | 'demo-potolki';
  lang: Lang;
  navigate: (p: PageId, opts?: { serviceId?: string; leadText?: string }) => void;
  onNotify?: (title: string, description?: string, variant?: 'success' | 'info' | 'error') => void;
}

export const DemoQuizzesPage: React.FC<DemoQuizProps> = ({
  quizType,
  lang,
  navigate,
  onNotify,
}) => {
  return (
    <div className="min-h-screen adaptive-scene pb-20">
      {/* Липкая тёмная полоса (.demo-top) */}
      <div className="demo-top sticky top-0 z-50 px-4 sm:px-6 py-3">
        <div className="max-w-[1100px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('home')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-medium text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#3FD9B4]" />
              <span>{lang === 'ru' ? 'Назад на сайт Selor' : 'Back to Selor site'}</span>
            </button>

            <span className="px-3 py-1 rounded-full bg-[#2E54F5]/30 border border-[#3FCFE6]/50 text-[11px] font-mono text-[#3FCFE6] uppercase">
              {lang === 'ru' ? 'Демо-версия' : 'Live Demo'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() =>
                navigate(quizType === 'demo-okna' ? 'demo-potolki' : 'demo-okna')
              }
              className="px-3 py-1.5 rounded-full bg-white/8 hover:bg-white/15 text-[#DCEAFB] transition-colors cursor-pointer"
            >
              {quizType === 'demo-okna'
                ? lang === 'ru'
                  ? 'Переключить на Демо 2: Натяжные потолки →'
                  : 'Switch to Demo 2: Stretch Ceilings →'
                : lang === 'ru'
                ? 'Переключить на Демо 1: Окна ПВХ →'
                : 'Switch to Demo 1: PVC Windows →'}
            </button>
          </div>
        </div>
      </div>

      {/* Голубой инфо-баннер */}
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 pt-6">
        <div className="rounded-2xl bg-[#2E54F5]/12 border border-[#3FCFE6]/45 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#2E54F5] shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm leading-relaxed">
              {lang === 'ru'
                ? 'Это живой демонстрационный пример услуги «Квиз-сайт» от студии Selor. Пройдите шаги, чтобы посмотреть, как работает автоматический расчёт цены в BYN и сбор заявки.'
                : 'This is an interactive demonstration of a Quiz Website built by Selor. Walk through the steps to test the real-time BYN estimator and lead capture.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('calc', { serviceId: 'kviz-sajt' })}
            className="px-4 py-2 rounded-full bg-[#2E54F5] text-white text-xs font-medium shrink-0 self-start sm:self-auto hover:bg-[#1E40D8] transition-colors cursor-pointer"
          >
            {lang === 'ru' ? 'Заказать такой квиз (от 720 BYN)' : 'Order Similar Quiz (from 720 BYN)'}
          </button>
        </div>
      </div>

      {/* Тело выбранного квиза */}
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 pt-8">
        {quizType === 'demo-okna' ? (
          <OknaQuiz lang={lang} navigate={navigate} onNotify={onNotify} />
        ) : (
          <PotolkiQuiz lang={lang} navigate={navigate} onNotify={onNotify} />
        )}
      </div>
    </div>
  );
};

/* ДЕМО 1: КВИЗ РАСЧЁТА СТОИМОСТИ ОКОН ПВХ */
const OknaQuiz: React.FC<{
  lang: Lang;
  navigate: (p: PageId, opts?: { serviceId?: string; leadText?: string }) => void;
  onNotify?: (title: string, description?: string, variant?: 'success' | 'info' | 'error') => void;
}> = ({ lang, navigate, onNotify }) => {
  const [step, setStep] = useState(1);
  const [place, setPlace] = useState<'flat' | 'house' | 'balcony'>('flat');
  const [profile, setProfile] = useState<'std60' | 'warm70' | 'silent76'>('warm70');
  const [sashes, setSashes] = useState<'two' | 'three' | 'balcony_block'>('two');
  const [windowCount, setWindowCount] = useState(2);
  const [extras, setExtras] = useState<string[]>(['install', 'slopes', 'net']);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [formError, setFormError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleExtra = (id: string) => {
    setExtras((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Расчёт ориентировочной вилки стоимости в BYN
  const basePerWindow =
    sashes === 'two' ? 420 : sashes === 'three' ? 560 : 690;
  const profileMult =
    profile === 'std60' ? 1 : profile === 'warm70' ? 1.18 : 1.32;
  const placeMult = place === 'balcony' ? 1.12 : 1;

  let unitCost = Math.round(basePerWindow * profileMult * placeMult);
  if (extras.includes('install')) unitCost += 110;
  if (extras.includes('slopes')) unitCost += 85;
  if (extras.includes('net')) unitCost += 40;

  const minTotalByn = Math.round(unitCost * windowCount * 0.95);
  const maxTotalByn = Math.round(unitCost * windowCount * 1.06);

  const progressPct = Math.round((step / 5) * 100);

  const handleCopyOknaEstimate = () => {
    const text =
      lang === 'ru'
        ? `Расчёт квиза «Подбор окон ПВХ»:\nКоличество конструкций: ${windowCount} шт.\nОриентировочная стоимость: ${minTotalByn} – ${maxTotalByn} BYN (${formatBynUsd(minTotalByn, 'ru').usdText} – ${formatBynUsd(maxTotalByn, 'ru').usdText})`
        : `PVC Windows Quiz Estimate:\nUnits: ${windowCount}\nEstimated Range: ${minTotalByn} – ${maxTotalByn} BYN`;
    navigator.clipboard.writeText(text);
    if (onNotify) {
      onNotify(
        lang === 'ru' ? 'Расчёт скопирован' : 'Calculation copied',
        `${minTotalByn} – ${maxTotalByn} BYN`,
        'success'
      );
    }
  };

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientPhone.trim()) {
      setFormError(true);
      if (onNotify) {
        onNotify(
          lang === 'ru' ? 'Заполните контакт' : 'Contact required',
          lang === 'ru'
            ? 'Укажите телефон или Telegram для проверки формы.'
            : 'Please enter a phone number or Telegram handle.',
          'error'
        );
      }
      return;
    }
    setFormError(false);
    setSubmitted(true);
    if (onNotify) {
      onNotify(
        lang === 'ru' ? 'Заявка квиза сформирована' : 'Quiz lead formatted',
        lang === 'ru'
          ? 'Тестовый режим: заявка проверена и никуда не отправляется.'
          : 'Test mode: lead validated and not sent externally.',
        'success'
      );
    }
  };

  return (
    <div className="glass-card p-6 sm:p-10 space-y-8">
      {/* Заголовок и прогресс-бар */}
      <div className="space-y-4 border-b border-current/10 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#2E54F5]">
          <span>
            {lang === 'ru'
              ? 'ДЕМО 1 · КВИЗ: РАСЧЁТ СТОИМОСТИ ОКОН ПВХ'
              : 'DEMO 1 · QUIZ: PVC WINDOWS ESTIMATOR'}
          </span>
          <span>
            {lang === 'ru' ? `Шаг ${step} из 5` : `Step ${step} of 5`} ({progressPct}%)
          </span>
        </div>

        <h1 className="font-display font-bold text-2xl sm:text-3xl">
          {lang === 'ru'
            ? 'Узнайте ориентировочную стоимость окон ПВХ за 1 минуту'
            : 'Calculate your estimated PVC windows cost in 1 minute'}
        </h1>

        <div className="w-full h-2.5 rounded-full bg-current/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#2E54F5] to-[#3FD9B4] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Шаг 1: Куда нужны окна */}
      {step === 1 && (
        <div className="space-y-5">
          <h2 className="font-display font-bold text-lg sm:text-xl">
            {lang === 'ru' ? '1. Куда планируете установку окон?' : '1. Where will the windows be installed?'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                id: 'flat' as const,
                title: { ru: 'В квартиру', en: 'Apartment' },
                desc: { ru: 'Типовые или индивидуальные проёмы в доме', en: 'Standard residential apartment' },
              },
              {
                id: 'house' as const,
                title: { ru: 'Частный дом / коттедж', en: 'Private House / Cottage' },
                desc: { ru: 'Повышенное сохранение тепла зимой', en: 'Enhanced thermal insulation' },
              },
              {
                id: 'balcony' as const,
                title: { ru: 'Балкон или лоджия', en: 'Balcony / Loggia' },
                desc: { ru: 'Остекление с козырьком и отливами', en: 'Balcony glazing with sills' },
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPlace(item.id)}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                  place === item.id
                    ? 'border-[#2E54F5] bg-[#2E54F5]/10 ring-2 ring-[#2E54F5]'
                    : 'border-current/15 hover:border-[#2E54F5]/50'
                }`}
              >
                <div className="font-display font-bold text-base">{item.title[lang]}</div>
                <div className="text-xs opacity-75 mt-1">{item.desc[lang]}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Шаг 2: Тип профиля */}
      {step === 2 && (
        <div className="space-y-5">
          <h2 className="font-display font-bold text-lg sm:text-xl">
            {lang === 'ru'
              ? '2. Выберите класс профиля и стеклопакета:'
              : '2. Choose profile & glazing class:'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                id: 'std60' as const,
                title: { ru: 'Базовый 60 мм', en: 'Standard 60 mm' },
                desc: { ru: 'Практичный вариант для тёплых квартир и дач', en: 'Practical choice for warm rooms' },
              },
              {
                id: 'warm70' as const,
                title: { ru: 'Тёплый 70 мм (Хит)', en: 'Warm 70 mm (Popular)' },
                desc: { ru: 'Двухкамерный энергосберегающий стеклопакет', en: 'Triple-pane energy-saving glass' },
              },
              {
                id: 'silent76' as const,
                title: { ru: 'Тихий 76 мм Премиум', en: 'Silent 76 mm Premium' },
                desc: { ru: 'Усиленная защита от шума проспекта и холода', en: 'Maximum acoustic & thermal insulation' },
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setProfile(item.id)}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                  profile === item.id
                    ? 'border-[#2E54F5] bg-[#2E54F5]/10 ring-2 ring-[#2E54F5]'
                    : 'border-current/15 hover:border-[#2E54F5]/50'
                }`}
              >
                <div className="font-display font-bold text-base">{item.title[lang]}</div>
                <div className="text-xs opacity-75 mt-1">{item.desc[lang]}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Шаг 3: Количество створок и количество окон (+/-) */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="font-display font-bold text-lg sm:text-xl">
            {lang === 'ru'
              ? '3. Тип конструкции и количество окон:'
              : '3. Window configuration & quantity:'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                id: 'two' as const,
                title: { ru: 'Двухстворчатое окно', en: '2-Sash Window' },
                size: '1300 × 1400 мм',
              },
              {
                id: 'three' as const,
                title: { ru: 'Трёхстворчатое окно', en: '3-Sash Window' },
                size: '2050 × 1400 мм',
              },
              {
                id: 'balcony_block' as const,
                title: { ru: 'Балконный блок (с дверью)', en: 'Balcony Door + Window' },
                size: '2100 × 2150 мм',
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSashes(item.id)}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                  sashes === item.id
                    ? 'border-[#2E54F5] bg-[#2E54F5]/10 ring-2 ring-[#2E54F5]'
                    : 'border-current/15 hover:border-[#2E54F5]/50'
                }`}
              >
                <div className="font-display font-bold text-base">{item.title[lang]}</div>
                <div className="text-xs font-mono opacity-70 mt-1">{item.size}</div>
              </button>
            ))}
          </div>

          <div className="p-5 rounded-2xl border border-current/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-sm sm:text-base">
                {lang === 'ru' ? 'Количество таких конструкций:' : 'Number of window units:'}
              </div>
              <div className="text-xs opacity-75">
                {lang === 'ru'
                  ? 'Используйте кнопки +/- для точного пересчёта вилки цены'
                  : 'Use +/- buttons to update the price range'}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setWindowCount((c) => Math.max(1, c - 1))}
                className="w-10 h-10 rounded-full border border-current/25 flex items-center justify-center hover:border-[#2E54F5] cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-mono font-bold text-xl w-10 text-center tabular-nums">
                {windowCount}
              </span>
              <button
                type="button"
                onClick={() => setWindowCount((c) => Math.min(20, c + 1))}
                className="w-10 h-10 rounded-full border border-current/25 flex items-center justify-center hover:border-[#2E54F5] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Шаг 4: Дополнительные работы */}
      {step === 4 && (
        <div className="space-y-5">
          <h2 className="font-display font-bold text-lg sm:text-xl">
            {lang === 'ru'
              ? '4. Какие дополнительные работы включить в расчёт?'
              : '4. Which installation services should be included?'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                id: 'install',
                title: { ru: 'Демонтаж и монтаж по ГОСТ', en: 'Removal & Installation' },
                price: '+110 BYN / окно',
              },
              {
                id: 'slopes',
                title: { ru: 'Тёплые откосы и подоконник', en: 'Insulated Slopes & Sill' },
                price: '+85 BYN / окно',
              },
              {
                id: 'net',
                title: { ru: 'Москитная сетка и отлив', en: 'Mosquito Screen & Drip Edge' },
                price: '+40 BYN / окно',
              },
            ].map((item) => {
              const checked = extras.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleExtra(item.id)}
                  className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                    checked
                      ? 'border-[#2E54F5] bg-[#2E54F5]/10 ring-2 ring-[#2E54F5]'
                      : 'border-current/15'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-display font-bold text-sm sm:text-base">
                      {item.title[lang]}
                    </span>
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 ${
                        checked
                          ? 'bg-[#2E54F5] border-[#2E54F5] text-white'
                          : 'border-current/30'
                      }`}
                    >
                      {checked && <Check className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#2E54F5]">{item.price}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Шаг 5: Итоговая вилка цены и тестовая форма */}
      {step === 5 && (
        <div className="space-y-6">
          <div className="calc-result p-6 sm:p-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-mono uppercase tracking-wider text-[#3FD9B4]">
                {lang === 'ru'
                  ? 'ИТОГ ОПРОСА · ОРИЕНТИРОВОЧНАЯ ВИЛКА СТОИМОСТИ'
                  : 'QUIZ RESULT · ESTIMATED PRICE RANGE'}
              </div>
              <button
                type="button"
                onClick={handleCopyOknaEstimate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-[#3FCFE6]" />
                <span>{lang === 'ru' ? 'Скопировать расчёт' : 'Copy Estimate'}</span>
              </button>
            </div>
            <div className="text-2xl sm:text-4xl font-display font-bold text-white tabular-nums">
              {minTotalByn.toLocaleString('ru-BY')} – {maxTotalByn.toLocaleString('ru-BY')} BYN{' '}
              <span className="text-base font-normal text-[#3FCFE6]">
                ({formatBynUsd(minTotalByn, lang).usdText} – {formatBynUsd(maxTotalByn, lang).usdText})
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#A9B6CA]">
              {lang === 'ru'
                ? `Расчёт для ${windowCount} шт. с выбранным профилем и работами. В реальном квизе клиент оставляет телефон, чтобы зафиксировать расчёт и пригласить замерщика.`
                : `Calculated for ${windowCount} unit(s) with selected profile and installation options.`}
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleTestSubmit} className="space-y-4 pt-2">
              <div className="text-sm font-bold">
                {lang === 'ru'
                  ? 'Тестовая проверка отправки заявки из квиза:'
                  : 'Test the quiz lead submission:'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder={lang === 'ru' ? 'Ваше имя' : 'Your name'}
                  className="selor-input px-4 py-3 text-sm"
                />
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => {
                    setClientPhone(e.target.value);
                    setFormError(false);
                  }}
                  placeholder={
                    lang === 'ru'
                      ? 'Телефон или Telegram (обязательно)*'
                      : 'Phone or Telegram (required)*'
                  }
                  className={`selor-input px-4 py-3 text-sm ${
                    formError ? 'border-red-500 ring-2 ring-red-500/20' : ''
                  }`}
                />
              </div>
              {formError && (
                <div className="text-xs text-red-500">
                  {lang === 'ru'
                    ? 'Пожалуйста, укажите телефон или Telegram для проверки формы.'
                    : 'Please enter a phone number or Telegram handle to test the form.'}
                </div>
              )}
              <button
                type="submit"
                className="px-6 py-3.5 rounded-full bg-[#2E54F5] hover:bg-[#1E40D8] text-white text-sm font-medium cursor-pointer"
              >
                {lang === 'ru'
                  ? 'Проверить отправку (Тестовый режим)'
                  : 'Test Submit (Demo Mode)'}
              </button>
            </form>
          ) : (
            <div className="p-5 rounded-2xl bg-[#3FD9B4]/15 border border-[#3FD9B4]/50 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
                <CheckCircle2 className="w-5 h-5 text-[#2E54F5]" />
                <span>
                  {lang === 'ru'
                    ? 'Тестовый режим: заявка квиза сформирована (никуда не отправляется)'
                    : 'Test mode: quiz lead validated and formatted (not sent anywhere)'}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    navigate('contacts', {
                      leadText:
                        lang === 'ru'
                          ? `[Интересует разработка такого Квиз-сайта (как в демо Окон ПВХ)]\nОриентир стоимости разработки квиза: от 720 BYN.`
                          : `[Interested in building a Quiz Website like the PVC Windows Demo]\nStarting at 720 BYN.`,
                    })
                  }
                  className="px-5 py-2.5 rounded-full bg-[#2E54F5] text-white text-xs font-medium cursor-pointer"
                >
                  {lang === 'ru'
                    ? 'Заказать такой квиз для своего бизнеса →'
                    : 'Order a quiz like this for my business →'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setStep(1);
                  }}
                  className="px-4 py-2.5 rounded-full border border-current/20 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'ru' ? 'Пройти заново' : 'Restart Quiz'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Навигация Вперёд / Назад внутри квиза */}
      <div className="pt-6 border-t border-current/10 flex items-center justify-between">
        <button
          type="button"
          disabled={step === 1}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="px-5 py-2.5 rounded-full border border-current/20 disabled:opacity-35 text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'ru' ? 'Назад' : 'Back'}</span>
        </button>

        <div className="text-xs font-mono tabular-nums opacity-75">
          {lang === 'ru' ? 'Текущая вилка: ' : 'Current range: '}
          <strong>
            {minTotalByn}–{maxTotalByn} BYN
          </strong>
        </div>

        {step < 5 && (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(5, s + 1))}
            className="px-6 py-2.5 rounded-full bg-[#2E54F5] hover:bg-[#1E40D8] text-white text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>{lang === 'ru' ? 'Следующий вопрос' : 'Next Question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

/* ДЕМО 2: КВИЗ РАСЧЁТА НАТЯЖНЫХ ПОТОЛКОВ */
const PotolkiQuiz: React.FC<{
  lang: Lang;
  navigate: (p: PageId, opts?: { serviceId?: string; leadText?: string }) => void;
  onNotify?: (title: string, description?: string, variant?: 'success' | 'info' | 'error') => void;
}> = ({ lang, navigate, onNotify }) => {
  const [step, setStep] = useState(1);
  const [roomType, setRoomType] = useState<'room' | 'kitchen' | 'full_flat'>('room');
  const [areaM2, setAreaM2] = useState(18);
  const [texture, setTexture] = useState<'matte' | 'satin' | 'gloss'>('matte');
  const [spotsCount, setSpotsCount] = useState(6);
  const [cornice, setCornice] = useState<'none' | 'surface' | 'hidden_niche'>('hidden_niche');

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [formError, setFormError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const ratePerM2 = texture === 'matte' ? 34 : texture === 'satin' ? 38 : 40;
  const spotsCost = spotsCount * 24;
  const corniceCost =
    cornice === 'none' ? 0 : cornice === 'surface' ? 95 : 185;
  const totalByn = Math.round(areaM2 * ratePerM2 + spotsCost + corniceCost);

  const progressPct = Math.round((step / 5) * 100);

  const handleCopyPotolkiEstimate = () => {
    const text =
      lang === 'ru'
        ? `Расчёт квиза «Натяжные потолки»:\nПлощадь: ${areaM2} м², светильников: ${spotsCount} шт.\nИтого: ${formatBynUsd(totalByn, 'ru').fullText}`
        : `Stretch Ceilings Quiz Estimate:\nArea: ${areaM2} m², spotlights: ${spotsCount}\nTotal: ${formatBynUsd(totalByn, 'en').fullText}`;
    navigator.clipboard.writeText(text);
    if (onNotify) {
      onNotify(
        lang === 'ru' ? 'Расчёт скопирован' : 'Calculation copied',
        formatBynUsd(totalByn, lang).fullText,
        'success'
      );
    }
  };

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientPhone.trim()) {
      setFormError(true);
      if (onNotify) {
        onNotify(
          lang === 'ru' ? 'Заполните контакт' : 'Contact required',
          lang === 'ru'
            ? 'Укажите телефон или Telegram для проверки формы.'
            : 'Please enter a phone number or Telegram handle.',
          'error'
        );
      }
      return;
    }
    setFormError(false);
    setSubmitted(true);
    if (onNotify) {
      onNotify(
        lang === 'ru' ? 'Заявка квиза сформирована' : 'Quiz lead formatted',
        lang === 'ru'
          ? 'Тестовый режим: заявка проверена и никуда не отправляется.'
          : 'Test mode: lead validated and not sent externally.',
        'success'
      );
    }
  };

  return (
    <div className="glass-card p-6 sm:p-10 space-y-8">
      <div className="space-y-4 border-b border-current/10 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#2E54F5]">
          <span>
            {lang === 'ru'
              ? 'ДЕМО 2 · КВИЗ: РАСЧЁТ НАТЯЖНЫХ ПОТОЛКОВ'
              : 'DEMO 2 · QUIZ: STRETCH CEILINGS CALCULATOR'}
          </span>
          <span>
            {lang === 'ru' ? `Шаг ${step} из 5` : `Step ${step} of 5`} ({progressPct}%)
          </span>
        </div>

        <h1 className="font-display font-bold text-2xl sm:text-3xl">
          {lang === 'ru'
            ? 'Рассчитайте стоимость натяжного потолка с освещением и карнизом'
            : 'Calculate stretch ceiling cost with lighting and curtain rail'}
        </h1>

        <div className="w-full h-2.5 rounded-full bg-current/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#2E54F5] to-[#3FCFE6] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Шаг 1: Тип помещения */}
      {step === 1 && (
        <div className="space-y-5">
          <h2 className="font-display font-bold text-lg sm:text-xl">
            {lang === 'ru' ? '1. Для какого помещения нужен потолок?' : '1. Select room type:'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                id: 'room' as const,
                title: { ru: 'Гостиная / Спальня', en: 'Living Room / Bedroom' },
                presetArea: 18,
              },
              {
                id: 'kitchen' as const,
                title: { ru: 'Кухня + Коридор', en: 'Kitchen + Hallway' },
                presetArea: 14,
              },
              {
                id: 'full_flat' as const,
                title: { ru: 'Вся квартира целиком', en: 'Entire Apartment' },
                presetArea: 48,
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setRoomType(item.id);
                  setAreaM2(item.presetArea);
                }}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                  roomType === item.id
                    ? 'border-[#2E54F5] bg-[#2E54F5]/10 ring-2 ring-[#2E54F5]'
                    : 'border-current/15'
                }`}
              >
                <div className="font-display font-bold text-base">{item.title[lang]}</div>
                <div className="text-xs font-mono opacity-70 mt-1">
                  ~{item.presetArea} м²
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Шаг 2: Площадь м² со счётчиком +/- */}
      {step === 2 && (
        <div className="space-y-5">
          <h2 className="font-display font-bold text-lg sm:text-xl">
            {lang === 'ru'
              ? '2. Укажите примерную площадь потолка (м²):'
              : '2. Specify approximate ceiling area (m²):'}
          </h2>
          <div className="p-6 rounded-2xl border border-current/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[12, 18, 24, 36, 52].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAreaM2(preset)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono border cursor-pointer ${
                    areaM2 === preset
                      ? 'bg-[#2E54F5] border-[#2E54F5] text-white'
                      : 'border-current/20'
                  }`}
                >
                  {preset} м²
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setAreaM2((a) => Math.max(4, a - 2))}
                className="w-10 h-10 rounded-full border border-current/25 flex items-center justify-center hover:border-[#2E54F5] cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-mono font-bold text-2xl w-20 text-center tabular-nums">
                {areaM2} м²
              </span>
              <button
                type="button"
                onClick={() => setAreaM2((a) => Math.min(200, a + 2))}
                className="w-10 h-10 rounded-full border border-current/25 flex items-center justify-center hover:border-[#2E54F5] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Шаг 3: Фактура полотна */}
      {step === 3 && (
        <div className="space-y-5">
          <h2 className="font-display font-bold text-lg sm:text-xl">
            {lang === 'ru' ? '3. Выберите фактуру полотна:' : '3. Choose canvas finish:'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                id: 'matte' as const,
                title: { ru: 'Матовое полотно', en: 'Matte Finish' },
                desc: { ru: 'Ровная спокойная поверхность без бликов (34 BYN/м²)', en: 'Calm reflection-free finish (34 BYN/m²)' },
              },
              {
                id: 'satin' as const,
                title: { ru: 'Сатиновое полотно', en: 'Satin Finish' },
                desc: { ru: 'Лёгкий шелковистый отблеск света (38 BYN/м²)', en: 'Soft silky light sheen (38 BYN/m²)' },
              },
              {
                id: 'gloss' as const,
                title: { ru: 'Глянцевое полотно', en: 'Gloss Finish' },
                desc: { ru: 'Зрительно увеличивает высоту комнаты (40 BYN/м²)', en: 'Visually expands room height (40 BYN/m²)' },
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTexture(item.id)}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                  texture === item.id
                    ? 'border-[#2E54F5] bg-[#2E54F5]/10 ring-2 ring-[#2E54F5]'
                    : 'border-current/15'
                }`}
              >
                <div className="font-display font-bold text-base">{item.title[lang]}</div>
                <div className="text-xs opacity-75 mt-1">{item.desc[lang]}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Шаг 4: Освещение и карниз */}
      {step === 4 && (
        <div className="space-y-6">
          <h2 className="font-display font-bold text-lg sm:text-xl">
            {lang === 'ru'
              ? '4. Точечные светильники и ниша под шторы:'
              : '4. Spotlights & curtain rail:'}
          </h2>

          <div className="p-5 rounded-2xl border border-current/15 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-sm sm:text-base">
                {lang === 'ru'
                  ? 'Количество точечных светильников (+24 BYN/шт.):'
                  : 'Number of spotlights (+24 BYN each):'}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSpotsCount((c) => Math.max(0, c - 2))}
                className="w-9 h-9 rounded-full border border-current/25 flex items-center justify-center cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-mono font-bold text-lg w-10 text-center tabular-nums">
                {spotsCount}
              </span>
              <button
                type="button"
                onClick={() => setSpotsCount((c) => Math.min(40, c + 2))}
                className="w-9 h-9 rounded-full border border-current/25 flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                id: 'none' as const,
                title: { ru: 'Без потолочного карниза', en: 'No Ceiling Rail' },
                price: '0 BYN',
              },
              {
                id: 'surface' as const,
                title: { ru: 'Накладной карниз на полотно', en: 'Surface Curtain Rail' },
                price: '+95 BYN',
              },
              {
                id: 'hidden_niche' as const,
                title: { ru: 'Скрытая ниша под шторы', en: 'Recessed Curtain Niche' },
                price: '+185 BYN',
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCornice(item.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  cornice === item.id
                    ? 'border-[#2E54F5] bg-[#2E54F5]/10 ring-2 ring-[#2E54F5]'
                    : 'border-current/15'
                }`}
              >
                <div className="font-semibold text-sm">{item.title[lang]}</div>
                <div className="text-xs font-mono text-[#2E54F5] mt-1">{item.price}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Шаг 5: Итоговая цена и тестовая форма */}
      {step === 5 && (
        <div className="space-y-6">
          <div className="calc-result p-6 sm:p-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-mono uppercase tracking-wider text-[#3FD9B4]">
                {lang === 'ru'
                  ? 'ИТОГ ОПРОСА · СТОИМОСТЬ ПОТОЛКА С УСТАНОВКОЙ'
                  : 'QUIZ RESULT · TOTAL STRETCH CEILING PRICE'}
              </div>
              <button
                type="button"
                onClick={handleCopyPotolkiEstimate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-[#3FCFE6]" />
                <span>{lang === 'ru' ? 'Скопировать расчёт' : 'Copy Estimate'}</span>
              </button>
            </div>
            <div className="text-2xl sm:text-4xl font-display font-bold text-white tabular-nums">
              {formatBynUsd(totalByn, lang).bynText}{' '}
              <span className="text-base font-normal text-[#3FCFE6]">
                ({formatBynUsd(totalByn, lang).usdText})
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#A9B6CA]">
              {lang === 'ru'
                ? `Площадь: ${areaM2} м², светильников: ${spotsCount} шт. Все ответы клиента сразу приходят замерщику в Telegram.`
                : `Area: ${areaM2} m², spotlights: ${spotsCount}. All client answers are sent straight to Telegram.`}
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleTestSubmit} className="space-y-4 pt-2">
              <div className="text-sm font-bold">
                {lang === 'ru'
                  ? 'Тестовая проверка отправки заявки из квиза:'
                  : 'Test the quiz lead submission:'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder={lang === 'ru' ? 'Ваше имя' : 'Your name'}
                  className="selor-input px-4 py-3 text-sm"
                />
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => {
                    setClientPhone(e.target.value);
                    setFormError(false);
                  }}
                  placeholder={
                    lang === 'ru'
                      ? 'Телефон или Telegram (обязательно)*'
                      : 'Phone or Telegram (required)*'
                  }
                  className={`selor-input px-4 py-3 text-sm ${
                    formError ? 'border-red-500 ring-2 ring-red-500/20' : ''
                  }`}
                />
              </div>
              {formError && (
                <div className="text-xs text-red-500">
                  {lang === 'ru'
                    ? 'Пожалуйста, укажите телефон или Telegram для проверки формы.'
                    : 'Please enter a phone number or Telegram handle to test the form.'}
                </div>
              )}
              <button
                type="submit"
                className="px-6 py-3.5 rounded-full bg-[#2E54F5] hover:bg-[#1E40D8] text-white text-sm font-medium cursor-pointer"
              >
                {lang === 'ru'
                  ? 'Проверить отправку (Тестовый режим)'
                  : 'Test Submit (Demo Mode)'}
              </button>
            </form>
          ) : (
            <div className="p-5 rounded-2xl bg-[#3FD9B4]/15 border border-[#3FD9B4]/50 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
                <CheckCircle2 className="w-5 h-5 text-[#2E54F5]" />
                <span>
                  {lang === 'ru'
                    ? 'Тестовый режим: заявка проверена и сформирована, но никуда не отправляется'
                    : 'Test mode: lead validated and formatted, not sent externally'}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    navigate('contacts', {
                      leadText:
                        lang === 'ru'
                          ? `[Интересует разработка Квиз-сайта (как в демо Натяжных потолков)]\nОриентир стоимости разработки квиза: от 720 BYN.`
                          : `[Interested in building a Quiz Website like the Stretch Ceilings Demo]\nStarting at 720 BYN.`,
                    })
                  }
                  className="px-5 py-2.5 rounded-full bg-[#2E54F5] text-white text-xs font-medium cursor-pointer"
                >
                  {lang === 'ru'
                    ? 'Заказать такой квиз для своего бизнеса →'
                    : 'Order a quiz like this for my business →'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setStep(1);
                  }}
                  className="px-4 py-2.5 rounded-full border border-current/20 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'ru' ? 'Пройти заново' : 'Restart Quiz'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="pt-6 border-t border-current/10 flex items-center justify-between">
        <button
          type="button"
          disabled={step === 1}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="px-5 py-2.5 rounded-full border border-current/20 disabled:opacity-35 text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'ru' ? 'Назад' : 'Back'}</span>
        </button>

        <div className="text-xs font-mono tabular-nums opacity-75">
          {lang === 'ru' ? 'Расчёт: ' : 'Total: '}
          <strong>{totalByn} BYN</strong>
        </div>

        {step < 5 && (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(5, s + 1))}
            className="px-6 py-2.5 rounded-full bg-[#2E54F5] hover:bg-[#1E40D8] text-white text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>{lang === 'ru' ? 'Следующий вопрос' : 'Next Question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
