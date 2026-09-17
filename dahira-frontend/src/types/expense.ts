export interface Expense {
  id: number;
  title: string;
  description?: string;
  amount: number;
  expenseDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseRequest {
  title: string;
  description?: string;
  amount: number;
  expenseDate: string;
}