import { useMemo } from 'react';

interface LocaleUtils {
  locale: string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatCurrencyCompact: (amount: number, currency?: string) => string;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (number: number) => string;
  formatMonth: (monthKey: string) => string;
}

export function useLocale(): LocaleUtils {
  return useMemo(() => {
    // Use Turkish locale for banking app
    const userLocale = 'tr-TR';
    
    return {
      locale: userLocale,
      
      formatCurrency: (amount: number, currency: string = 'TRY'): string => {
        return new Intl.NumberFormat(userLocale, {
          style: 'currency',
          currency: currency
        }).format(amount);
      },
      
      formatCurrencyCompact: (amount: number, currency: string = 'TRY'): string => {
        return new Intl.NumberFormat(userLocale, {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(amount);
      },
      
      formatDate: (date: Date | string, options: Intl.DateTimeFormatOptions = {}): string => {
        return new Date(date).toLocaleDateString(userLocale, options);
      },
      
      formatNumber: (number: number): string => {
        return new Intl.NumberFormat(userLocale).format(number);
      },
      
      formatMonth: (monthKey: string): string => {
        const [year, month] = monthKey.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(userLocale, { 
          year: 'numeric', 
          month: 'short' 
        });
      }
    };
  }, []);
}

export default useLocale;