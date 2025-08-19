import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as FileIcon
} from '@mui/icons-material';
import { ParseResult } from '../../types';
import BankStatementParser from '../../parsers/BankStatementParser';

interface FileUploadStepProps {
  onFileUploaded: (file: File, parseResult: ParseResult) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

type BankType = 'auto' | 'ziraat';

export default function FileUploadStep({
  onFileUploaded,
  loading,
  setLoading,
  error,
  setError
}: FileUploadStepProps) {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bankType, setBankType] = useState<BankType>('auto');
  const [dragOver, setDragOver] = useState(false);

  const parser = new BankStatementParser();

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setError(null);
  }, [setError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      handleFileSelect(file);
    } else {
      setError(t('wizard.invalidFileType'));
    }
  }, [handleFileSelect, setError, t]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const result = await parser.parseFile(selectedFile, bankType === 'auto' ? undefined : bankType);
      
      if (result.errors.length > 0) {
        setError(result.errors.join(', '));
        return;
      }

      if (result.transactions.length === 0) {
        setError(t('wizard.noTransactionsFound'));
        return;
      }

      onFileUploaded(selectedFile, result);
    } catch (error) {
      setError(error instanceof Error ? error.message : t('wizard.parseError'));
    } finally {
      setLoading(false);
    }
  }, [selectedFile, bankType, parser, setLoading, setError, t, onFileUploaded]);

  return (
    <Box>
      <Paper
        sx={{
          p: 4,
          border: '2px dashed',
          borderColor: dragOver ? 'primary.main' : 'grey.300',
          bgcolor: dragOver ? 'action.hover' : 'background.paper',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          mb: 3,
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover'
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload-input')?.click()}
      >
        <input
          id="file-upload-input"
          type="file"
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />
        
        <UploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        
        {selectedFile ? (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <FileIcon color="primary" />
              <Typography variant="h6" color="primary">
                {selectedFile.name}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {t('wizard.fileSize')}: {(selectedFile.size / 1024).toFixed(1)} KB
            </Typography>
            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
              {t('wizard.fileReady')}
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('wizard.dragDropFile')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('wizard.supportedFormats')}
            </Typography>
          </Box>
        )}
      </Paper>

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>{t('wizard.bankSelection')}</InputLabel>
          <Select
            value={bankType}
            label={t('wizard.bankSelection')}
            onChange={(e) => setBankType(e.target.value as BankType)}
          >
            <MenuItem value="auto">{t('wizard.autoDetect')}</MenuItem>
            <MenuItem value="ziraat">{t('wizard.ziraatBank')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            {t('wizard.parsing')}
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          startIcon={<UploadIcon />}
          size="large"
        >
          {loading ? t('wizard.parsing') : t('wizard.parseFile')}
        </Button>
      </Box>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>{t('wizard.note')}:</strong> {t('wizard.privacyNote')}
        </Typography>
      </Alert>
    </Box>
  );
}