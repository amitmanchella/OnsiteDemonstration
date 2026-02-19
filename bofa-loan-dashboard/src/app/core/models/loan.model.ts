export interface Loan {
  id: string;
  applicantName: string;
  amount: number;
  interestRate: number;
  term: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'closed';
  applicationDate: string;
  approvedBy?: string;
  riskScore: number;
  type: 'personal' | 'mortgage' | 'auto' | 'business';
}
