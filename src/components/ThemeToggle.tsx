import { IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { 
  LightMode as LightIcon,
  DarkMode as DarkIcon,
  SettingsBrightness as SystemIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme, ThemeMode } from '../hooks/useTheme';

const ThemeToggle = () => {
  const { t } = useTranslation();
  const { themeMode, setTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeSelect = (mode: ThemeMode) => {
    setTheme(mode);
    handleClose();
  };

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light':
        return <LightIcon />;
      case 'dark':
        return <DarkIcon />;
      default:
        return <SystemIcon />;
    }
  };

  const themeOptions = [
    { mode: 'light' as const, icon: <LightIcon />, label: t('theme.light') },
    { mode: 'dark' as const, icon: <DarkIcon />, label: t('theme.dark') },
    { mode: 'system' as const, icon: <SystemIcon />, label: t('theme.system') },
  ];

  return (
    <>
      <Tooltip title={t('theme.toggle')}>
        <IconButton
          onClick={handleClick}
          size="large"
          color="inherit"
          aria-label={t('theme.toggle')}
        >
          {getThemeIcon()}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {themeOptions.map((option) => (
          <MenuItem
            key={option.mode}
            onClick={() => handleThemeSelect(option.mode)}
            selected={themeMode === option.mode}
          >
            <ListItemIcon>
              {option.icon}
            </ListItemIcon>
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ThemeToggle;