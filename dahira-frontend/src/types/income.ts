export interface Income {
  id: number;
  title: string;
  description?: string;
  amount: number;
  incomeDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeRequest {
  title: string;
  description?: string;
  amount: number;
  incomeDate: string;
}