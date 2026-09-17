export interface Category {
    id: number;
name: string;
description?: string;
}

export interface Member {
id: number;
firstName: string;
lastName: string;
phone: string;
gender: string;
category: Category;
joinDate: string;
status: string;
createdAt: string;
updatedAt: string;
}

export interface MemberRequest {
firstName: string;
lastName: string;
phone: string;
gender: string;
categoryId: number;
joinDate?: string;
status?: string;
}
export interface MemberContributionSummary {
  memberContributionId: number;
  contributionId: number;
  contributionName: string;
  expectedAmount: number;
  totalPaid: number;
  remainingAmount: number;
  status: string;
}