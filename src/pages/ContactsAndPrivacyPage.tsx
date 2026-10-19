import React, { useState, useEffect } from 'react';
import {
  Send,
  MessageCircle,
  Phone,
  Mail,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Lang, PageId } from '../data/servicesData';

interface ContactsPageProps {
  lang: Lang;
  prefilledLeadText?: string;
  onClearPrefill?: () => void;
  navigate: (p: PageId) => void;
  onNotify?: (title: string, description?: string, variant?: 'success' | 'info' | 'error') => void;
}

export const ContactsPage: React.FC<ContactsPageProps> = ({
  lang,
  prefilledLeadText = '',
  onClearPrefill,
  navigate,
  onNotify,
}) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState(prefilledLeadText);
  const [consent, setConsent] = useState(true);
  const [hasCalcPrefill, setHasCalcPrefill] = useState(Boolean(prefilledLeadText));

  const [errors, setErrors] = useState<{
    name?: boolean;
    contact?: boolean;
    consent?: boolean;
  }>({});
  const [submittedPayload, setSubmittedPayload] = useState<{
    timestamp: string;
    name: string;
    contact: string;
    message: string;
  } | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (prefilledLeadText) {
      setMessage(prefilledLeadText);
      setHasCalcPrefill(true);
    }
  }, [prefilledLeadText]);

  const handleCopyChannel = (value: string, id: string) => {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    if (onNotify) {
      onNotify(
        lang === 'ru' ? 'Контакт скопирован' : 'Contact copied',
        value,
        'success'
      );
    }
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Имитация серверной функции lead.js (проверка обязательных полей + формирование ответа)
  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { name?: boolean; contact?: boolean; consent?: boolean } = {};

    if (!name.trim()) nextErrors.name = true;
    if (!contact.trim()) nextErrors.contact = true;
    if (!consent) nextErrors.consent = true;

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmittedPayload(null);
      if (onNotify) {
        onNotify(
          lang === 'ru' ? 'Проверьте обязательные поля' : 'Check required fields',
          lang === 'ru'
            ? 'Укажите ваше имя, контакт для связи и согласие на обработку данных.'
            : 'Please provide your name, contact method, and privacy consent.',
          'error'
        );
      }
      return;
    }

    setErrors({});
    setSubmittedPayload({
      timestamp: new Date().toISOString(),
      name: name.trim(),
      contact: contact.trim(),
      message: message.trim() || (lang === 'ru' ? 'Без комментария' : 'No message'),
    });

    if (onNotify) {
      onNotify(
        lang === 'ru'
          ? 'Заявка проверена и сформирована'
          : 'Inquiry validated and formatted',
        lang === 'ru'
          ? 'Тестовый режим: заявка сформирована, но никуда не отправляется.'
          : 'Test mode: inquiry formatted, but not sent externally.',
        'success'
      );
    }
  };

  const channels = [
    {
      id: 'telegram',
      title: 'Telegram',
      handle: '@selor_studio',
      copyValue: '@selor_studio',
      note: {
        ru: 'Основной канал связи — отвечаем быстрее всего',
        en: 'Primary channel — fastest response time',
      },
      icon: <Send className="w-5 h-5 text-[#2E54F5]" />,
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      handle: '+375 (29) 500-40-30',
      copyValue: '+375295004030',
      note: {
        ru: 'Для текстовых и голосовых сообщений по задаче',
        en: 'For text and voice project inquiries',
      },
      icon: <MessageCircle className="w-5 h-5 text-[#2E54F5]" />,
    },
    {
      id: 'viber',
      title: 'Viber',
      handle: '+375 (29) 500-40-30',
      copyValue: '+375295004030',
      note: {
        ru: 'Быстрая связь и пересылка фотографий / прайсов',
        en: 'Quick messaging and file sharing',
      },
      icon: <Phone className="w-5 h-5 text-[#2E54F5]" />,
    },
    {
      id: 'email',
      title: 'Email',
      handle: 'hello@selor.by',
      copyValue: 'hello@selor.by',
      note: {
        ru: 'Для технических заданий, таблиц и реквизитов договора',
        en: 'For specifications, spreadsheets, and contract details',
      },
      icon: <Mail className="w-5 h-5 text-[#2E54F5]" />,
    },
  ];

  return (
    <div>
      {/* Тёмная шапка страницы Контакты (.on-deep) */}
      <section className="on-deep py-12 sm:py-16 border-b border-white/10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-3">
          <div className="text-xs font-mono uppercase tracking-widest text-[#3FD9B4]">
            {lang === 'ru' ? 'ПРЯМАЯ СВЯЗЬ СО СТУДИЕЙ SELOR' : 'DIRECT CONTACT WITH SELOR'}
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-white">
            {lang === 'ru' ? 'Контакты и отправка заявки' : 'Contacts & Project Inquiry'}
          </h1>
          <p className="text-sm sm:text-base text-[#A9B6CA] max-w-2xl">
            {lang === 'ru'
              ? 'Напишите нам напрямую в любой мессенджер или отправьте заполненную форму ниже. Если вы перешли из калькулятора — ваш расчёт уже подставлен в поле сообщения.'
              : 'Message us directly via any messenger or submit the inquiry form below. If you came from the calculator, your itemized quote is already pre-filled.'}
          </p>
        </div>
      </section>

      <section className="adaptive-scene py-12 sm:py-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-12">
          {/* Стеклянные карточки-плитки каналов связи (.channel-plate) */}
          <div className="space-y-4">
            <h2 className="font-display font-bold text-xl sm:text-2xl">
              {lang === 'ru'
                ? 'Каналы быстрой связи (копирование в 1 клик)'
                : 'Direct Communication Channels (1-Click Copy)'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {channels.map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => handleCopyChannel(ch.copyValue, ch.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleCopyChannel(ch.copyValue, ch.id);
                    }
                  }}
                  className="channel-plate p-5 flex flex-col justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-xl bg-[#2E54F5]/12 flex items-center justify-center">
                        {ch.icon}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-[#2E54F5]">
                        {copiedId === ch.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{lang === 'ru' ? 'Скопировано' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{lang === 'ru' ? 'Копировать' : 'Copy'}</span>
                          </>
                        )}
                      </span>
                    </div>
                    <div className="text-xs font-mono uppercase opacity-65 pt-1">
                      {ch.title}
                    </div>
                    <div className="font-display font-bold text-base sm:text-lg">
                      {ch.handle}
                    </div>
                  </div>
                  <p className="text-xs opacity-75 leading-relaxed">{ch.note[lang]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Форма заявки (.lead-form) */}
          <div className="max-w-3xl">
            <form onSubmit={handleLeadSubmit} noValidate className="lead-form p-6 sm:p-10 space-y-6">
              <div className="space-y-1.5">
                <h2 className="font-display font-bold text-2xl sm:text-3xl">
                  {lang === 'ru' ? 'Форма заявки на разработку' : 'Project Inquiry Form'}
                </h2>
                <p className="text-xs sm:text-sm opacity-80">
                  {lang === 'ru'
                    ? 'Оставьте контакты и краткое описание задачи — мы изучим вводные и ответим с конкретными предложениями.'
                    : 'Leave your contact details and brief project notes — we will review and reply with clear next steps.'}
                </p>
              </div>

              {/* Плашка .calc-filled если перешли из калькулятора или мини-сметы */}
              {hasCalcPrefill && (
                <div className="calc-filled px-4 py-3 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      {lang === 'ru'
                        ? 'Расчёт стоимости автоматически перенесён в поле комментария ниже.'
                        : 'Your cost estimate has been automatically added to the message field below.'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setHasCalcPrefill(false);
                      setMessage('');
                      if (onClearPrefill) onClearPrefill();
                    }}
                    className="text-xs underline opacity-80 hover:opacity-100 shrink-0 cursor-pointer"
                  >
                    {lang === 'ru' ? 'Очистить' : 'Clear'}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Поле 1: Как к вам обращаться */}
                <div className="space-y-1.5">
                  <label htmlFor="lead-name" className="block text-xs sm:text-sm font-semibold">
                    {lang === 'ru' ? 'Как к вам обращаться *' : 'Your Name *'}
                  </label>
                  <input
                    id="lead-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: false }));
                    }}
                    placeholder={lang === 'ru' ? 'Например: Александр' : 'e.g., Alex'}
                    className={`selor-input w-full px-4 py-3 text-sm ${
                      errors.name ? 'border-red-500 ring-2 ring-red-500/20' : ''
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>
                        {lang === 'ru'
                          ? 'Пожалуйста, укажите ваше имя'
                          : 'Please enter your name'}
                      </span>
                    </p>
                  )}
                </div>

                {/* Поле 2: Куда ответить */}
                <div className="space-y-1.5">
                  <label htmlFor="lead-contact" className="block text-xs sm:text-sm font-semibold">
                    {lang === 'ru'
                      ? 'Куда ответить (Telegram, телефон или почта) *'
                      : 'Where to reply (Telegram, phone, or email) *'}
                  </label>
                  <input
                    id="lead-contact"
                    type="text"
                    value={contact}
                    onChange={(e) => {
                      setContact(e.target.value);
                      if (errors.contact) setErrors((prev) => ({ ...prev, contact: false }));
                    }}
                    placeholder={
                      lang === 'ru'
                        ? '@username, +375 (29) ... или email'
                        : '@username, +375 ... or email'
                    }
                    className={`selor-input w-full px-4 py-3 text-sm ${
                      errors.contact ? 'border-red-500 ring-2 ring-red-500/20' : ''
                    }`}
                  />
                  {errors.contact && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>
                        {lang === 'ru'
                          ? 'Укажите удобный контакт для связи'
                          : 'Please provide a contact method'}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Поле 3: Задача или комментарий */}
              <div className="space-y-1.5">
                <label htmlFor="lead-message" className="block text-xs sm:text-sm font-semibold">
                  {lang === 'ru'
                    ? 'Задача или комментарий (включая перенесённый расчёт)'
                    : 'Project description or comment (includes transferred estimate)'}
                </label>
                <textarea
                  id="lead-message"
                  rows={7}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    lang === 'ru'
                      ? 'Кратко опишите сферу деятельности и что хочется сделать (сайт, бот, калькулятор или порядок в таблицах)...'
                      : 'Briefly describe your business and what you would like to build...'
                  }
                  className="selor-input w-full px-4 py-3 text-xs sm:text-sm font-mono leading-relaxed"
                />
              </div>

              {/* Галочка согласия на обработку данных */}
              <div className="space-y-1">
                <label className="flex items-start gap-2.5 text-xs sm:text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      if (errors.consent) setErrors((prev) => ({ ...prev, consent: false }));
                    }}
                    className="mt-1 accent-[#2E54F5] w-4 h-4"
                  />
                  <span className="opacity-85">
                    {lang === 'ru' ? (
                      <>
                        Согласен(на) на обработку указанных контактных данных для ответа по заявке в соответствии с{' '}
                        <button
                          type="button"
                          onClick={() => navigate('privacy')}
                          className="text-[#2E54F5] underline hover:opacity-80 cursor-pointer"
                        >
                          Политикой конфиденциальности
                        </button>
                        .
                      </>
                    ) : (
                      <>
                        I agree to the processing of my contact details to respond to this inquiry in accordance with the{' '}
                        <button
                          type="button"
                          onClick={() => navigate('privacy')}
                          className="text-[#2E54F5] underline hover:opacity-80 cursor-pointer"
                        >
                          Privacy Policy
                        </button>
                        .
                      </>
                    )}
                  </span>
                </label>
                {errors.consent && (
                  <p className="text-xs text-red-500">
                    {lang === 'ru'
                      ? 'Необходимо отметить согласие на обработку данных для отправки формы.'
                      : 'Please check the consent box to submit the form.'}
                  </p>
                )}
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                <button
                  type="submit"
                  className="inline-flex items-center gap-3 bg-[#2E54F5] hover:bg-[#1E40D8] text-white font-medium px-7 py-3.5 btn-pill-dots text-sm sm:text-base cursor-pointer"
                >
                  <span>
                    {lang === 'ru' ? 'Отправить заявку' : 'Submit Inquiry'}
                  </span>
                  <span className="dot-seq flex items-center gap-1" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                  </span>
                </button>

                <span className="text-xs font-mono opacity-65">
                  lead.js · {lang === 'ru' ? 'Тестовый контур' : 'Test sandbox'}
                </span>
              </div>

              {/* Уведомление тестового режима (имитация lead.js) */}
              {submittedPayload && (
                <div className="mt-6 p-5 rounded-2xl bg-[#0B1322] text-[#E8EEF7] border border-[#3FD9B4]/60 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-start gap-2.5 text-[#3FD9B4] font-semibold text-sm sm:text-base">
                      <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>
                        {lang === 'ru'
                          ? 'Тестовый режим: заявка проверена и сформирована, но никуда не отправляется'
                          : 'Test mode: inquiry validated and formatted, but not sent externally'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(submittedPayload, null, 2));
                        if (onNotify) {
                          onNotify(
                            lang === 'ru' ? 'Пакет заявки скопирован' : 'Payload copied',
                            lang === 'ru'
                              ? 'JSON-данные заявки сохранены в буфер обмена.'
                              : 'JSON payload copied to clipboard.',
                            'success'
                          );
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#3FCFE6]" />
                      <span>{lang === 'ru' ? 'Скопировать JSON' : 'Copy JSON'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-[#A9B6CA]">
                    {lang === 'ru'
                      ? 'Имитация серверного обработчика lead.js успешно проверила обязательные поля и подготовила пакет данных для отправки в рабочий Telegram-чат студии:'
                      : 'Server handler lead.js simulation validated all required fields and prepared the payload for Telegram dispatch:'}
                  </p>
                  <pre className="text-xs font-mono bg-[#05080D] p-3.5 rounded-xl border border-white/10 overflow-x-auto text-[#DCEAFB] whitespace-pre-wrap">
                    {JSON.stringify(submittedPayload, null, 2)}
                  </pre>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

/* СТРАНИЦА «ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ» (.legal-list) */
export const PrivacyPolicyPage: React.FC<{
  lang: Lang;
  navigate: (p: PageId) => void;
}> = ({ lang, navigate }) => {
  const sections =
    lang === 'ru'
      ? [
          {
            title: '1. Общие положения и сведения об операторе',
            body: 'Настоящая Политика определяет порядок обработки персональных данных пользователей сайта студии «Selor». Владелец сайта (Оператор): [Заполняется владельцем: Наименование ИП / Юридического лица, УНП, адрес местонахождения, контактный email]. Мы не выдумываем фиктивные реквизиты в демонстрационном прототипе — эти поля заполняются реальными данными перед публикацией на рабочем домене.',
          },
          {
            title: '2. Какие данные собираются на сайте',
            body: 'Мы запрашиваем только минимальный объём сведений, необходимый для предметного ответа по вашей задаче: имя (или как к вам обращаться), контакт для связи (ник в Telegram, номер телефона или адрес электронной почты) и текст описания задачи либо расчёта из калькулятора стоимости.',
          },
          {
            title: '3. Цели обработки персональных данных',
            body: 'Данные из форм обратной связи используются исключительно для: (а) связи с пользователем по его запросу; (б) подготовки предварительной сметы и коммерческого предложения; (в) согласования условий договора на разработку сайтов, ботов или автоматизации.',
          },
          {
            title: '4. Порядок хранения, передачи и защиты',
            body: 'Отправленные через форму заявки сведения передаются по защищённому протоколу HTTPS напрямую уполномоченным сотрудникам студии (на корпоративную почту или в закрытый рабочий чат Telegram). Мы не передаём контакты третьим лицам и не используем их для рекламных рассылок.',
          },
          {
            title: '5. Права пользователя и удаление данных',
            body: 'Вы можете в любой момент запросить уточнение или полное удаление ваших контактных данных, написав по адресу электронной почты [Заполняется владельцем: например, hello@selor.by] или в мессенджер студии.',
          },
        ]
      : [
          {
            title: '1. General Provisions & Data Controller',
            body: 'This Privacy Policy governs the processing of personal data submitted by users of the "Selor" studio website. Website Owner (Controller): [To be completed by owner: Legal Entity / Sole Proprietor Name, Registration ID, Address, Contact Email]. No fictitious registration numbers are used in this prototype.',
          },
          {
            title: '2. Data Collected via Inquiry Forms',
            body: 'We collect only the minimum information required to respond to your inquiry: your name, preferred contact method (Telegram handle, phone number, or email address), and project description or cost calculator summary.',
          },
          {
            title: '3. Purpose of Processing',
            body: 'Submitted data is used strictly to: (a) reply to your request; (b) prepare an accurate project estimate and proposal; (c) prepare contract documentation upon your request.',
          },
          {
            title: '4. Data Security & Non-Disclosure',
            body: 'Form submissions are transmitted over HTTPS directly to authorized studio staff. We never sell, rent, or share your contact information with third-party marketers or spam lists.',
          },
          {
            title: '5. User Rights & Data Deletion',
            body: 'You may request access to, correction of, or complete deletion of your personal data at any time by contacting us via [To be completed by owner: e.g., hello@selor.by].',
          },
        ];

  return (
    <div>
      <section className="on-deep py-12 sm:py-16 border-b border-white/10">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 space-y-3">
          <div className="text-xs font-mono uppercase tracking-widest text-[#3FD9B4]">
            {lang === 'ru' ? 'ЮРИДИЧЕСКАЯ ИНФОРМАЦИЯ (.LEGAL-LIST)' : 'LEGAL INFORMATION'}
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">
            {lang === 'ru' ? 'Политика конфиденциальности' : 'Privacy Policy'}
          </h1>
          <p className="text-sm text-[#A9B6CA]">
            {lang === 'ru'
              ? 'Порядок обработки данных формы заявки (с полями для внесения реквизитов владельца).'
              : 'Procedure for processing inquiry form data (with owner registration placeholders).'}
          </p>
        </div>
      </section>

      <section className="adaptive-scene py-12 sm:py-16">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 space-y-6">
          <ol className="legal-list space-y-5">
            {sections.map((sec, idx) => (
              <li key={idx} className="glass-card p-6 space-y-2">
                <h2 className="font-display font-bold text-lg sm:text-xl text-[#2E54F5]">
                  {sec.title}
                </h2>
                <p className="text-sm sm:text-base opacity-85 leading-relaxed">
                  {sec.body}
                </p>
              </li>
            ))}
          </ol>

          <div className="pt-4">
            <button
              type="button"
              onClick={() => navigate('contacts')}
              className="px-6 py-3 rounded-full bg-[#2E54F5] text-white text-sm font-medium cursor-pointer"
            >
              {lang === 'ru' ? '← Вернуться на страницу Контакты' : '← Back to Contacts'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
