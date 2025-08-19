import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Button
} from '@mui/material';
import MainLayout from './components/Layout/MainLayout';
import UploadWizard from './pages/UploadWizard';
import Dashboard from './pages/Dashboard';
import Chart from './pages/Chart';
import Transactions from './pages/Transactions';
import EmptyState from './pages/EmptyState';
import IndexedDBManager from './utils/indexedDB';
import { getRouteKeyFromPath, getAllLocalizedPaths, navigateToRoute } from './utils/routing';
import { Transaction } from './types';

function App() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dbManager] = useState<IndexedDBManager>(() => new IndexedDBManager());
  const [clearDialogOpen, setClearDialogOpen] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  const activeTab = getRouteKeyFromPath(location.pathname, t);
  const localizedPaths = getAllLocalizedPaths(t);

  // Handle tab to route key mapping for legacy compatibility
  const getTabFromRouteKey = (routeKey: string): string => {
    switch (routeKey) {
      case 'dashboard': return 'stats';
      case 'transactions': return 'table';
      default: return routeKey;
    }
  };

  const displayTab = getTabFromRouteKey(activeTab);

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
        // Navigate to dashboard after successful import
        navigateToRoute('dashboard', t, navigate);
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
      navigateToRoute('dashboard', t, navigate);
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
      activeTab={displayTab}
      onClearData={() => setClearDialogOpen(true)}
      hasTransactions={transactions.length > 0}
    >
      <Routes>
        <Route 
          path={localizedPaths.upload} 
          element={
            <UploadWizard
              onComplete={handleWizardComplete}
              onCancel={handleWizardCancel}
            />
          } 
        />
        <Route 
          path={localizedPaths.dashboard} 
          element={
            transactions.length > 0 ? (
              <Dashboard transactions={transactions} />
            ) : (
              <EmptyState />
            )
          } 
        />
        <Route 
          path={localizedPaths.chart} 
          element={
            transactions.length > 0 ? (
              <Chart transactions={transactions} />
            ) : (
              <EmptyState />
            )
          } 
        />
        <Route 
          path={localizedPaths.transactions} 
          element={
            transactions.length > 0 ? (
              <Transactions transactions={transactions} />
            ) : (
              <EmptyState />
            )
          } 
        />
        {/* Fallback routes for English paths */}
        <Route path="/upload" element={<UploadWizard onComplete={handleWizardComplete} onCancel={handleWizardCancel} />} />
        <Route path="/dashboard" element={transactions.length > 0 ? <Dashboard transactions={transactions} /> : <EmptyState />} />
        <Route path="/chart" element={transactions.length > 0 ? <Chart transactions={transactions} /> : <EmptyState />} />
        <Route path="/transactions" element={transactions.length > 0 ? <Transactions transactions={transactions} /> : <EmptyState />} />
        <Route path="/" element={transactions.length > 0 ? <Dashboard transactions={transactions} /> : <UploadWizard onComplete={handleWizardComplete} onCancel={handleWizardCancel} />} />
      </Routes>

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