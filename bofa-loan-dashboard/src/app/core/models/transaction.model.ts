export interface Transaction {
  id: string;
  loanId: string;
  amount: number;
  type: 'payment' | 'disbursement' | 'fee' | 'adjustment';
  date: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}
