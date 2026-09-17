import api from './api';
import type { Category } from '../types/member';

export const getCategories = async (): Promise<Category[]> => {
const response = await api.get<Category[]>('/categories');
return response.data;
};