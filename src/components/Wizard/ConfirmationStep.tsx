import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  Description as FileIcon,
  AccountBalance as BankIcon,
  CalendarToday as DateIcon,
  Assessment as StatsIcon
} from '@mui/icons-material';
import { ParseResult } from '../../types';

interface ConfirmationStepProps {
  parseResult: ParseResult;
  selectedTransactions: Set<string>;
  fileName: string;
}

export default function ConfirmationStep({
  parseResult,
  selectedTransactions,
  fileName
}: ConfirmationStepProps) {
  const { t, i18n } = useTranslation();

  const selectedTransactionsList = useMemo(() => {
    return parseResult.transactions.filter(t => selectedTransactions.has(t.id));
  }, [parseResult.transactions, selectedTransactions]);

  const stats = useMemo(() => {
    const income = selectedTransactionsList.filter(t => t.amount > 0);
    const expense = selectedTransactionsList.filter(t => t.amount < 0);
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expense.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const dates = selectedTransactionsList
      .map(t => t.date)
      .filter(date => date !== null) as Date[];
    
    const dateRange = dates.length > 0 ? {
      start: new Date(Math.min(...dates.map(d => d.getTime()))),
      end: new Date(Math.max(...dates.map(d => d.getTime())))
    } : null;

    return {
      totalTransactions: selectedTransactionsList.length,
      totalIncome,
      totalExpense,
      netAmount: totalIncome - totalExpense,
      incomeCount: income.length,
      expenseCount: expense.length,
      dateRange
    };
  }, [selectedTransactionsList]);

  const formatCurrency = (amount: number): string => {
    const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const formatDate = (date: Date): string => {
    const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Box>
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('wizard.readyToImport')}
        </Typography>
        <Typography variant="body2">
          {t('wizard.reviewDataBelow')}
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* File Information */}
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FileIcon color="primary" />
              {t('wizard.fileInformation')}
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <FileIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t('wizard.fileName')}
                  secondary={fileName}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <BankIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t('wizard.bankType')}
                  secondary={parseResult.bankType}
                />
              </ListItem>
              
              {stats.dateRange && (
                <ListItem>
                  <ListItemIcon>
                    <DateIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('wizard.dateRange')}
                    secondary={`${formatDate(stats.dateRange.start)} - ${formatDate(stats.dateRange.end)}`}
                  />
                </ListItem>
              )}
            </List>
          </Paper>

          {/* Transaction Statistics */}
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StatsIcon color="primary" />
              {t('wizard.importSummary')}
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('wizard.totalTransactions')}
                </Typography>
                <Chip
                  icon={<CheckIcon />}
                  label={`${stats.totalTransactions} ${t('wizard.transactions')}`}
                  color="primary"
                  size="medium"
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  icon={<IncomeIcon />}
                  label={`${stats.incomeCount} ${t('income')}`}
                  color="success"
                  variant="outlined"
                />
                <Chip
                  icon={<ExpenseIcon />}
                  label={`${stats.expenseCount} ${t('expense')}`}
                  color="error"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Financial Summary */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('wizard.financialSummary')}
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
              <IncomeIcon sx={{ color: 'success.dark', fontSize: 32, mb: 1 }} />
              <Typography variant="h6" color="success.dark">
                {formatCurrency(stats.totalIncome)}
              </Typography>
              <Typography variant="body2" color="success.dark">
                {t('totalIncome')}
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
              <ExpenseIcon sx={{ color: 'error.dark', fontSize: 32, mb: 1 }} />
              <Typography variant="h6" color="error.dark">
                {formatCurrency(stats.totalExpense)}
              </Typography>
              <Typography variant="body2" color="error.dark">
                {t('totalExpense')}
              </Typography>
            </Box>
            
            <Box sx={{ 
              textAlign: 'center', 
              p: 2, 
              bgcolor: stats.netAmount >= 0 ? 'success.light' : 'error.light', 
              borderRadius: 1 
            }}>
              <CheckIcon sx={{ 
                color: stats.netAmount >= 0 ? 'success.dark' : 'error.dark', 
                fontSize: 32, 
                mb: 1 
              }} />
              <Typography variant="h6" color={stats.netAmount >= 0 ? 'success.dark' : 'error.dark'}>
                {stats.netAmount >= 0 ? '+' : ''}{formatCurrency(stats.netAmount)}
              </Typography>
              <Typography variant="body2" color={stats.netAmount >= 0 ? 'success.dark' : 'error.dark'}>
                {t('netBalance')}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>{t('wizard.note')}:</strong> {t('wizard.duplicateTransactionsNote')}
        </Typography>
      </Alert>
    </Box>
  );
}