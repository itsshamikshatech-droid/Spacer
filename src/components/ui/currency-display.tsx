
'use client';

import { formatCurrency } from '@/lib/formatCurrency';

interface CurrencyDisplayProps {
    amount: number;
    currency?: string;
    locale?: string;
    className?: string;
}

export function CurrencyDisplay({ amount, currency = "INR", locale = "en-IN", className }: CurrencyDisplayProps) {
    const formatted = formatCurrency(amount, currency, locale);
    const symbol = formatted.replace(/[\d,.\s-]/g, '');
    const number = formatted.replace(/[^\d,.-]/g, '');

    return (
        <span className={className}>
            <span style={{ fontFamily: 'sans-serif' }}>{symbol}</span>
            {number}
        </span>
    );
}
