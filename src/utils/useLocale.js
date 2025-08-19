import { useMemo } from 'react';

export function useLocale() {
  return useMemo(() => {
    // Use Turkish locale for banking app
    const userLocale = 'tr-TR';
    
    return {
      locale: userLocale,
      
      formatCurrency: (amount, currency = 'TRY') => {
        return new Intl.NumberFormat(userLocale, {
          style: 'currency',
          currency: currency
        }).format(amount);
      },
      
      formatCurrencyCompact: (amount, currency = 'TRY') => {
        return new Intl.NumberFormat(userLocale, {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(amount);
      },
      
      formatDate: (date, options = {}) => {
        return new Date(date).toLocaleDateString(userLocale, options);
      },
      
      formatNumber: (number) => {
        return new Intl.NumberFormat(userLocale).format(number);
      },
      
      formatMonth: (monthKey) => {
        const [year, month] = monthKey.split('-');
        return new Date(year, month - 1).toLocaleDateString(userLocale, { 
          year: 'numeric', 
          month: 'short' 
        });
      }
    };
  }, []);
}

export default useLocale;