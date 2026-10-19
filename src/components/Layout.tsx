import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
  Type,
  Send,
  Phone,
  MessageCircle,
  Mail,
  Check,
  Copy,
  ArrowUpRight,
} from 'lucide-react';
import {
  Lang,
  ThemeMode,
  FontPair,
  PageId,
  SERVICE_GROUPS,
  SERVICES,
  formatBynUsd,
} from '../data/servicesData';
import { ScrollProgressBar } from './ScrollProgressBar';

interface LayoutProps {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  fontPair: FontPair;
  setFontPair: (f: FontPair) => void;
  page: PageId;
  navigate: (p: PageId, opts?: { serviceId?: string; leadText?: string; scrollTo?: string }) => void;
  onNotify?: (title: string, description?: string, variant?: 'success' | 'info' | 'error') => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  lang,
  setLang,
  theme,
  setTheme,
  fontPair,
  setFontPair,
  page,
  navigate,
  onNotify,
  children,
}) => {
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [protoSettingsOpen, setProtoSettingsOpen] = useState(false);
  const [copiedContact, setCopiedContact] = useState<string | null>(null);

  const megaRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setProtoSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = (value: string, id: string) => {
    navigator.clipboard.writeText(value);
    setCopiedContact(id);
    if (onNotify) {
      onNotify(
        lang === 'ru' ? 'Контакт скопирован' : 'Contact copied',
        value,
        'success'
      );
    }
    setTimeout(() => setCopiedContact(null), 2000);
  };

  const DETAIL_PAGE_IDS = [
    'sajty',
    'telegram-boty',
    'zayavki',
    'dannye',
    'zakupki',
    'audit',
  ];

  const handleServiceClick = (serviceId: string) => {
    setMegaOpen(false);
    setMobileMenuOpen(false);
    if (DETAIL_PAGE_IDS.includes(serviceId)) {
      navigate(serviceId as PageId);
    } else {
      navigate('services', { serviceId });
    }
  };

  const isDemoQuizPage = page === 'demo-okna' || page === 'demo-potolki';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Тонкий горизонтальный индикатор глубины прокрутки в самом верху экрана */}
      <ScrollProgressBar page={page} />

      {/* Липкая шапка (всегда тёмное стекло rgba(5, 8, 13, 0.84) с blur(14px)) */}
      {!isDemoQuizPage && (
        <header
          style={{
            backgroundColor: 'rgba(5, 8, 13, 0.84)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
          className="sticky top-0 z-50 border-b border-[rgba(150,175,255,0.16)] text-[#E8EEF7]"
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
            {/* Логотип Selor */}
            <button
              type="button"
              onClick={() => navigate('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-none whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2E54F5] via-[#0E2280] to-[#3FCFE6] flex items-center justify-center text-white font-display font-bold text-base shadow-[0_0_18px_rgba(46,84,245,0.5)]">
                S
              </span>
              <span className="font-display font-bold text-xl tracking-tight text-[#E8EEF7] group-hover:text-white transition-colors">
                Selor
              </span>
            </button>

            {/* Десктопное меню */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#A9B6CA]">
              <button
                type="button"
                onClick={() => navigate('home')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 ${
                  page === 'home' ? 'text-white border-[#3FD9B4]' : 'border-transparent'
                }`}
              >
                {lang === 'ru' ? 'Главная' : 'Home'}
              </button>

              {/* Пункт Услуги с выпадающей мега-панелью на 4 колонки */}
              <div className="relative" ref={megaRef}>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigate('services');
                      setMegaOpen(false);
                    }}
                    className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 ${
                      page === 'services' || DETAIL_PAGE_IDS.includes(page)
                        ? 'text-white border-[#3FD9B4]'
                        : 'border-transparent'
                    }`}
                  >
                    {lang === 'ru' ? 'Услуги' : 'Services'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMegaOpen((prev) => !prev)}
                    aria-expanded={megaOpen}
                    aria-label={lang === 'ru' ? 'Открыть каталог услуг' : 'Toggle services mega-menu'}
                    className="p-1 rounded-lg hover:bg-white/10 text-[#A9B6CA] hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        megaOpen ? 'rotate-180 text-[#3FD9B4]' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Мега-панель на 4 колонки без внутренней прокрутки */}
                {megaOpen && (
                  <div
                    style={{
                      backgroundColor: 'rgba(7, 12, 22, 0.97)',
                      backdropFilter: 'blur(20px)',
                    }}
                    className="fixed left-1/2 -translate-x-1/2 top-20 w-[min(1200px,95vw)] rounded-[26px] border border-[rgba(150,175,255,0.24)] shadow-[0_30px_80px_rgba(0,0,0,0.75)] p-6 z-50"
                  >
                    <div className="grid grid-cols-4 gap-6">
                      {SERVICE_GROUPS.map((grp) => {
                        const groupServices = SERVICES.filter((s) => s.groupId === grp.id);
                        return (
                          <div key={grp.id} className="space-y-3">
                            <div className="text-xs font-bold tracking-wider uppercase text-[#3FD9B4] border-b border-white/10 pb-2">
                              {grp.title[lang]}
                            </div>
                            <ul className="space-y-1.5">
                              {groupServices.map((svc) => {
                                const priceInfo = formatBynUsd(svc.basePriceByn, lang, svc.isMonthly);
                                return (
                                  <li key={svc.id}>
                                    <button
                                      type="button"
                                      onClick={() => handleServiceClick(svc.id)}
                                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-white/8 transition-colors group flex items-start justify-between gap-2 cursor-pointer"
                                    >
                                      <div>
                                        <div className="text-sm font-medium text-[#E8EEF7] group-hover:text-[#3FCFE6] transition-colors flex items-center gap-1.5">
                                          <span>{svc.title[lang]}</span>
                                          {svc.hasDetailPage && (
                                            <ArrowUpRight className="w-3.5 h-3.5 text-[#3FD9B4] opacity-80" />
                                          )}
                                        </div>
                                        <div className="text-[11px] text-[#A9B6CA] tabular-nums mt-0.5">
                                          {lang === 'ru' ? 'от ' : 'from '}
                                          {priceInfo.bynText} ({priceInfo.usdText})
                                        </div>
                                      </div>
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#A9B6CA]">
                      <div className="flex items-center gap-4">
                        <span>
                          {lang === 'ru'
                            ? 'Все 15 услуг с точным составом работ и сроками:'
                            : 'All 15 services with detailed deliverables and timeframes:'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setMegaOpen(false);
                            navigate('services');
                          }}
                          className="text-[#3FD9B4] hover:underline font-medium cursor-pointer"
                        >
                          {lang === 'ru' ? 'Открыть полный каталог услуг →' : 'View full service catalog →'}
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#A9B6CA]">
                          {lang === 'ru' ? 'Демо квиз-сайтов:' : 'Live quiz demos:'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setMegaOpen(false);
                            navigate('demo-okna');
                          }}
                          className="px-2.5 py-1 rounded-full bg-white/8 hover:bg-white/15 text-[#DCEAFB] transition-colors cursor-pointer"
                        >
                          {lang === 'ru' ? 'Демо: Окна ПВХ' : 'Demo: PVC Windows'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMegaOpen(false);
                            navigate('demo-potolki');
                          }}
                          className="px-2.5 py-1 rounded-full bg-white/8 hover:bg-white/15 text-[#DCEAFB] transition-colors cursor-pointer"
                        >
                          {lang === 'ru' ? 'Демо: Потолки' : 'Demo: Ceilings'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => navigate('calc')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 ${
                  page === 'calc' ? 'text-white border-[#3FD9B4]' : 'border-transparent'
                }`}
              >
                {lang === 'ru' ? 'Расчёт стоимости' : 'Cost Calculator'}
              </button>

              <button
                type="button"
                onClick={() => navigate('works')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 ${
                  page === 'works' ? 'text-white border-[#3FD9B4]' : 'border-transparent'
                }`}
              >
                {lang === 'ru' ? 'Работы / Демо' : 'Works / Demos'}
              </button>

              <button
                type="button"
                onClick={() => navigate('contacts')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 ${
                  page === 'contacts' ? 'text-white border-[#3FD9B4]' : 'border-transparent'
                }`}
              >
                {lang === 'ru' ? 'Контакты' : 'Contacts'}
              </button>
            </nav>

            {/* Правая зона: Переключатель темы, Шрифты, RU|EN и кнопка-пилюля с 4 точками */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Переключатель темы: Системная / Светлая / Тёмная */}
              <div
                className="hidden sm:flex items-center bg-white/8 border border-white/12 rounded-full p-0.5"
                role="group"
                aria-label={lang === 'ru' ? 'Тема оформления' : 'Theme mode'}
              >
                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  title={lang === 'ru' ? 'Системная тема' : 'System theme'}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    theme === 'system'
                      ? 'bg-[#2E54F5] text-white'
                      : 'text-[#A9B6CA] hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  title={lang === 'ru' ? 'Светлая тема' : 'Light theme'}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    theme === 'light'
                      ? 'bg-[#2E54F5] text-white'
                      : 'text-[#A9B6CA] hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  title={lang === 'ru' ? 'Тёмная тема' : 'Dark theme'}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-[#2E54F5] text-white'
                      : 'text-[#A9B6CA] hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Переключатель шрифтовой пары (настройки прототипа) */}
              <div className="relative" ref={settingsRef}>
                <button
                  type="button"
                  onClick={() => setProtoSettingsOpen((v) => !v)}
                  title={
                    lang === 'ru'
                      ? 'Настройки прототипа (шрифтовая пара и тема)'
                      : 'Prototype settings (font pair & theme)'
                  }
                  className={`p-2 rounded-full border transition-colors cursor-pointer flex items-center gap-1 text-xs ${
                    protoSettingsOpen
                      ? 'bg-[#2E54F5]/30 border-[#3FCFE6] text-white'
                      : 'bg-white/8 border-white/12 text-[#A9B6CA] hover:text-white'
                  }`}
                >
                  <Type className="w-3.5 h-3.5 text-[#3FD9B4]" />
                  <span className="hidden xl:inline font-mono text-[11px]">
                    {fontPair === 'pair1' ? 'Literata' : 'Unbounded'}
                  </span>
                </button>

                {protoSettingsOpen && (
                  <div
                    style={{
                      backgroundColor: 'rgba(7, 12, 22, 0.98)',
                      backdropFilter: 'blur(18px)',
                    }}
                    className="absolute right-0 mt-2 w-72 rounded-2xl border border-[rgba(150,175,255,0.28)] shadow-2xl p-4 z-50 text-left space-y-3"
                  >
                    <div className="text-xs font-bold uppercase tracking-wider text-[#3FD9B4]">
                      {lang === 'ru' ? 'Настройки прототипа' : 'Prototype Settings'}
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-xs text-[#A9B6CA]">
                        {lang === 'ru' ? 'Шрифтовая пара:' : 'Typography Pair:'}
                      </div>
                      <button
                        type="button"
                        onClick={() => setFontPair('pair1')}
                        className={`w-full text-left px-3 py-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                          fontPair === 'pair1'
                            ? 'bg-[#2E54F5]/25 border-[#2E54F5] text-white'
                            : 'bg-white/5 border-white/10 text-[#A9B6CA] hover:text-white'
                        }`}
                      >
                        <div className="font-semibold text-[#E8EEF7]">
                          {lang === 'ru' ? 'Вариант 1 (По умолчанию)' : 'Variant 1 (Default)'}
                        </div>
                        <div className="text-[11px] text-[#A9B6CA]">
                          Literata + Golos Text
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFontPair('pair2')}
                        className={`w-full text-left px-3 py-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                          fontPair === 'pair2'
                            ? 'bg-[#2E54F5]/25 border-[#2E54F5] text-white'
                            : 'bg-white/5 border-white/10 text-[#A9B6CA] hover:text-white'
                        }`}
                      >
                        <div className="font-semibold text-[#E8EEF7]">
                          {lang === 'ru' ? 'Вариант 2 (Из tokens.css)' : 'Variant 2 (tokens.css)'}
                        </div>
                        <div className="text-[11px] text-[#A9B6CA]">
                          Unbounded + Onest
                        </div>
                      </button>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-white/10">
                      <div className="text-xs text-[#A9B6CA]">
                        {lang === 'ru' ? 'Тема светлых разделов:' : 'Surface Theme:'}
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['system', 'light', 'dark'] as ThemeMode[]).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setTheme(m)}
                            className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                              theme === m
                                ? 'bg-[#2E54F5] border-[#2E54F5] text-white'
                                : 'bg-white/5 border-white/10 text-[#A9B6CA] hover:text-white'
                            }`}
                          >
                            {m === 'system'
                              ? lang === 'ru'
                                ? 'Система'
                                : 'System'
                              : m === 'light'
                              ? lang === 'ru'
                                ? 'Светлая'
                                : 'Light'
                              : lang === 'ru'
                              ? 'Тёмная'
                              : 'Dark'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Переключатель языка RU | EN */}
              <div className="flex items-center bg-white/8 border border-white/12 rounded-full p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setLang('ru')}
                  className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                    lang === 'ru'
                      ? 'bg-[#2E54F5] text-white'
                      : 'text-[#A9B6CA] hover:text-white'
                  }`}
                >
                  RU
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                    lang === 'en'
                      ? 'bg-[#2E54F5] text-white'
                      : 'text-[#A9B6CA] hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Кнопка-пилюля «Посчитать стоимость» с 4 точками */}
              <button
                type="button"
                onClick={() => navigate('calc')}
                className="hidden md:inline-flex items-center gap-2.5 bg-[#2E54F5] hover:bg-[#385FF7] text-white text-xs sm:text-sm font-medium px-4 py-2.5 btn-pill-dots whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>{lang === 'ru' ? 'Посчитать стоимость' : 'Calculate Cost'}</span>
                <span className="dot-seq flex items-center gap-1" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
              </button>

              {/* Бургер-меню для мобильных */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label={lang === 'ru' ? 'Меню' : 'Menu'}
                className="lg:hidden p-2 rounded-xl bg-white/8 border border-white/12 text-[#E8EEF7] hover:bg-white/15 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Мобильное меню с аккордеоном услуг */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-white/10 bg-[#05080D]/98 px-4 py-5 space-y-4 max-h-[82vh] overflow-y-auto">
              <div className="flex flex-col space-y-2 text-base font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('home');
                  }}
                  className="text-left py-2 px-3 rounded-xl hover:bg-white/8 text-[#E8EEF7]"
                >
                  {lang === 'ru' ? 'Главная' : 'Home'}
                </button>

                {/* Аккордеон услуг в мобильном меню */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('services');
                      }}
                      className="flex-1 text-left py-2.5 px-3 font-medium text-[#E8EEF7]"
                    >
                      {lang === 'ru' ? 'Услуги (все 15)' : 'Services (all 15)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileServicesOpen((v) => !v)}
                      className="p-2.5 text-[#3FD9B4]"
                      aria-label="Toggle services list"
                    >
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          mobileServicesOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {mobileServicesOpen && (
                    <div className="px-3 pb-3 pt-1 space-y-4 border-t border-white/10">
                      {SERVICE_GROUPS.map((grp) => (
                        <div key={grp.id} className="space-y-1.5">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-[#3FD9B4]">
                            {grp.title[lang]}
                          </div>
                          <div className="space-y-1 pl-2 border-l border-white/10">
                            {SERVICES.filter((s) => s.groupId === grp.id).map((svc) => (
                              <button
                                key={svc.id}
                                type="button"
                                onClick={() => handleServiceClick(svc.id)}
                                className="w-full text-left py-1.5 text-sm text-[#DCEAFB] hover:text-white flex items-center justify-between"
                              >
                                <span>{svc.title[lang]}</span>
                                <span className="text-xs text-[#A9B6CA] tabular-nums">
                                  {svc.basePriceByn} BYN
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('calc');
                  }}
                  className="text-left py-2 px-3 rounded-xl hover:bg-white/8 text-[#E8EEF7]"
                >
                  {lang === 'ru' ? 'Расчёт стоимости' : 'Cost Calculator'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('works');
                  }}
                  className="text-left py-2 px-3 rounded-xl hover:bg-white/8 text-[#E8EEF7]"
                >
                  {lang === 'ru' ? 'Работы и демо-квизы' : 'Works & Demo Quizzes'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('contacts');
                  }}
                  className="text-left py-2 px-3 rounded-xl hover:bg-white/8 text-[#E8EEF7]"
                >
                  {lang === 'ru' ? 'Контакты' : 'Contacts'}
                </button>
              </div>

              <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('calc');
                  }}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#2E54F5] text-white font-medium py-3 px-5 btn-pill-dots"
                >
                  <span>{lang === 'ru' ? 'Посчитать стоимость' : 'Calculate Cost'}</span>
                  <span className="dot-seq flex items-center gap-1">
                    <span />
                    <span />
                    <span />
                    <span />
                  </span>
                </button>
              </div>
            </div>
          )}
        </header>
      )}

      {/* Основное содержимое страницы */}
      <main className="flex-1">{children}</main>

      {/* Подвал: всегда тёмный (#05080D), 4 колонки, заголовки капсом цвета мяты #3FD9B4 */}
      {!isDemoQuizPage && (
        <footer className="bg-[#05080D] text-[#E8EEF7] border-t border-[rgba(150,175,255,0.16)] pt-14 pb-10">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
              {/* Колонка 1: О студии */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[#3FD9B4]">
                  {lang === 'ru' ? 'О СТУДИИ' : 'ABOUT STUDIO'}
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[#2E54F5] flex items-center justify-center text-white font-display font-bold text-sm">
                    S
                  </span>
                  <span className="font-display font-bold text-lg text-white">Selor</span>
                </div>
                <p className="text-sm text-[#A9B6CA] leading-relaxed">
                  {lang === 'ru'
                    ? 'Спокойная разработка сайтов, калькуляторов, Telegram-ботов и автоматизации таблиц для малого бизнеса. Прозрачная смета в BYN (~USD) до старта работ.'
                    : 'Practical websites, calculators, Telegram bots, and spreadsheet automation for small businesses. Clear upfront estimates in BYN (~USD).'}
                </p>
              </div>

              {/* Колонка 2: Услуги */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[#3FD9B4]">
                  {lang === 'ru' ? 'УСЛУГИ' : 'SERVICES'}
                </div>
                <ul className="space-y-2 text-sm text-[#A9B6CA]">
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate('sajty')}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {lang === 'ru' ? 'Разработка сайтов' : 'Websites'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate('telegram-boty')}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {lang === 'ru' ? 'Telegram-боты для бизнеса' : 'Telegram Bots'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate('services', { serviceId: 'internet-magazin' })}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {lang === 'ru' ? 'Интернет-магазины и каталоги' : 'Online Stores & Catalogs'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate('services', { serviceId: 'kalkulyator' })}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {lang === 'ru' ? 'Калькуляторы и квиз-сайты' : 'Calculators & Quiz Sites'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate('services', { serviceId: 'zayavki' })}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {lang === 'ru' ? 'Автоматизация заявок и закупок' : 'CRM & Procurement Automation'}
                    </button>
                  </li>
                </ul>
              </div>

              {/* Колонка 3: Навигация */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[#3FD9B4]">
                  {lang === 'ru' ? 'НАВИГАЦИЯ' : 'NAVIGATION'}
                </div>
                <ul className="space-y-2 text-sm text-[#A9B6CA]">
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate('home')}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {lang === 'ru' ? 'Главная страница' : 'Home'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate('services')}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {lang === 'ru' ? 'Каталог всех 15 услуг' : 'All 15 Services'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate('calc')}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {lang === 'ru' ? 'Калькулятор стоимости (4 шага)' : '4-Step Cost Calculator'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate('demo-okna')}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {lang === 'ru' ? 'Демо-квиз: Окна ПВХ' : 'Demo Quiz: PVC Windows'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate('demo-potolki')}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {lang === 'ru' ? 'Демо-квиз: Натяжные потолки' : 'Demo Quiz: Stretch Ceilings'}
                    </button>
                  </li>
                </ul>
              </div>

              {/* Колонка 4: Контакты с иконками Telegram, WhatsApp, Viber, Email */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[#3FD9B4]">
                  {lang === 'ru' ? 'КОНТАКТЫ' : 'CONTACTS'}
                </div>
                <div className="space-y-2.5 text-sm">
                  {[
                    {
                      id: 'tg',
                      label: 'Telegram: @selor_studio',
                      val: '@selor_studio',
                      icon: <Send className="w-4 h-4 text-[#3FCFE6]" />,
                    },
                    {
                      id: 'wa',
                      label: 'WhatsApp: +375 (29) 500-40-30',
                      val: '+375295004030',
                      icon: <MessageCircle className="w-4 h-4 text-[#3FD9B4]" />,
                    },
                    {
                      id: 'vb',
                      label: 'Viber: +375 (29) 500-40-30',
                      val: '+375295004030',
                      icon: <Phone className="w-4 h-4 text-[#2E54F5]" />,
                    },
                    {
                      id: 'em',
                      label: 'Email: hello@selor.by',
                      val: 'hello@selor.by',
                      icon: <Mail className="w-4 h-4 text-[#CDF26B]" />,
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleCopy(item.val, item.id)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 transition-colors text-left cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5 text-[#E8EEF7] truncate">
                        {item.icon}
                        <span className="truncate text-xs">{item.label}</span>
                      </span>
                      {copiedContact === item.id ? (
                        <Check className="w-3.5 h-3.5 text-[#3FD9B4] shrink-0" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#A9B6CA] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A9B6CA]">
              <div>
                © {new Date().getFullYear()} Selor.{' '}
                {lang === 'ru'
                  ? 'Разработка сайтов, Telegram-ботов и автоматизации.'
                  : 'Websites, Telegram bots, and business automation.'}
              </div>
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => navigate('privacy')}
                  className="hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
                >
                  {lang === 'ru' ? 'Политика конфиденциальности' : 'Privacy Policy'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('contacts')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {lang === 'ru' ? 'Оставить заявку' : 'Contact Us'}
                </button>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
