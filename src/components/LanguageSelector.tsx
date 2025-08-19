import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  Box
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import LanguageIcon from '@mui/icons-material/Language';

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    const selectedLanguage = event.target.value;
    i18n.changeLanguage(selectedLanguage);
  };

  const getLanguageDisplay = (lang: string) => {
    switch (lang) {
      case 'en':
        return `🇺🇸 ${t('english')}`;
      case 'tr':
        return `🇹🇷 ${t('turkish')}`;
      default:
        return lang;
    }
  };

  return (
    <Box sx={{ minWidth: 120, display: 'flex', alignItems: 'center', gap: 1 }}>
      <LanguageIcon color="primary" />
      <FormControl size="small" variant="outlined">
        <InputLabel id="language-select-label">{t('language')}</InputLabel>
        <Select
          labelId="language-select-label"
          value={i18n.language}
          label={t('language')}
          onChange={handleLanguageChange}
          sx={{ minWidth: 120 }}
          renderValue={(value) => getLanguageDisplay(value as string)}
        >
          <MenuItem value="en">🇺🇸 {t('english')}</MenuItem>
          <MenuItem value="tr">🇹🇷 {t('turkish')}</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageSelector;