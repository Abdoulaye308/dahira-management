export interface Payment {
  id: number;
  memberContribution: {
    id: number;
    member: {
      id: number;
      firstName: string;
      lastName: string;
      phone: string;
    };
    contribution: {
      id: number;
      name: string;
    };
    expectedAmount: number;
  };
  amount: number;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRequest {
  memberContributionId: number;
  amount: number;
  paymentDate: string;
}

export interface PaymentSummary {
  memberContributionId: number;
  memberId: number;
  firstName: string;
  lastName: string;
  phone: string;
  contributionId: number;
  contributionName: string;
  expectedAmount: number;
  totalPaid: number;
  remainingAmount: number;
  status: 'PAYE' | 'PARTIEL' | 'NON_PAYE';
}