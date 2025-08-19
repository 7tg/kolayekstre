import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Paper, 
  Box, 
  Typography, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  CloudUpload as UploadIcon, 
  Description as FileIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material';
import BankStatementParser from '../parsers/BankStatementParser';
import { ParseResult } from '../types';

interface FileUploadProps {
  onTransactionsLoaded: (result: ParseResult & { filename: string; fileSize: number; parsedAt: Date }) => Promise<void>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function FileUpload({ onTransactionsLoaded, isLoading, setIsLoading }: FileUploadProps) {
  const { t } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  const [selectedBank, setSelectedBank] = useState('auto');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parser = new BankStatementParser();

  const handleFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;

    setIsLoading(true);
    
    try {
      for (const file of files) {
        if (!file.name.toLowerCase().includes('.xlsx') && !file.name.toLowerCase().includes('.xls')) {
          throw new Error(`Unsupported file format: ${file.name}. Only Excel files (.xlsx, .xls) are supported.`);
        }

        const bankType = selectedBank === 'auto' ? null : selectedBank;
        const result = await parser.parseFile(file, bankType);
        
        await onTransactionsLoaded(result);
      }
    } catch (error) {
      console.error('File processing error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFiles(Array.from(event.target.files));
      event.target.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files) {
      handleFiles(Array.from(event.dataTransfer.files));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="bank-select-label">{t('bankSelection')}</InputLabel>
          <Select 
            labelId="bank-select-label"
            value={selectedBank} 
            label={t('bankSelection')}
            onChange={(e) => setSelectedBank(e.target.value)}
            disabled={isLoading}
            startAdornment={<BankIcon sx={{ mr: 1, color: 'text.secondary' }} />}
          >
            <MenuItem value="auto">{t('autoDetect')}</MenuItem>
            <MenuItem value="ziraat">{t('ziraatBank')}</MenuItem>
            <MenuItem value="enpara">{t('enparaBank')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper 
        variant="outlined"
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: isLoading ? 'default' : 'pointer',
          border: dragOver ? '2px dashed' : '2px dashed transparent',
          borderColor: dragOver ? 'primary.main' : 'divider',
          bgcolor: dragOver ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s ease-in-out',
          '&:hover': isLoading ? {} : {
            bgcolor: 'action.hover',
            borderColor: 'primary.light'
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isLoading && fileInputRef.current?.click()}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          multiple 
          accept=".xlsx,.xls" 
          onChange={handleFileSelect}
          disabled={isLoading}
          style={{ display: 'none' }}
        />
        
        {isLoading ? (
          <Box>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="h6">{t('uploading')}</Typography>
          </Box>
        ) : (
          <Box>
            <FileIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" component="h3" gutterBottom>
              {t('uploadBankStatement')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {t('uploadArea')}
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<UploadIcon />}
              size="large"
              sx={{ mb: 2 }}
            >
              {t('selectFiles')}
            </Button>
            <Typography variant="caption" display="block" color="text.secondary">
              {t('supportedFormats')}
            </Typography>
          </Box>
        )}
      </Paper>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>{t('note')}</strong> {t('duplicateNote')}
        </Typography>
      </Alert>
    </Paper>
  );
}