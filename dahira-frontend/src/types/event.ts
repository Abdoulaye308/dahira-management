export interface Event {
  id: number;
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventRequest {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  status?: string;
}