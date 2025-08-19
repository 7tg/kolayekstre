import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Typography,
  Button,
  Alert,
  LinearProgress,
  Container
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Preview as PreviewIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import FileUploadStep from '../components/Wizard/FileUploadStep';
import TransactionPreviewStep from '../components/Wizard/TransactionPreviewStep';
import ConfirmationStep from '../components/Wizard/ConfirmationStep';
import { Transaction, ParseResult } from '../types';

interface UploadWizardProps {
  onComplete: (transactions: Transaction[]) => Promise<void>;
  onCancel: () => void;
}

interface WizardData {
  file: File | null;
  parseResult: ParseResult | null;
  selectedTransactions: Set<string>;
}

export default function UploadWizard({ onComplete, onCancel }: UploadWizardProps) {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wizardData, setWizardData] = useState<WizardData>({
    file: null,
    parseResult: null,
    selectedTransactions: new Set()
  });

  const steps = [
    {
      label: t('wizard.uploadFile'),
      description: t('wizard.uploadFileDesc'),
      icon: <UploadIcon />
    },
    {
      label: t('wizard.previewData'),
      description: t('wizard.previewDataDesc'),
      icon: <PreviewIcon />
    },
    {
      label: t('wizard.confirm'),
      description: t('wizard.confirmDesc'),
      icon: <SaveIcon />
    }
  ];

  const handleNext = useCallback(() => {
    setActiveStep((prevStep) => prevStep + 1);
  }, []);

  const handleBack = useCallback(() => {
    setActiveStep((prevStep) => prevStep - 1);
  }, []);

  const handleFileUpload = useCallback(async (file: File, parseResult: ParseResult) => {
    setWizardData(prev => ({
      ...prev,
      file,
      parseResult,
      selectedTransactions: new Set(parseResult.transactions.map(t => t.id))
    }));
    setError(null);
    handleNext();
  }, [handleNext]);

  const handleTransactionToggle = useCallback((transactionId: string) => {
    setWizardData(prev => {
      const newSelected = new Set(prev.selectedTransactions);
      if (newSelected.has(transactionId)) {
        newSelected.delete(transactionId);
      } else {
        newSelected.add(transactionId);
      }
      return {
        ...prev,
        selectedTransactions: newSelected
      };
    });
  }, []);

  const handleSelectAll = useCallback((select: boolean) => {
    setWizardData(prev => ({
      ...prev,
      selectedTransactions: select 
        ? new Set(prev.parseResult?.transactions.map(t => t.id) || [])
        : new Set()
    }));
  }, []);

  const handleComplete = useCallback(async () => {
    if (!wizardData.parseResult) return;

    setLoading(true);
    try {
      const selectedTransactions = wizardData.parseResult.transactions.filter(
        t => wizardData.selectedTransactions.has(t.id)
      );
      
      await onComplete(selectedTransactions);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [wizardData, onComplete]);

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <FileUploadStep
            onFileUploaded={handleFileUpload}
            loading={loading}
            setLoading={setLoading}
            error={error}
            setError={setError}
          />
        );
      case 1:
        return wizardData.parseResult ? (
          <TransactionPreviewStep
            parseResult={wizardData.parseResult}
            selectedTransactions={wizardData.selectedTransactions}
            onTransactionToggle={handleTransactionToggle}
            onSelectAll={handleSelectAll}
          />
        ) : null;
      case 2:
        return wizardData.parseResult ? (
          <ConfirmationStep
            parseResult={wizardData.parseResult}
            selectedTransactions={wizardData.selectedTransactions}
            fileName={wizardData.file?.name || ''}
          />
        ) : null;
      default:
        return 'Unknown step';
    }
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 0:
        return wizardData.file !== null && wizardData.parseResult !== null;
      case 1:
        return wizardData.selectedTransactions.size > 0;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const canProceed = (step: number) => {
    return isStepComplete(step);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('wizard.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {t('wizard.subtitle')}
        </Typography>

        {loading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label} completed={isStepComplete(index)}>
              <StepLabel
                optional={
                  index === steps.length - 1 ? (
                    <Typography variant="caption">{t('wizard.lastStep')}</Typography>
                  ) : null
                }
                StepIconComponent={() => (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: activeStep >= index ? 'primary.main' : 'grey.300',
                      color: activeStep >= index ? 'primary.contrastText' : 'text.secondary'
                    }}
                  >
                    {step.icon}
                  </Box>
                )}
              >
                <Typography variant="h6">{step.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  {getStepContent(index)}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    variant="outlined"
                  >
                    {t('wizard.back')}
                  </Button>
                  {index === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleComplete}
                      disabled={!canProceed(index) || loading}
                      startIcon={<SaveIcon />}
                    >
                      {loading ? t('wizard.saving') : t('wizard.save')}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!canProceed(index) || loading}
                    >
                      {t('wizard.next')}
                    </Button>
                  )}
                  <Button
                    onClick={onCancel}
                    variant="text"
                    color="secondary"
                  >
                    {t('wizard.cancel')}
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Container>
  );
}