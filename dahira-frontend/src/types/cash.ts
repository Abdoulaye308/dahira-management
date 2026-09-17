export interface CashSummary {
  totalPayments: number;
  totalIncomes: number;
  totalExpenses: number;
  totalEntries: number;
  cashBalance: number;
}

export interface CashTransaction {
  id: number;
  type: 'ENTREE' | 'SORTIE';
  title: string;
  description?: string;
  amount: number;
  date: string;
  source: 'PAYMENT' | 'INCOME' | 'EXPENSE';
}