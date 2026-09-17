export interface Contribution {
  id: number;
  name: string;
  description?: string;
  targetAmount: number;
  startDate: string;
  endDate?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContributionRequest {
  name: string;
  description?: string;
  targetAmount: number;
  startDate: string;
  endDate?: string;
  status?: string;
}

export interface ContributionStatistics {
  contributionId: number;
  contributionName: string;
  expectedAmount: number;
  paidAmount: number;
  remainingAmount: number;
  totalMembers: number;
  fullyPaid: number;
  partiallyPaid: number;
  unpaid: number;
}