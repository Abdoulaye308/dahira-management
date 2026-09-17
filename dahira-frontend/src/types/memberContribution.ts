import type { Member } from './member';
import type { Contribution } from './contribution';

export interface MemberContribution {
  id: number;
  member: Member;
  contribution: Contribution;
  expectedAmount: number;
}

export interface MemberContributionRequest {
  memberId: number;
  contributionId: number;
  expectedAmount: number;
}