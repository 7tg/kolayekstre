import { useState, useEffect } from 'react';
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
import IndexedDBManager from './utils/indexedDB';
import { Transaction, ParseResult } from './types';

type TabType = 'stats' | 'chart' | 'table';

interface ParsedResult extends ParseResult {
  filename: string;
  fileSize: number;
  parsedAt: Date;
}

function App() {
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
          message: `${result.added} yeni işlem eklendi. ${result.duplicates} işlem zaten mevcut olduğu için atlandı.`,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Tüm işlemler zaten mevcut. Yeni işlem eklenmedi.',
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('Error saving transactions:', error);
      setSnackbar({
        open: true,
        message: 'İşlemler kaydedilirken bir hata oluştu.',
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
        message: 'Tüm veriler silindi.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error clearing data:', error);
      setSnackbar({
        open: true,
        message: 'Veriler silinirken bir hata oluştu.',
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1 }}>
          <BankIcon sx={{ fontSize: 40 }} />
          <Typography variant="h3" component="h1" fontWeight="bold">
            Kolay Ekstre
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Banka ekstrelerinizi kolayca yükleyin ve analiz edin
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
                label="İstatistikler" 
                iconPosition="start"
              />
              <Tab 
                value="chart" 
                icon={<ChartIcon />} 
                label="Grafik" 
                iconPosition="start"
              />
              <Tab 
                value="table" 
                icon={<TableIcon />} 
                label="Tablo" 
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
                Verileri Temizle
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
            Henüz veri yok
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Başlamak için bir banka ekstresi yükleyin
          </Typography>
        </Paper>
      )}

      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>Verileri Temizle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tüm veriler silinecek. Bu işlem geri alınamaz. Emin misiniz?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>
            İptal
          </Button>
          <Button onClick={handleClearData} color="error" variant="contained">
            Sil
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