import { Lang, ServiceItem, formatBynUsd } from '../data/servicesData';

export interface RoiPdfTimelinePoint {
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

export interface RoiPdfTaskPoint {
  name: string;
  manual: number;
  automated: number;
  savedMinPerWeek: number;
  savedHoursPerMonth: number;
  savedBynPerMonth: number;
  hourlyRateByn: number;
  stageReductionPct: number;
}

export interface RoiPdfReportInput {
  service: ServiceItem;
  packageName: string;
  investmentByn: number;
  weeklyHours: number;
  hourlyRateByn: number;
  reductionPct: number;
  savedHoursPerWeek: number;
  savedHoursPerMonth: number;
  savedBynPerMonth: number;
  sixMonthGrossSavingsByn: number;
  sixMonthNetBenefitByn: number;
  roiPercent: number;
  paybackMonths: number;
  timelineData: RoiPdfTimelinePoint[];
  breakEvenPoint: RoiPdfTimelinePoint | null;
  tasksChartData: RoiPdfTaskPoint[];
  lang: Lang;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * Упаковывает JPEG-изображение высокого разрешения в валидный одностраничный A4 PDF-документ (595.28 x 841.89 pt)
 */
function buildPdfFromJpegDataUrl(
  jpegDataUrl: string,
  pixelWidth: number,
  pixelHeight: number
): Blob {
  const base64 = jpegDataUrl.split(',')[1];
  const binaryStr = atob(base64);
  const imgBytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    imgBytes[i] = binaryStr.charCodeAt(i);
  }

  const pageWidthPt = 595.28;
  const pageHeightPt = 841.89;
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let currentOffset = 0;

  const pushStr = (str: string) => {
    const bytes = encoder.encode(str);
    chunks.push(bytes);
    currentOffset += bytes.length;
  };

  const pushBytes = (bytes: Uint8Array) => {
    chunks.push(bytes);
    currentOffset += bytes.length;
  };

  const startObj = (id: number) => {
    offsets[id] = currentOffset;
    pushStr(`${id} 0 obj\n`);
  };

  const endObj = () => {
    pushStr(`\nendobj\n`);
  };

  // Заголовок PDF 1.4
  pushStr(`%PDF-1.4\n%\xFF\xFF\xFF\xFF\n`);

  // 1: Catalog
  startObj(1);
  pushStr(`<< /Type /Catalog /Pages 2 0 R >>`);
  endObj();

  // 2: Pages
  startObj(2);
  pushStr(`<< /Type /Pages /Kids [3 0 R] /Count 1 >>`);
  endObj();

  // 3: Page (A4)
  startObj(3);
  pushStr(
    `<< /Type /Page /Parent 2 0 R /Resources << /XObject << /Im0 4 0 R >> >> /MediaBox [0 0 ${pageWidthPt} ${pageHeightPt}] /Contents 5 0 R >>`
  );
  endObj();

  // 4: XObject Image (JPEG)
  startObj(4);
  pushStr(
    `<< /Type /XObject /Subtype /Image /Width ${pixelWidth} /Height ${pixelHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`
  );
  pushBytes(imgBytes);
  pushStr(`\nendstream`);
  endObj();

  // 5: Page Content Stream
  const contentStream = `q\n${pageWidthPt} 0 0 ${pageHeightPt} 0 0 cm\n/Im0 Do\nQ\n`;
  const contentBytes = encoder.encode(contentStream);
  startObj(5);
  pushStr(`<< /Length ${contentBytes.length} >>\nstream\n`);
  pushBytes(contentBytes);
  pushStr(`endstream`);
  endObj();

  // Таблица перекрёстных ссылок (xref)
  const xrefOffset = currentOffset;
  pushStr(`xref\n0 6\n0000000000 65535 f \n`);
  for (let i = 1; i <= 5; i++) {
    const padded = String(offsets[i]).padStart(10, '0');
    pushStr(`${padded} 00000 n \n`);
  }

  pushStr(
    `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
  );

  return new Blob(chunks, { type: 'application/pdf' });
}

/**
 * Генерирует и скачивает светлый печатный A4 PDF-отчёт с графиком ROI,
 * помесячной таблицей экономии в BYN (~USD), этапами До/После и реквизитами Selor.
 */
export async function downloadRoiPdfReport(
  input: RoiPdfReportInput
): Promise<string> {
  const {
    service,
    packageName,
    investmentByn,
    weeklyHours,
    hourlyRateByn,
    reductionPct,
    savedHoursPerWeek,
    savedHoursPerMonth,
    savedBynPerMonth,
    sixMonthGrossSavingsByn,
    sixMonthNetBenefitByn,
    roiPercent,
    paybackMonths,
    timelineData,
    breakEvenPoint,
    tasksChartData,
    lang,
  } = input;

  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // Полотно A4 в высоком разрешении (1654 x 2339 px ~ 200 DPI)
  const W = 1654;
  const H = 2339;
  const PAD = 76;
  const CONTENT_W = W - PAD * 2;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  const fontSans = `'Golos Text', -apple-system, BlinkMacSystemFont, sans-serif`;
  const fontDisplay = `'Literata', Georgia, serif`;
  const fontMono = `'JetBrains Mono', monospace`;

  // 1. Чистый белый фон листа A4
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  // Верхняя акцентная полоса бренда
  const topGrad = ctx.createLinearGradient(0, 0, W, 0);
  topGrad.addColorStop(0, '#2E54F5');
  topGrad.addColorStop(0.55, '#3FCFE6');
  topGrad.addColorStop(1, '#0E9F7E');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, W, 14);

  let y = 62;

  // 2. ШАПКА ОТЧЁТА
  // Знак Selor
  drawRoundedRect(ctx, PAD, y, 58, 58, 16);
  ctx.fillStyle = '#2E54F5';
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold 32px ${fontDisplay}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S', PAD + 29, y + 30);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#07111C';
  ctx.font = `bold 34px ${fontDisplay}`;
  ctx.fillText('Selor', PAD + 76, y + 34);

  ctx.fillStyle = '#475569';
  ctx.font = `500 18px ${fontMono}`;
  ctx.fillText(
    lang === 'ru'
      ? '· ПРОГНОЗ ОКУПАЕМОСТИ АВТОМАТИЗАЦИИ (ROI REPORT)'
      : '· AUTOMATION ROI & TIME SAVINGS REPORT',
    PAD + 178,
    y + 32
  );

  // Дата справа
  const dateStr = new Date().toLocaleDateString(
    lang === 'ru' ? 'ru-RU' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );
  ctx.textAlign = 'right';
  ctx.fillStyle = '#475569';
  ctx.font = `500 18px ${fontMono}`;
  ctx.fillText(
    lang === 'ru' ? `Дата расчёта: ${dateStr}` : `Date: ${dateStr}`,
    W - PAD,
    y + 32
  );

  y += 84;

  // Информационная плашка направления и выбранного пакета
  drawRoundedRect(ctx, PAD, y, CONTENT_W, 118, 22);
  ctx.fillStyle = '#F4F7FB';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#DCE6F4';
  ctx.stroke();

  const investFormatted = formatBynUsd(investmentByn, lang);
  const monthlyFormatted = formatBynUsd(savedBynPerMonth, lang);
  const net6MoFormatted = formatBynUsd(Math.max(0, sixMonthNetBenefitByn), lang);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#2E54F5';
  ctx.font = `bold 16px ${fontMono}`;
  ctx.fillText(
    lang === 'ru' ? 'НАПРАВЛЕНИЕ И ПАКЕТ ВНЕДРЕНИЯ' : 'SERVICE & IMPLEMENTATION PACKAGE',
    PAD + 30,
    y + 36
  );

  ctx.fillStyle = '#07111C';
  ctx.font = `bold 30px ${fontDisplay}`;
  ctx.fillText(
    `${service.title[lang]} — «${packageName}»`,
    PAD + 30,
    y + 74
  );

  ctx.fillStyle = '#33465B';
  ctx.font = `400 18px ${fontSans}`;
  ctx.fillText(
    lang === 'ru'
      ? `Вводные задачи: ручная работа ${weeklyHours} ч/нед · ставка ${hourlyRateByn} BYN/ч · сокращение рутины −${reductionPct}%`
      : `Inputs: manual load ${weeklyHours} hrs/wk · rate ${hourlyRateByn} BYN/hr · task reduction −${reductionPct}%`,
    PAD + 30,
    y + 102
  );

  // Стоимость внедрения справа в плашке
  ctx.textAlign = 'right';
  ctx.fillStyle = '#475569';
  ctx.font = `500 16px ${fontMono}`;
  ctx.fillText(
    lang === 'ru' ? 'СТОИМОСТЬ ВНЕДРЕНИЯ' : 'IMPLEMENTATION COST',
    W - PAD - 30,
    y + 38
  );
  ctx.fillStyle = '#2E54F5';
  ctx.font = `bold 32px ${fontDisplay}`;
  ctx.fillText(investFormatted.bynText, W - PAD - 30, y + 76);
  ctx.fillStyle = '#475569';
  ctx.font = `500 18px ${fontMono}`;
  ctx.fillText(investFormatted.usdText, W - PAD - 30, y + 102);

  y += 146;

  // 3. 4 КАРТОЧКИ КЛЮЧЕВЫХ МЕТРИК (KPI)
  const kpiGap = 24;
  const kpiW = (CONTENT_W - kpiGap * 3) / 4;
  const kpiH = 148;

  const kpiItems = [
    {
      label: lang === 'ru' ? 'ЭКОНОМИЯ ВРЕМЕНИ' : 'TIME SAVED',
      value: `${savedHoursPerMonth} ${lang === 'ru' ? 'ч / мес' : 'hrs / mo'}`,
      sub:
        lang === 'ru'
          ? `~${savedHoursPerWeek} ч/нед · ${(savedHoursPerMonth / 8).toFixed(1)} раб. дн./мес`
          : `~${savedHoursPerWeek} hrs/wk · ${(savedHoursPerMonth / 8).toFixed(1)} workdays/mo`,
      accent: '#2E54F5',
    },
    {
      label: lang === 'ru' ? 'СОКРАЩЕНИЕ РУТИНЫ' : 'TASK REDUCTION',
      value: `−${reductionPct}%`,
      sub:
        lang === 'ru'
          ? `Выгода: ${monthlyFormatted.bynText}/мес (${monthlyFormatted.usdText})`
          : `Value: ${monthlyFormatted.bynText}/mo (${monthlyFormatted.usdText})`,
      accent: '#0E9F7E',
    },
    {
      label: lang === 'ru' ? 'ТОЧКА ОКУПАЕМОСТИ' : 'BREAK-EVEN POINT',
      value:
        paybackMonths <= 0.3
          ? lang === 'ru'
            ? '< 2 нед.'
            : '< 2 wks'
          : `~${paybackMonths} ${lang === 'ru' ? 'мес.' : 'mo'}`,
      sub: breakEvenPoint
        ? lang === 'ru'
          ? `Выход в плюс на точке «${breakEvenPoint.month}»`
          : `Break-even reached at "${breakEvenPoint.month}"`
        : lang === 'ru'
        ? `За пределами 6-месячного окна`
        : `Beyond 6-month window`,
      accent: '#0284C7',
    },
    {
      label: lang === 'ru' ? 'ЧИСТЫЙ ЭФФЕКТ ЗА 6 МЕС.' : '6-MO NET BENEFIT',
      value: `${sixMonthNetBenefitByn >= 0 ? '+' : '−'}${net6MoFormatted.bynText}`,
      sub: `${net6MoFormatted.usdText} · ROI ${
        roiPercent >= 0 ? `+${roiPercent}%` : `${roiPercent}%`
      }`,
      accent: '#2E54F5',
    },
  ];

  kpiItems.forEach((item, idx) => {
    const kx = PAD + idx * (kpiW + kpiGap);
    drawRoundedRect(ctx, kx, y, kpiW, kpiH, 20);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = idx === 3 ? '#2E54F5' : '#DCE6F4';
    ctx.stroke();

    // Верхний цветовой индикатор карточки
    ctx.fillStyle = item.accent;
    ctx.fillRect(kx + 24, y, kpiW - 48, 5);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#475569';
    ctx.font = `bold 15px ${fontMono}`;
    ctx.fillText(item.label, kx + 24, y + 40);

    ctx.fillStyle = idx === 1 ? '#0E9F7E' : idx === 3 ? '#2E54F5' : '#07111C';
    ctx.font = `bold 34px ${fontDisplay}`;
    ctx.fillText(item.value, kx + 24, y + 88);

    ctx.fillStyle = '#475569';
    ctx.font = `500 15px ${fontMono}`;
    ctx.fillText(item.sub, kx + 24, y + 124);
  });

  y += kpiH + 34;

  // 4. ГРАФИК ОКУПАЕМОСТИ (ROI) ЗА 6 МЕСЯЦЕВ С ПЕРЕКРЕСТИЕМ BREAK-EVEN
  const chartBoxH = 560;
  drawRoundedRect(ctx, PAD, y, CONTENT_W, chartBoxH, 24);
  ctx.fillStyle = '#F8FAFC';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#DCE6F4';
  ctx.stroke();

  // Заголовок графика и легенда
  ctx.textAlign = 'left';
  ctx.fillStyle = '#2E54F5';
  ctx.font = `bold 16px ${fontMono}`;
  ctx.fillText(
    lang === 'ru'
      ? 'ГРАФИК 1 · НАКОПИТЕЛЬНАЯ ЭКОНОМИЯ И ТОЧКА ОКУПАЕМОСТИ (6 МЕСЯЦЕВ, BYN)'
      : 'CHART 1 · CUMULATIVE SAVINGS & BREAK-EVEN PROJECTION (6 MONTHS, BYN)',
    PAD + 32,
    y + 40
  );

  ctx.fillStyle = '#33465B';
  ctx.font = `400 17px ${fontSans}`;
  ctx.fillText(
    breakEvenPoint
      ? lang === 'ru'
        ? `Формула: Накопленные часы × ${hourlyRateByn} BYN/ч − ${investmentByn} BYN · Перекрестие отмечает выход в плюс на точке «${breakEvenPoint.month}» (~${paybackMonths} мес.)`
        : `Formula: Cumulative hrs × ${hourlyRateByn} BYN/hr − ${investmentByn} BYN · Crosshair marks break-even at "${breakEvenPoint.month}" (~${paybackMonths} mo)`
      : lang === 'ru'
      ? `Формула: Накопленные часы × ${hourlyRateByn} BYN/ч − ${investmentByn} BYN · Полная окупаемость на ~${paybackMonths} мес.`
      : `Formula: Cumulative hrs × ${hourlyRateByn} BYN/hr − ${investmentByn} BYN · Break-even at ~${paybackMonths} mo`,
    PAD + 32,
    y + 68
  );

  // Координатная область графика
  const plotLeft = PAD + 110;
  const plotRight = W - PAD - 48;
  const plotTop = y + 110;
  const plotBottom = y + chartBoxH - 64;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;

  const allValues = timelineData.flatMap((d) => [
    d.cumulativeSavings,
    d.netBalance,
    d.investment,
  ]);
  const rawMin = Math.min(0, ...allValues);
  const rawMax = Math.max(investmentByn * 1.25, ...allValues, 500);
  const yMin = Math.floor(rawMin / 200) * 200;
  const yMax = Math.ceil((rawMax * 1.1) / 200) * 200;
  const yRange = Math.max(200, yMax - yMin);

  const getX = (idx: number) =>
    plotLeft + (idx / (timelineData.length - 1)) * plotW;
  const getY = (val: number) =>
    plotBottom - ((val - yMin) / yRange) * plotH;

  // Горизонтальные линии сетки (5 делений)
  const gridSteps = 5;
  for (let i = 0; i <= gridSteps; i++) {
    const val = Math.round(yMin + (yRange * i) / gridSteps);
    const gy = getY(val);
    ctx.beginPath();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = val === 0 ? '#94A3B8' : '#E2E8F0';
    ctx.lineWidth = val === 0 ? 2 : 1.5;
    ctx.moveTo(plotLeft, gy);
    ctx.lineTo(plotRight, gy);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#64748B';
    ctx.font = `500 16px ${fontMono}`;
    ctx.fillText(`${val}`, plotLeft - 16, gy);
  }

  // Заливка под кривой накопленной экономии
  ctx.beginPath();
  timelineData.forEach((pt, idx) => {
    const px = getX(idx);
    const py = getY(pt.cumulativeSavings);
    if (idx === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.lineTo(getX(timelineData.length - 1), getY(0));
  ctx.lineTo(getX(0), getY(0));
  ctx.closePath();
  const areaGrad = ctx.createLinearGradient(0, plotTop, 0, plotBottom);
  areaGrad.addColorStop(0, 'rgba(14, 159, 126, 0.26)');
  areaGrad.addColorStop(1, 'rgba(46, 84, 245, 0.02)');
  ctx.fillStyle = areaGrad;
  ctx.fill();

  // Горизонтальная линия порога инвестиций (Cost ReferenceLine)
  const investY = getY(investmentByn);
  ctx.beginPath();
  ctx.setLineDash([10, 8]);
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 2.5;
  ctx.moveTo(plotLeft, investY);
  ctx.lineTo(plotRight, investY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = '#0284C7';
  ctx.font = `bold 16px ${fontMono}`;
  ctx.fillText(
    lang === 'ru'
      ? `Порог внедрения: ${investmentByn} BYN`
      : `Implementation cost: ${investmentByn} BYN`,
    plotRight - 8,
    investY - 8
  );

  // Вертикальная линия перекрестия окупаемости (Break-even Crosshair)
  if (breakEvenPoint) {
    const bx = getX(breakEvenPoint.monthIndex);
    ctx.beginPath();
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = '#0E9F7E';
    ctx.lineWidth = 2.5;
    ctx.moveTo(bx, plotTop);
    ctx.lineTo(bx, plotBottom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Бейдж над вертикальной линией перекрестия
    const badgeLabel =
      lang === 'ru'
        ? `Окупаемость · ~${paybackMonths} мес.`
        : `Break-even · ~${paybackMonths} mo`;
    ctx.font = `bold 15px ${fontMono}`;
    const badgeW = ctx.measureText(badgeLabel).width + 28;
    const badgeX = Math.min(
      Math.max(plotLeft, bx - badgeW / 2),
      plotRight - badgeW
    );
    drawRoundedRect(ctx, badgeX, plotTop - 32, badgeW, 28, 14);
    ctx.fillStyle = '#DCFCE7';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#0E9F7E';
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#065F46';
    ctx.fillText(badgeLabel, badgeX + badgeW / 2, plotTop - 18);
  }

  // Линия чистого баланса (Net Balance)
  ctx.beginPath();
  ctx.strokeStyle = '#2E54F5';
  ctx.lineWidth = 3.5;
  timelineData.forEach((pt, idx) => {
    const px = getX(idx);
    const py = getY(pt.netBalance);
    if (idx === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();

  // Кривая накопленной экономии (Cumulative Savings)
  ctx.beginPath();
  ctx.strokeStyle = '#0E9F7E';
  ctx.lineWidth = 4.5;
  timelineData.forEach((pt, idx) => {
    const px = getX(idx);
    const py = getY(pt.cumulativeSavings);
    if (idx === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();

  // Точки и подписи значений на графике
  timelineData.forEach((pt, idx) => {
    const px = getX(idx);
    const pySav = getY(pt.cumulativeSavings);
    const pyNet = getY(pt.netBalance);

    // Точка на линии чистого баланса
    ctx.beginPath();
    ctx.arc(px, pyNet, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#2E54F5';
    ctx.stroke();

    // Точка на кривой накопленной экономии (с особым маркером на месяце окупаемости)
    if (pt.isFirstBreakEvenMonth) {
      ctx.beginPath();
      ctx.arc(px, pySav, 18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(14, 159, 126, 0.20)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, pySav, 11, 0, Math.PI * 2);
      ctx.fillStyle = '#0E9F7E';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(px, pySav, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#0E9F7E';
      ctx.stroke();
    }

    // Числовая подпись накопленной экономии над точкой
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = pt.isFirstBreakEvenMonth ? '#065F46' : '#0F172A';
    ctx.font = `${pt.isFirstBreakEvenMonth ? 'bold' : '500'} 15px ${fontMono}`;
    ctx.fillText(`${pt.cumulativeSavings}`, px, pySav - 14);

    // Подпись месяца по оси X
    ctx.textBaseline = 'top';
    ctx.fillStyle = pt.isFirstBreakEvenMonth ? '#0E9F7E' : '#33465B';
    ctx.font = `${pt.isFirstBreakEvenMonth ? 'bold' : '500'} 16px ${fontSans}`;
    ctx.fillText(pt.month, px, plotBottom + 16);
  });

  y += chartBoxH + 34;

  // 5. ДВУХКОЛОНОЧНЫЙ БЛОК: СЛЕВА ПОМЕСЯЧНАЯ ТАБЛИЦА (BYN / ~USD), СПРАВА ЭТАПЫ ДО/ПОСЛЕ
  const colGap = 28;
  const leftColW = Math.round(CONTENT_W * 0.56);
  const rightColW = CONTENT_W - leftColW - colGap;
  const bottomBoxH = 660;

  // 5А. Левая карточка: Помесячная таблица расчёта экономии за 6 месяцев
  drawRoundedRect(ctx, PAD, y, leftColW, bottomBoxH, 22);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#DCE6F4';
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#2E54F5';
  ctx.font = `bold 15px ${fontMono}`;
  ctx.fillText(
    lang === 'ru'
      ? 'ТАБЛИЦА 1 · ПОМЕСЯЧНЫЙ РАСЧЁТ ЭКОНОМИИ И ROI (BYN / ~USD)'
      : 'TABLE 1 · 6-MONTH CUMULATIVE SAVINGS & NET ROI (BYN / ~USD)',
    PAD + 28,
    y + 38
  );

  // Шапка таблицы
  const tblTop = y + 60;
  const rowH = 74;
  ctx.fillStyle = '#F1F5F9';
  drawRoundedRect(ctx, PAD + 20, tblTop, leftColW - 40, 44, 12);
  ctx.fill();

  const col1X = PAD + 36;
  const col2X = PAD + 195;
  const col3X = PAD + 415;
  const col4X = PAD + leftColW - 36;

  ctx.fillStyle = '#475569';
  ctx.font = `bold 14px ${fontMono}`;
  ctx.textAlign = 'left';
  ctx.fillText(lang === 'ru' ? 'ПЕРИОД' : 'MONTH', col1X, tblTop + 28);
  ctx.fillText(
    lang === 'ru' ? 'ЧАСЫ (РАБ. ДНИ)' : 'HOURS (DAYS)',
    col2X,
    tblTop + 28
  );
  ctx.fillText(
    lang === 'ru' ? 'ВАЛОВАЯ ЭКОНОМИЯ' : 'GROSS SAVINGS',
    col3X,
    tblTop + 28
  );
  ctx.textAlign = 'right';
  ctx.fillText(
    lang === 'ru' ? 'ЧИСТЫЙ ROI (BYN / ~USD)' : 'NET ROI (BYN / ~USD)',
    col4X,
    tblTop + 28
  );

  timelineData.forEach((row, idx) => {
    const ry = tblTop + 48 + idx * rowH;

    if (row.isFirstBreakEvenMonth) {
      drawRoundedRect(ctx, PAD + 20, ry + 2, leftColW - 40, rowH - 6, 12);
      ctx.fillStyle = '#ECFDF5';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#A7F3D0';
      ctx.stroke();
    } else if (idx < timelineData.length - 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      ctx.moveTo(PAD + 28, ry + rowH);
      ctx.lineTo(PAD + leftColW - 28, ry + rowH);
      ctx.stroke();
    }

    const grossFmt = formatBynUsd(row.cumulativeSavings, lang);
    const netAbsFmt = formatBynUsd(Math.abs(row.netBalance), lang);

    ctx.textAlign = 'left';
    ctx.fillStyle = row.isFirstBreakEvenMonth ? '#065F46' : '#07111C';
    ctx.font = `bold 17px ${fontSans}`;
    ctx.fillText(row.month, col1X, ry + 32);

    if (row.isFirstBreakEvenMonth) {
      ctx.fillStyle = '#0E9F7E';
      ctx.font = `bold 12px ${fontMono}`;
      ctx.fillText(
        lang === 'ru' ? '★ Окупаемость' : '★ Break-even',
        col1X,
        ry + 54
      );
    }

    ctx.fillStyle = '#33465B';
    ctx.font = `500 16px ${fontMono}`;
    ctx.fillText(
      `${row.cumulativeHoursSaved} ${lang === 'ru' ? 'ч' : 'h'} (${
        row.workdaysSaved
      } ${lang === 'ru' ? 'дн.' : 'd'})`,
      col2X,
      ry + 40
    );

    ctx.fillStyle = '#07111C';
    ctx.font = `500 16px ${fontMono}`;
    ctx.fillText(
      `${grossFmt.bynText} (${grossFmt.usdText})`,
      col3X,
      ry + 40
    );

    ctx.textAlign = 'right';
    ctx.fillStyle = row.netBalance >= 0 ? '#0E9F7E' : '#64748B';
    ctx.font = `bold 17px ${fontMono}`;
    ctx.fillText(
      `${row.netBalance >= 0 ? '+' : '−'}${netAbsFmt.bynText} (${
        netAbsFmt.usdText
      })`,
      col4X,
      ry + 40
    );
  });

  // 5Б. Правая карточка: Сравнение времени по этапам задач До и После автоматизации
  const rightX = PAD + leftColW + colGap;
  drawRoundedRect(ctx, rightX, y, rightColW, bottomBoxH, 22);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#DCE6F4';
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#2E54F5';
  ctx.font = `bold 15px ${fontMono}`;
  ctx.fillText(
    lang === 'ru'
      ? 'ТАБЛИЦА 2 · СОКРАЩЕНИЕ ЗАДАЧ ДО И ПОСЛЕ'
      : 'TABLE 2 · STAGE REDUCTION BEFORE & AFTER',
    rightX + 28,
    y + 38
  );

  ctx.fillStyle = '#475569';
  ctx.font = `400 15px ${fontSans}`;
  ctx.fillText(
    lang === 'ru'
      ? 'Затраты минут в неделю и экономия в месяц по операциям:'
      : 'Weekly minutes and monthly savings per workflow stage:',
    rightX + 28,
    y + 66
  );

  const maxTaskMin = Math.max(
    60,
    ...tasksChartData.map((t) => t.manual)
  );
  const stageBlockH = 126;
  const stageStartY = y + 92;

  tasksChartData.forEach((stage, idx) => {
    const sy = stageStartY + idx * stageBlockH;
    const stageFmt = formatBynUsd(stage.savedBynPerMonth, lang);

    drawRoundedRect(ctx, rightX + 22, sy, rightColW - 44, stageBlockH - 14, 16);
    ctx.fillStyle = '#F8FAFC';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#E2E8F0';
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#07111C';
    ctx.font = `bold 18px ${fontSans}`;
    ctx.fillText(stage.name, rightX + 40, sy + 32);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#0E9F7E';
    ctx.font = `bold 16px ${fontMono}`;
    ctx.fillText(
      `−${stage.stageReductionPct}% · +${stageFmt.bynText}/${
        lang === 'ru' ? 'мес' : 'mo'
      }`,
      rightX + rightColW - 40,
      sy + 32
    );

    // Полоса До (вручную) vs После (автоматизация)
    const barMaxW = rightColW - 260;
    const manualBarW = Math.max(18, (stage.manual / maxTaskMin) * barMaxW);
    const autoBarW = Math.max(10, (stage.automated / maxTaskMin) * barMaxW);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748B';
    ctx.font = `500 14px ${fontMono}`;
    ctx.fillText(
      lang === 'ru' ? 'До:' : 'Before:',
      rightX + 40,
      sy + 64
    );
    drawRoundedRect(ctx, rightX + 115, sy + 51, manualBarW, 16, 8);
    ctx.fillStyle = '#94A3B8';
    ctx.fill();
    ctx.fillStyle = '#475569';
    ctx.fillText(
      `${stage.manual} ${lang === 'ru' ? 'мин/нед' : 'm/wk'}`,
      rightX + 125 + manualBarW,
      sy + 64
    );

    ctx.fillStyle = '#0E9F7E';
    ctx.fillText(
      lang === 'ru' ? 'После:' : 'After:',
      rightX + 40,
      sy + 92
    );
    drawRoundedRect(ctx, rightX + 115, sy + 79, autoBarW, 16, 8);
    ctx.fillStyle = '#0E9F7E';
    ctx.fill();
    ctx.fillStyle = '#065F46';
    ctx.font = `bold 14px ${fontMono}`;
    ctx.fillText(
      `${stage.automated} ${lang === 'ru' ? 'мин/нед' : 'm/wk'} (−${
        stage.savedHoursPerMonth
      } ${lang === 'ru' ? 'ч/мес' : 'h/mo'})`,
      rightX + 125 + autoBarW,
      sy + 92
    );
  });

  // Итоговая плашка внизу правой колонки
  const summaryBoxY = y + bottomBoxH - 64;
  drawRoundedRect(ctx, rightX + 22, summaryBoxY, rightColW - 44, 46, 12);
  ctx.fillStyle = '#EFF6FF';
  ctx.fill();
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1E3A8A';
  ctx.font = `bold 15px ${fontMono}`;
  ctx.fillText(
    lang === 'ru'
      ? `Итого за 6 мес.: ~${savedHoursPerMonth * 6} ч (${(
          (savedHoursPerMonth * 6) /
          8
        ).toFixed(1)} раб. дн.) · Валовая выгода: ${sixMonthGrossSavingsByn} BYN`
      : `6-Mo Total: ~${savedHoursPerMonth * 6} hrs (${(
          (savedHoursPerMonth * 6) /
          8
        ).toFixed(1)} workdays) · Gross: ${sixMonthGrossSavingsByn} BYN`,
    rightX + 38,
    summaryBoxY + 29
  );

  y += bottomBoxH + 34;

  // 6. ПОДВАЛ ОТЧЁТА С КОНТАКТНЫМИ РЕКВИЗИТАМИ СТУДИИ SELOR
  drawRoundedRect(ctx, PAD, y, CONTENT_W, 108, 20);
  ctx.fillStyle = '#07111C';
  ctx.fill();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#3FD9B4';
  ctx.font = `bold 16px ${fontMono}`;
  ctx.fillText(
    lang === 'ru'
      ? 'СТУДИЯ РАЗРАБОТКИ И АВТОМАТИЗАЦИИ SELOR · КОНТАКТЫ ДЛЯ СОГЛАСОВАНИЯ ТЗ'
      : 'SELOR STUDIO · CONTACTS FOR SPECIFICATION & LAUNCH',
    PAD + 30,
    y + 38
  );

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold 20px ${fontMono}`;
  ctx.fillText(
    'Telegram: @selor_studio   ·   Email: hello@selor.by   ·   Web: selor.by',
    PAD + 30,
    y + 72
  );

  ctx.textAlign = 'right';
  ctx.fillStyle = '#A9B6CA';
  ctx.font = `400 15px ${fontMono}`;
  ctx.fillText(
    lang === 'ru'
      ? 'Курс расчёта: 1 USD = 3.25 BYN · Оценка ТЗ бесплатно'
      : 'Exchange rate: 1 USD = 3.25 BYN · Free specification estimate',
    W - PAD - 30,
    y + 72
  );

  // Конвертация в валидный A4 PDF и скачивание
  const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const pdfBlob = buildPdfFromJpegDataUrl(jpegDataUrl, W, H);
  const fileName = `selor-roi-report-${service.id}.pdf`;

  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);

  return fileName;
}
