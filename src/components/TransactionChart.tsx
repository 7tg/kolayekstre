import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, useTheme } from '@mui/material';
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
  const theme = useTheme();
  
  const formatMonth = useCallback((monthKey: string): string => {
    const [year, month] = monthKey.split('-');
    const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(locale, { 
      year: 'numeric', 
      month: 'short' 
    });
  }, [i18n.language]);

  const formatCurrency = useCallback((amount: number): string => {
    const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, [i18n.language]);

  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        months: [],
        income: [],
        expense: [],
        net: [],
      };
    }

    const monthlyData: Record<string, MonthlyData> = {};
    
    transactions.forEach(transaction => {
      if (transaction.date && transaction.amount !== undefined && transaction.amount !== null) {
        try {
          const date = new Date(transaction.date);
          if (isNaN(date.getTime())) {
            console.warn('Invalid date found in transaction:', transaction);
            return;
          }
          
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
        } catch (error) {
          console.warn('Error processing transaction for chart:', transaction, error);
        }
      }
    });

    const sortedEntries = Object.entries(monthlyData).sort(([a], [b]) => a.localeCompare(b));
    
    return {
      months: sortedEntries.map(([monthKey]) => formatMonth(monthKey)),
      income: sortedEntries.map(([_, data]) => data.income),
      expense: sortedEntries.map(([_, data]) => data.expense),
      net: sortedEntries.map(([_, data]) => data.net),
    };
  }, [transactions, i18n.language, formatMonth]);

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
            width={undefined}
            height={400}
            xAxis={[
              {
                id: 'months',
                data: chartData.months,
                scaleType: 'band',
                colorMap: {
                  type: 'ordinal',
                  colors: [theme.palette.text.primary]
                }
              },
            ]}
            yAxis={[
              {
                colorMap: {
                  type: 'ordinal', 
                  colors: [theme.palette.text.primary]
                }
              }
            ]}
            series={[
              {
                id: 'income',
                label: t('income'),
                data: chartData.income,
                color: theme.palette.mode === 'dark' ? '#66bb6a' : '#4caf50',
                valueFormatter: (value) => formatCurrency(value as number),
              },
              {
                id: 'expense',
                label: t('expense'), 
                data: chartData.expense,
                color: theme.palette.mode === 'dark' ? '#ef5350' : '#f44336',
                valueFormatter: (value) => formatCurrency(value as number),
              },
            ]}
            margin={{ left: 100, bottom: 60, top: 50, right: 50 }}
            grid={{ horizontal: true }}
            sx={{
              '& .MuiChartsAxis-root': {
                '& .MuiChartsAxis-tickLabel': {
                  fill: theme.palette.text.primary,
                },
                '& .MuiChartsAxis-line': {
                  stroke: theme.palette.divider,
                },
                '& .MuiChartsAxis-tick': {
                  stroke: theme.palette.divider,
                },
              },
              '& .MuiChartsGrid-root': {
                '& .MuiChartsGrid-line': {
                  stroke: theme.palette.divider,
                  strokeOpacity: 0.3,
                },
              },
              '& .MuiChartsLegend-root': {
                '& .MuiChartsLegend-label': {
                  fill: theme.palette.text.primary,
                },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}