import { useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip 
} from '@mui/material';
import { 
  Analytics as AnalyticsIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  AccountBalance as BalanceIcon,
  Calculate as AverageIcon,
  CalendarMonth as DateIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material';
import { Transaction } from '../types';

interface StatsPanelProps {
  transactions: Transaction[];
}

interface StatsData {
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  averageTransaction: number;
  dateRange: { earliest: Date; latest: Date } | null;
  bankTypes: string[];
}

export default function StatsPanel({ transactions }: StatsPanelProps) {
  const stats = useMemo((): StatsData => {
    if (!transactions || transactions.length === 0) {
      return {
        totalTransactions: 0,
        totalIncome: 0,
        totalExpenses: 0,
        netAmount: 0,
        averageTransaction: 0,
        dateRange: null,
        bankTypes: []
      };
    }

    let totalIncome = 0;
    let totalExpenses = 0;
    const bankTypes = new Set<string>();
    let earliestDate: Date | null = null;
    let latestDate: Date | null = null;

    transactions.forEach(transaction => {
      if (transaction.amount > 0) {
        totalIncome += transaction.amount;
      } else {
        totalExpenses += Math.abs(transaction.amount);
      }
      
      if (transaction.bankType) {
        bankTypes.add(transaction.bankType);
      }
      
      if (transaction.date) {
        const date = new Date(transaction.date);
        if (!earliestDate || date < earliestDate) {
          earliestDate = date;
        }
        if (!latestDate || date > latestDate) {
          latestDate = date;
        }
      }
    });

    return {
      totalTransactions: transactions.length,
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      averageTransaction: transactions.length > 0 ? 
        transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length : 0,
      dateRange: earliestDate && latestDate ? { earliest: earliestDate, latest: latestDate } : null,
      bankTypes: Array.from(bankTypes)
    };
  }, [transactions]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('tr-TR');
  };

  const StatCard = ({ icon, label, value, color = 'primary' }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color?: 'primary' | 'success' | 'error' | 'warning';
  }) => (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            p: 1, 
            borderRadius: 1, 
            bgcolor: `${color}.light`, 
            color: `${color}.contrastText`,
            mr: 2,
            display: 'flex',
            alignItems: 'center'
          }}>
            {icon}
          </Box>
          <Typography variant="h6" component="div" color="text.secondary">
            {label}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" fontWeight="bold">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" component="h3" gutterBottom sx={{ mb: 3 }}>
        Özet İstatistikler
      </Typography>
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
        gap: 3,
        mb: 3
      }}>
        <StatCard
          icon={<AnalyticsIcon />}
          label="Toplam İşlem"
          value={stats.totalTransactions.toLocaleString('tr-TR')}
        />

        <StatCard
          icon={<IncomeIcon />}
          label="Toplam Gelir"
          value={formatCurrency(stats.totalIncome)}
          color="success"
        />

        <StatCard
          icon={<ExpenseIcon />}
          label="Toplam Gider"
          value={formatCurrency(stats.totalExpenses)}
          color="error"
        />

        <StatCard
          icon={<BalanceIcon />}
          label="Net Tutar"
          value={formatCurrency(stats.netAmount)}
          color={stats.netAmount >= 0 ? 'success' : 'error'}
        />

        <StatCard
          icon={<AverageIcon />}
          label="Ortalama İşlem"
          value={formatCurrency(stats.averageTransaction)}
        />

        {stats.dateRange && (
          <StatCard
            icon={<DateIcon />}
            label="Tarih Aralığı"
            value={`${formatDate(stats.dateRange.earliest)} - ${formatDate(stats.dateRange.latest)}`}
          />
        )}
      </Box>

      {stats.bankTypes.length > 0 && (
        <Card elevation={2} sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ 
                p: 1, 
                borderRadius: 1, 
                bgcolor: 'primary.light', 
                color: 'primary.contrastText',
                mr: 2,
                display: 'flex',
                alignItems: 'center'
              }}>
                <BankIcon />
              </Box>
              <Typography variant="h6" component="div" color="text.secondary">
                Bankalar
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {stats.bankTypes.map((bank, index) => (
                <Chip 
                  key={index} 
                  label={bank} 
                  variant="outlined" 
                  color="primary" 
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}