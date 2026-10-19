import React from 'react';
import { Lang } from '../data/servicesData';

interface CssVizProps {
  type: 'browser' | 'bot' | 'flow' | 'chart';
  compact?: boolean;
  lang?: Lang;
}

export const CssViz: React.FC<CssVizProps> = ({ type, compact = false, lang = 'ru' }) => {
  const heightClass = compact ? 'h-20 w-28 shrink-0' : 'h-36 w-full';

  if (type === 'browser') {
    return (
      <div className={`viz ${heightClass} p-3 flex flex-col justify-between select-none`} aria-hidden="true">
        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2E54F5]" />
            <span className="w-2 h-2 rounded-full bg-[#3FCFE6]" />
            <span className="w-2 h-2 rounded-full bg-[#3FD9B4]" />
          </div>
          {!compact && (
            <span className="text-[10px] font-mono text-[#A9B6CA]/80 bg-white/5 px-2 py-0.5 rounded">
              selor.by / web
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2 flex-1 items-center">
          <div className="col-span-2 space-y-1.5 viz-float">
            <div className="h-2.5 w-4/5 rounded bg-gradient-to-r from-[#E8EEF7] to-[#A9B6CA]/60" />
            <div className="h-1.5 w-3/5 rounded bg-[#A9B6CA]/40" />
            {!compact && (
              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-[#2E54F5] text-[9px] text-white font-medium">
                <span>{lang === 'ru' ? 'Смета' : 'Quote'}</span>
                <span className="w-1 h-1 rounded-full bg-[#CDF26B]" />
              </div>
            )}
          </div>
          <div className="col-span-1 h-full max-h-16 rounded-lg bg-gradient-to-br from-[#2E54F5]/35 via-[#3FCFE6]/20 to-transparent border border-[#3FCFE6]/30 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full border border-[#CDF26B]/70 bg-[#CDF26B]/20" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'bot') {
    return (
      <div className={`viz ${heightClass} p-3 flex flex-col justify-between select-none`} aria-hidden="true">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-[#3FD9B4] tracking-wider uppercase">
            TG • BOT
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#3FD9B4]" />
        </div>
        <div className="space-y-1.5 my-auto">
          <div className="bg-white/10 border border-white/10 rounded-xl rounded-tl-xs px-2.5 py-1 max-w-[82%]">
            <div className="h-1.5 w-20 bg-[#E8EEF7]/80 rounded" />
          </div>
          <div className="bg-[#2E54F5]/40 border border-[#3FCFE6]/40 rounded-xl rounded-tr-xs px-2.5 py-1 max-w-[75%] ml-auto viz-float">
            <div className="h-1.5 w-16 bg-[#CDF26B] rounded" />
          </div>
        </div>
        {!compact && (
          <div className="flex gap-1.5 pt-1">
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] text-[#DCEAFB]">
              {lang === 'ru' ? 'Расчёт' : 'Estimate'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#3FD9B4]/20 border border-[#3FD9B4]/40 text-[9px] text-[#3FD9B4]">
              {lang === 'ru' ? 'Запись' : 'Book'}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (type === 'flow') {
    return (
      <div className={`viz ${heightClass} p-3 flex flex-col justify-between select-none`} aria-hidden="true">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#A9B6CA]">
          <span>{lang === 'ru' ? 'ФОРМА' : 'FORM'}</span>
          {!compact && <span>API / WEBHOOK</span>}
          <span className="text-[#3FD9B4]">CRM</span>
        </div>
        <div className="relative flex items-center justify-between my-auto py-2">
          <div className="absolute left-2 right-2 h-0.5 bg-white/15 overflow-hidden">
            <div className="w-6 h-full bg-gradient-to-r from-transparent via-[#CDF26B] to-[#3FCFE6] viz-runner" />
          </div>
          <div className="relative z-10 w-5 h-5 rounded-lg bg-[#0B1322] border border-[#2E54F5] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E54F5]" />
          </div>
          <div className="relative z-10 w-5 h-5 rounded-lg bg-[#0B1322] border border-[#3FCFE6] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3FCFE6]" />
          </div>
          <div className="relative z-10 w-5 h-5 rounded-lg bg-[#0B1322] border border-[#3FD9B4] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CDF26B]" />
          </div>
        </div>
        {!compact && (
          <div className="text-[10px] text-[#A9B6CA]/80 font-mono truncate">
            {lang === 'ru' ? 'Автопередача без потерь' : 'Zero-loss lead routing'}
          </div>
        )}
      </div>
    );
  }

  // 'chart'
  return (
    <div className={`viz ${heightClass} p-3 flex flex-col justify-between select-none`} aria-hidden="true">
      <div className="flex items-center justify-between text-[10px] font-mono text-[#A9B6CA]">
        <span>{lang === 'ru' ? 'ДАННЫЕ' : 'DATA'}</span>
        <span className="text-[#CDF26B]">BYN / ~USD</span>
      </div>
      <div className="flex items-end justify-between gap-2 h-14 pt-2 px-1">
        <div className="w-full bg-[#2E54F5]/45 border-t border-[#2E54F5] rounded-t h-full viz-bar-1" />
        <div className="w-full bg-[#3FCFE6]/45 border-t border-[#3FCFE6] rounded-t h-full viz-bar-2" />
        <div className="w-full bg-[#3FD9B4]/55 border-t border-[#3FD9B4] rounded-t h-full viz-bar-3" />
        <div className="w-full bg-[#CDF26B]/65 border-t border-[#CDF26B] rounded-t h-full viz-bar-2" />
      </div>
    </div>
  );
};
