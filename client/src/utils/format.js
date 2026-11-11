// ==============================================================================
// FICHIER : client/src/utils/format.js
// KHEDMETOU : Formatage wa7ed lel flous, les dates wel pourcentages fi kol l'app
// (9bal kan formatTND m3awed fi 6 fichiers).
// ==============================================================================

const MINUS = '−'; // signe moins typographique (−), a9ra mel tiret (-)

const exactFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1
});

const wholeFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

const toNumber = (value) => Number(value) || 0;

// Montant exact : "37,320.00 TND" (tableaux, détails)
export const formatTND = (amount) => `${exactFormatter.format(toNumber(amount))} TND`;

// Montant signé : "+1,200.00 TND" / "−1,200.00 TND"
export const formatSignedTND = (amount) => {
  const n = toNumber(amount);
  if (n === 0) return formatTND(0);
  return `${n > 0 ? '+' : MINUS}${formatTND(Math.abs(n))}`;
};

// Montant court pour les cartes KPI : "37.3K TND", "950 TND"
export const formatCompactTND = (amount) => {
  const n = toNumber(amount);
  const sign = n < 0 ? MINUS : '';
  const abs = Math.abs(n);
  const body = abs < 10000 ? wholeFormatter.format(abs) : compactFormatter.format(abs);
  return `${sign}${body} TND`;
};

// Montant arrondi lel texte (phrases) : "10,897 TND"
export const formatWholeTND = (amount) => {
  const n = toNumber(amount);
  return `${n < 0 ? MINUS : ''}${wholeFormatter.format(Math.abs(n))} TND`;
};

// Date : "1 Dec 2026"
export const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// Période intelligente : "1–2 Dec 2026", "28 Nov – 2 Dec 2026", "30 Dec 2026 – 2 Jan 2027"
export const formatDateRange = (start, end) => {
  if (!start) return '';
  if (!end) return formatDate(start);
  const s = new Date(start);
  const e = new Date(end);
  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();

  if (sameMonth && s.getDate() === e.getDate()) return formatDate(s);
  if (sameMonth) {
    return `${s.getDate()}–${e.getDate()} ${e.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`;
  }
  if (sameYear) {
    return `${s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${formatDate(e)}`;
  }
  return `${formatDate(s)} – ${formatDate(e)}`;
};

// Variation en % entre deux périodes : null ken ma fammech base de comparaison
export const percentChange = (current, previous) => {
  const c = toNumber(current);
  const p = toNumber(previous);
  if (p === 0) return null;
  return ((c - p) / Math.abs(p)) * 100;
};

// Taux d'utilisation du budget (0 → 100+), null ken ma fammech budget
export const budgetUsage = (spent, budget) => {
  const b = toNumber(budget);
  if (b <= 0) return null;
  return (toNumber(spent) / b) * 100;
};
