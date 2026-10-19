/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Lang, ThemeMode, FontPair, PageId } from './data/servicesData';
import { Layout } from './components/Layout';
import { Toast, ToastMessage, ToastVariant } from './components/Toast';
import { HomePage } from './pages/HomePage';
import { ServicesPage, ServiceDetailPage } from './pages/ServicesPage';
import { CalculatorPage } from './pages/CalculatorPage';
import { DemoQuizzesPage } from './pages/DemoQuizzesPage';
import { ContactsPage, PrivacyPolicyPage } from './pages/ContactsAndPrivacyPage';

export default function App() {
  const [lang, setLang] = useState<Lang>('ru');
  const [theme, setTheme] = useState<ThemeMode>('light');
  // По решению из Фазы 1 по умолчанию активен Вариант 1: Literata + Golos Text
  const [fontPair, setFontPair] = useState<FontPair>('pair1');
  const [page, setPage] = useState<PageId>('home');
  const [focusedServiceId, setFocusedServiceId] = useState<string | null>(null);
  const [prefilledLeadText, setPrefilledLeadText] = useState<string>('');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const triggerToast = useCallback(
    (title: string, description?: string, variant: ToastVariant = 'success') => {
      setToast({
        id: String(Date.now()),
        title,
        description,
        variant,
      });
    },
    []
  );

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  // Применение темы (Системная / Светлая / Тёмная) к documentElement
  useEffect(() => {
    const applyResolvedTheme = () => {
      let resolved: 'light' | 'dark' = 'light';
      if (theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      } else {
        resolved = theme;
      }
      document.documentElement.setAttribute('data-theme', resolved);
    };

    applyResolvedTheme();

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (theme === 'system') applyResolvedTheme();
    };
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, [theme]);

  // Применение выбранной шрифтовой пары к documentElement
  useEffect(() => {
    document.documentElement.setAttribute('data-font', fontPair);
  }, [fontPair]);

  // Обновление lang у html
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const navigate = (
    nextPage: PageId,
    opts?: { serviceId?: string; leadText?: string }
  ) => {
    if (opts?.serviceId) {
      setFocusedServiceId(opts.serviceId);
    } else if (nextPage !== 'services' && nextPage !== 'calc') {
      setFocusedServiceId(null);
    }

    if (opts?.leadText !== undefined) {
      setPrefilledLeadText(opts.leadText);
    }

    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Layout
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        fontPair={fontPair}
        setFontPair={setFontPair}
        page={page}
        navigate={navigate}
        onNotify={triggerToast}
      >
        {page === 'home' && (
          <HomePage lang={lang} navigate={navigate} onNotify={triggerToast} />
        )}

        {page === 'works' && (
          <HomePage
            lang={lang}
            navigate={navigate}
            onlyWorksSection
            onNotify={triggerToast}
          />
        )}

        {page === 'services' && (
          <ServicesPage
            lang={lang}
            focusedServiceId={focusedServiceId}
            navigate={navigate}
          />
        )}

        {(page === 'sajty' ||
          page === 'telegram-boty' ||
          page === 'zayavki' ||
          page === 'dannye' ||
          page === 'zakupki' ||
          page === 'audit') && (
          <ServiceDetailPage
            serviceId={page}
            lang={lang}
            navigate={navigate}
            onNotify={triggerToast}
          />
        )}

        {page === 'calc' && (
          <CalculatorPage
            lang={lang}
            initialServiceId={focusedServiceId}
            navigate={navigate}
            onNotify={triggerToast}
          />
        )}

        {(page === 'demo-okna' || page === 'demo-potolki') && (
          <DemoQuizzesPage
            quizType={page}
            lang={lang}
            navigate={navigate}
            onNotify={triggerToast}
          />
        )}

        {page === 'contacts' && (
          <ContactsPage
            lang={lang}
            prefilledLeadText={prefilledLeadText}
            onClearPrefill={() => setPrefilledLeadText('')}
            navigate={navigate}
            onNotify={triggerToast}
          />
        )}

        {page === 'privacy' && (
          <PrivacyPolicyPage lang={lang} navigate={navigate} />
        )}
      </Layout>

      <Toast toast={toast} onClose={closeToast} />
    </>
  );
}

