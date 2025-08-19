import { Container, Paper, Typography, Button } from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getLocalizedPath } from '../utils/routing';

export default function EmptyState() {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 6, textAlign: 'center', mt: 3 }}>
        <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>📄</Typography>
        <Typography variant="h5" component="h3" gutterBottom>
          {t('noTransactions')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('wizard.noDataMessage')}
        </Typography>
        <Button
          component={Link}
          to={getLocalizedPath('upload', t)}
          variant="contained"
          sx={{ mt: 2 }}
          startIcon={<UploadIcon />}
        >
          {t('wizard.uploadFirst')}
        </Button>
      </Paper>
    </Container>
  );
}