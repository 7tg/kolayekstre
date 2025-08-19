import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Checkbox,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControlLabel,
  Alert,
  Divider
} from '@mui/material';
import {
  CheckBox as CheckIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon
} from '@mui/icons-material';
import { ParseResult } from '../../types';

interface TransactionPreviewStepProps {
  parseResult: ParseResult;
  selectedTransactions: Set<string>;
  onTransactionToggle: (transactionId: string) => void;
  onSelectAll: (select: boolean) => void;
}

export default function TransactionPreviewStep({
  parseResult,
  selectedTransactions,
  onTransactionToggle,
  onSelectAll
}: TransactionPreviewStepProps) {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { transactions } = parseResult;
  const selectedCount = selectedTransactions.size;
  const totalCount = transactions.length;

  const stats = useMemo(() => {
    const selected = transactions.filter(t => selectedTransactions.has(t.id));
    return {
      totalIncome: selected.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
      totalExpense: selected.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0),
      incomeCount: selected.filter(t => t.amount > 0).length,
      expenseCount: selected.filter(t => t.amount < 0).length
    };
  }, [transactions, selectedTransactions]);

  const formatCurrency = (amount: number): string => {
    const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '-';
    const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedTransactions = transactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  return (
    <Box>
      {/* Summary Info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('wizard.summary')}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<CheckIcon />}
            label={`${selectedCount} / ${totalCount} ${t('wizard.transactionsSelected')}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${t('wizard.bank')}: ${parseResult.bankType}`}
            color="secondary"
            variant="outlined"
          />
        </Box>

        {selectedCount > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mt: 2 }}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
              <IncomeIcon sx={{ color: 'success.dark', mb: 1 }} />
              <Typography variant="h6" color="success.dark">
                {formatCurrency(stats.totalIncome)}
              </Typography>
              <Typography variant="body2" color="success.dark">
                {stats.incomeCount} {t('wizard.incomeTransactions')}
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
              <ExpenseIcon sx={{ color: 'error.dark', mb: 1 }} />
              <Typography variant="h6" color="error.dark">
                {formatCurrency(stats.totalExpense)}
              </Typography>
              <Typography variant="body2" color="error.dark">
                {stats.expenseCount} {t('wizard.expenseTransactions')}
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Selection Controls */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            }
            label={t('wizard.selectAll')}
          />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              onClick={() => onSelectAll(true)}
              disabled={isAllSelected}
            >
              {t('wizard.selectAll')}
            </Button>
            <Button
              size="small"
              onClick={() => onSelectAll(false)}
              disabled={selectedCount === 0}
            >
              {t('wizard.selectNone')}
            </Button>
          </Box>
        </Box>
        
        <Divider />
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t('wizard.previewInstructions')}
        </Typography>
      </Paper>

      {/* Transaction Table */}
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={paginatedTransactions.every(t => selectedTransactions.has(t.id))}
                  indeterminate={
                    paginatedTransactions.some(t => selectedTransactions.has(t.id)) &&
                    !paginatedTransactions.every(t => selectedTransactions.has(t.id))
                  }
                  onChange={(e) => {
                    const shouldSelect = e.target.checked;
                    paginatedTransactions.forEach(t => {
                      if (shouldSelect !== selectedTransactions.has(t.id)) {
                        onTransactionToggle(t.id);
                      }
                    });
                  }}
                />
              </TableCell>
              <TableCell>{t('date')}</TableCell>
              <TableCell>{t('description')}</TableCell>
              <TableCell align="right">{t('amount')}</TableCell>
              <TableCell align="right">{t('balance')}</TableCell>
              <TableCell>{t('type')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTransactions.map((transaction) => (
              <TableRow
                key={transaction.id}
                hover
                selected={selectedTransactions.has(transaction.id)}
                sx={{ cursor: 'pointer' }}
                onClick={() => onTransactionToggle(transaction.id)}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedTransactions.has(transaction.id)}
                    onChange={() => onTransactionToggle(transaction.id)}
                  />
                </TableCell>
                <TableCell>
                  {formatDate(transaction.date)}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ 
                    maxWidth: 300, 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {transaction.description}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    color={transaction.amount >= 0 ? 'success.main' : 'error.main'}
                    fontWeight="medium"
                  >
                    {transaction.amount >= 0 ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    {formatCurrency(transaction.balance)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={t(transaction.type)}
                    color={
                      transaction.type === 'income' ? 'success' :
                      transaction.type === 'expense' ? 'error' : 'default'
                    }
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={transactions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={t('wizard.rowsPerPage')}
        labelDisplayedRows={({ from, to, count }) => 
          `${from}–${to} ${t('wizard.of')} ${count !== -1 ? count : `${t('wizard.moreThan')} ${to}`}`
        }
      />

      {selectedCount === 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {t('wizard.noTransactionsSelected')}
        </Alert>
      )}
    </Box>
  );
}