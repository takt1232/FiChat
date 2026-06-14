const CURRENCY_SYMBOL = '₱';
const LOCALE = 'en-PH';

export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat(LOCALE, {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  const sign = amount < 0 ? '-' : '';
  return `${sign}${CURRENCY_SYMBOL}${formatted}`;
}

export function formatCurrencyShort(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `${CURRENCY_SYMBOL}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${CURRENCY_SYMBOL}${(amount / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
}
