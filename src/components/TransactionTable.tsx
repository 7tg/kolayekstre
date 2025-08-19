import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography,
  Chip
} from '@mui/material';
import { 
  DataGrid, 
  GridColDef, 
  GridRenderCellParams
} from '@mui/x-data-grid';
import { 
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon
} from '@mui/icons-material';
import { Transaction } from '../types';

interface TransactionTableProps {
  transactions: Transaction[];
}

type FilterType = 'all' | 'income' | 'expense';

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const { t, i18n } = useTranslation();
  const [filterType, setFilterType] = useState<FilterType>('all');

  const filteredTransactions = useMemo(() => {
    if (filterType === 'income') {
      return transactions.filter(t => t.amount > 0);
    } else if (filterType === 'expense') {
      return transactions.filter(t => t.amount < 0);
    }
    return transactions;
  }, [transactions, filterType]);

  const formatCurrency = (amount: number): string => {
    const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
    const currency = i18n.language === 'tr' ? 'TRY' : 'USD';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: Date | null): string => {
    const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
    return date ? new Date(date).toLocaleDateString(locale) : '';
  };

  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: t('date'),
      width: 120,
      valueFormatter: (value) => 
        value ? formatDate(new Date(value)) : '',
      sortable: true,
    },
    {
      field: 'description',
      headerName: t('description'),
      flex: 1,
      minWidth: 200,
      sortable: true,
    },
    {
      field: 'amount',
      headerName: t('amount'),
      width: 140,
      align: 'right',
      headerAlign: 'right',
      sortable: true,
      renderCell: (params: GridRenderCellParams) => {
        const amount = params.value as number;
        const isPositive = amount >= 0;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isPositive ? (
              <IncomeIcon sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
              <ExpenseIcon sx={{ fontSize: 16, color: 'error.main' }} />
            )}
            <Typography
              variant="body2"
              sx={{
                color: isPositive ? 'success.main' : 'error.main',
                fontWeight: 'medium',
              }}
            >
              {formatCurrency(amount)}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'balance',
      headerName: t('balance'),
      width: 140,
      align: 'right',
      headerAlign: 'right',
      sortable: true,
      valueFormatter: (value) => 
        formatCurrency(value as number),
    },
    {
      field: 'bankType',
      headerName: 'Bank',
      width: 120,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => {
        const bankType = params.value as string;
        return bankType ? (
          <Chip 
            label={bankType} 
            size="small" 
            variant="outlined" 
            color="primary" 
          />
        ) : null;
      },
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={filterType}
            label="Filter"
            onChange={(e) => setFilterType(e.target.value as FilterType)}
          >
            <MenuItem value="all">All Transactions</MenuItem>
            <MenuItem value="income">{t('income')}</MenuItem>
            <MenuItem value="expense">{t('expense')}</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary">
          {filteredTransactions.length} transactions
        </Typography>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredTransactions}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
            sorting: {
              sortModel: [{ field: 'date', sort: 'desc' }],
            },
          }}
          pageSizeOptions={[5, 10, 20, 50]}
          checkboxSelection={false}
          disableRowSelectionOnClick
          localeText={{
            // Toolbar
            toolbarDensity: 'Yoğunluk',
            toolbarDensityLabel: 'Yoğunluk',
            toolbarDensityCompact: 'Sıkışık',
            toolbarDensityStandard: 'Standart',
            toolbarDensityComfortable: 'Rahat',
            toolbarColumns: 'Sütunlar',
            toolbarColumnsLabel: 'Sütunları seç',
            toolbarFilters: 'Filtreler',
            toolbarFiltersLabel: 'Filtreleri göster',
            toolbarFiltersTooltipHide: 'Filtreleri gizle',
            toolbarFiltersTooltipShow: 'Filtreleri göster',
            // No rows
            noRowsLabel: 'Veri bulunamadı',
          }}
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'background.paper',
              borderBottom: '2px solid',
              borderColor: 'divider',
            },
          }}
        />
      </Box>
    </Box>
  );
}