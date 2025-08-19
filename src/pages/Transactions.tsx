import { Container, Paper, Box } from '@mui/material';
import TransactionTable from '../components/TransactionTable';
import { Transaction } from '../types';

interface TransactionsProps {
  transactions: Transaction[];
}

export default function Transactions({ transactions }: TransactionsProps) {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ mt: 3 }}>
        <Box sx={{ p: 3 }}>
          <TransactionTable transactions={transactions} />
        </Box>
      </Paper>
    </Container>
  );
}