import { useMemo } from 'react';
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
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Box>
      <Typography variant="h4" component="h3" gutterBottom sx={{ mb: 3 }}>
        Aylık Gelir-Gider Özeti
      </Typography>
      
      {chartData.months.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Grafik için yeterli veri bulunmuyor.
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
                label: 'Gelir',
                data: chartData.income,
                color: '#4caf50',
                valueFormatter: (value) => formatCurrency(value as number),
              },
              {
                id: 'expense',
                label: 'Gider', 
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