import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  ShowChart as ChartIcon,
  TableView as TableIcon,
  AccountBalance as BankIcon,
  Delete as DeleteIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';
import LanguageSelector from '../LanguageSelector';

interface SidebarProps {
  activeTab: string;
  onClearData: () => void;
  hasTransactions: boolean;
  open: boolean;
  onToggle: () => void;
}

const DRAWER_WIDTH = 280;

export default function Sidebar({ 
  activeTab, 
  onClearData, 
  hasTransactions, 
  open, 
  onToggle 
}: SidebarProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navigationItems = [
    {
      id: 'upload',
      path: '/upload',
      label: t('wizard.upload'),
      icon: <UploadIcon />,
      disabled: false
    },
    {
      id: 'stats',
      path: '/dashboard',
      label: t('stats'),
      icon: <AnalyticsIcon />,
      disabled: !hasTransactions
    },
    {
      id: 'chart',
      path: '/chart',
      label: t('chart'),
      icon: <ChartIcon />,
      disabled: !hasTransactions
    },
    {
      id: 'table',
      path: '/transactions',
      label: t('transactions'),
      icon: <TableIcon />,
      disabled: !hasTransactions
    }
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BankIcon sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h6" component="h1" fontWeight="bold">
              {t('appTitle')}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {t('appTitle')}
            </Typography>
          </Box>
        </Box>
        {isMobile && (
          <IconButton 
            onClick={onToggle}
            sx={{ color: 'primary.contrastText' }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List>
          {navigationItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={activeTab === item.id}
                disabled={item.disabled}
                sx={{
                  color: 'inherit',
                  textDecoration: 'none',
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    }
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: activeTab === item.id ? 'primary.main' : 'inherit',
                    minWidth: 40
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: activeTab === item.id ? 600 : 400
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Footer Actions */}
      <Box sx={{ mt: 'auto' }}>
        <Divider />
        
        {/* Clear Data Button */}
        {hasTransactions && (
          <List>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={onClearData}
                sx={{ 
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: 'error.light',
                    color: 'error.contrastText'
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  <DeleteIcon />
                </ListItemIcon>
                <ListItemText primary={t('clearData')} />
              </ListItemButton>
            </ListItem>
          </List>
        )}

        <Divider />
        
        {/* Settings */}
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t('language')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <LanguageSelector />
            </Box>
            <ThemeToggle />
          </Box>
        </Box>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <>
        <IconButton
          onClick={onToggle}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: theme.zIndex.drawer + 1,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              bgcolor: 'primary.dark',
            }
          }}
        >
          <MenuIcon />
        </IconButton>
        
        <Drawer
          variant="temporary"
          open={open}
          onClose={onToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}