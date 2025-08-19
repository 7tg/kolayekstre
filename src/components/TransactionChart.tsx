import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { Transaction } from '../types';

interface TransactionChartProps {
  transactions: Transaction[];
}

interface MonthlyData {
  income: number;
  expense: number;
  net: number;
}

export default function TransactionChart({ transactions }: TransactionChartProps) {
  const { t, i18n } = useTranslation();
  const chartData = useMemo(() => {
    const monthlyData: Record<string, MonthlyData> = {};
    
    transactions.forEach(transaction => {
      if (transaction.date) {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { income: 0, expense: 0, net: 0 };
        }
        
        if (transaction.amount > 0) {
          monthlyData[monthKey].income += transaction.amount;
        } else {
          monthlyData[monthKey].expense += Math.abs(transaction.amount);
        }
        
        monthlyData[monthKey].net = monthlyData[monthKey].income - monthlyData[monthKey].expense;
      }
    });

    const sortedEntries = Object.entries(monthlyData).sort(([a], [b]) => a.localeCompare(b));
    
    return {
      months: sortedEntries.map(([monthKey]) => formatMonth(monthKey)),
      income: sortedEntries.map(([_, data]) => data.income),
      expense: sortedEntries.map(([_, data]) => data.expense),
      net: sortedEntries.map(([_, data]) => data.net),
    };
  }, [transactions]);

  const formatMonth = (monthKey: string): string => {
    const [year, month] = monthKey.split('-');
    const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(locale, { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const formatCurrency = (amount: number): string => {
    const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Box>
      <Typography variant="h4" component="h3" gutterBottom sx={{ mb: 3 }}>
        {t('monthlyTransactions')}
      </Typography>
      
      {chartData.months.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            {t('noChartData')}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ width: '100%', height: 400 }}>
          <BarChart
            xAxis={[
              {
                id: 'months',
                data: chartData.months,
                scaleType: 'band',
              },
            ]}
            series={[
              {
                id: 'income',
                label: t('income'),
                data: chartData.income,
                color: '#4caf50',
                valueFormatter: (value) => formatCurrency(value as number),
              },
              {
                id: 'expense',
                label: t('expense'), 
                data: chartData.expense,
                color: '#f44336',
                valueFormatter: (value) => formatCurrency(value as number),
              },
            ]}
            margin={{ left: 100, bottom: 50, top: 50, right: 50 }}
            grid={{ horizontal: true }}
          />
        </Box>
      )}
    </Box>
  );
}