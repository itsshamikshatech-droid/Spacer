

export function formatCurrency(amount: number, currency = "INR", locale = "en-IN") {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
}
