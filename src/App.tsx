import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Container, 
  Paper, 
  Typography, 
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Button
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import TransactionTable from './components/TransactionTable';
import TransactionChart from './components/TransactionChart';
import StatsPanel from './components/StatsPanel';
import MainLayout from './components/Layout/MainLayout';
import UploadWizard from './pages/UploadWizard';
import IndexedDBManager from './utils/indexedDB';
import { Transaction } from './types';

type TabType = 'upload' | 'stats' | 'chart' | 'table';

function App() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dbManager] = useState<IndexedDBManager>(() => new IndexedDBManager());
  const [activeTab, setActiveTab] = useState<TabType>('upload');
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

  const handleWizardComplete = async (selectedTransactions: Transaction[]) => {
    try {
      const result = await dbManager.addTransactions(selectedTransactions, selectedTransactions[0]?.bankType || 'unknown');
      
      if (result.added > 0) {
        await loadTransactions();
        setSnackbar({
          open: true,
          message: `${result.added} new transactions added. ${result.duplicates} transactions skipped (already exists).`,
          severity: 'success'
        });
        // Navigate to stats after successful import
        setActiveTab('stats');
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

  const handleWizardCancel = () => {
    if (transactions.length > 0) {
      setActiveTab('stats');
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
    <MainLayout
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as TabType)}
      onClearData={() => setClearDialogOpen(true)}
      hasTransactions={transactions.length > 0}
    >
      {activeTab === 'upload' && (
        <UploadWizard
          onComplete={handleWizardComplete}
          onCancel={handleWizardCancel}
        />
      )}

      {activeTab !== 'upload' && (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {transactions.length > 0 && (
            <Paper elevation={2} sx={{ mt: 3 }}>
              <Box sx={{ p: 3 }}>
                {activeTab === 'stats' && <StatsPanel transactions={transactions} />}
                {activeTab === 'chart' && <TransactionChart transactions={transactions} />}
                {activeTab === 'table' && <TransactionTable transactions={transactions} />}
              </Box>
            </Paper>
          )}

          {transactions.length === 0 && (
            <Paper elevation={2} sx={{ p: 6, textAlign: 'center', mt: 3 }}>
              <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>📄</Typography>
              <Typography variant="h5" component="h3" gutterBottom>
                {t('noTransactions')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('wizard.noDataMessage')}
              </Typography>
              <Button
                variant="contained"
                onClick={() => setActiveTab('upload')}
                sx={{ mt: 2 }}
                startIcon={<UploadIcon />}
              >
                {t('wizard.uploadFirst')}
              </Button>
            </Paper>
          )}
        </Container>
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
    </MainLayout>
  );
}

export default App;