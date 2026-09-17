import api from './api';

export interface DashboardData {
totalMembers: number;
activeMembers: number;
inactiveMembers: number;
totalCategories: number;
totalContributions: number;
activeContributions: number;
totalExpected: number;
totalPaid: number;
totalRemaining: number;
totalEvents: number;
activeEvents: number;
}

export const getDashboard = async (): Promise<DashboardData> => {
const response = await api.get<DashboardData>('/dashboard');
return response.data;
};