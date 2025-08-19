import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Container, 
  Paper, 
  Typography, 
  Tabs, 
  Tab, 
  Box, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Analytics as AnalyticsIcon,
  ShowChart as ChartIcon,
  TableView as TableIcon,
  Delete as DeleteIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material';
import FileUpload from './components/FileUpload';
import TransactionTable from './components/TransactionTable';
import TransactionChart from './components/TransactionChart';
import StatsPanel from './components/StatsPanel';
import LanguageSelector from './components/LanguageSelector';
import IndexedDBManager from './utils/indexedDB';
import { Transaction, ParseResult } from './types';

type TabType = 'stats' | 'chart' | 'table';

interface ParsedResult extends ParseResult {
  filename: string;
  fileSize: number;
  parsedAt: Date;
}

function App() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dbManager] = useState<IndexedDBManager>(() => new IndexedDBManager());
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [clearDialogOpen, setClearDialogOpen] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const allTransactions = await dbManager.getAllTransactions();
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleTransactionsLoaded = async (parsedData: ParsedResult) => {
    try {
      const result = await dbManager.addTransactions(parsedData.transactions, parsedData.bankType);
      
      if (result.added > 0) {
        await loadTransactions();
        setSnackbar({
          open: true,
          message: `${result.added} new transactions added. ${result.duplicates} transactions skipped (already exists).`,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'All transactions already exist. No new transactions added.',
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('Error saving transactions:', error);
      setSnackbar({
        open: true,
        message: 'Error occurred while saving transactions.',
        severity: 'error'
      });
    }
  };

  const handleClearData = async () => {
    try {
      await dbManager.clearAllData();
      setTransactions([]);
      setClearDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'All data cleared.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error clearing data:', error);
      setSnackbar({
        open: true,
        message: 'Error occurred while clearing data.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, textAlign: 'center', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flex: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BankIcon sx={{ fontSize: 40 }} />
            <Typography variant="h3" component="h1" fontWeight="bold">
              {t('appTitle')}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <LanguageSelector />
          </Box>
        </Box>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          {t('appTitle')}
        </Typography>
      </Paper>

      <FileUpload 
        onTransactionsLoaded={handleTransactionsLoaded}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />

      {transactions.length > 0 && (
        <Paper elevation={2} sx={{ mt: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              <Tab 
                value="stats" 
                icon={<AnalyticsIcon />} 
                label={t('stats')} 
                iconPosition="start"
              />
              <Tab 
                value="chart" 
                icon={<ChartIcon />} 
                label={t('chart')} 
                iconPosition="start"
              />
              <Tab 
                value="table" 
                icon={<TableIcon />} 
                label={t('transactions')} 
                iconPosition="start"
              />
            </Tabs>
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', textAlign: 'right' }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setClearDialogOpen(true)}
              >
                {t('clearData')}
              </Button>
            </Box>
          </Box>

          <Box sx={{ p: 3 }}>
            {activeTab === 'stats' && <StatsPanel transactions={transactions} />}
            {activeTab === 'chart' && <TransactionChart transactions={transactions} />}
            {activeTab === 'table' && <TransactionTable transactions={transactions} />}
          </Box>
        </Paper>
      )}

      {transactions.length === 0 && !isLoading && (
        <Paper elevation={2} sx={{ p: 6, textAlign: 'center', mt: 3 }}>
          <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>📄</Typography>
          <Typography variant="h5" component="h3" gutterBottom>
            {t('noTransactions')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('uploadArea')}
          </Typography>
        </Paper>
      )}

      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>{t('clearData')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('clearDataConfirm')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleClearData} color="error" variant="contained">
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;