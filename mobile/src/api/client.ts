import axios from 'axios';
import Constants from 'expo-constants';

const apiBaseUrl: string | undefined = Constants.expoConfig?.extra?.apiBaseUrl;

if (!apiBaseUrl) {
  console.warn('apiBaseUrl não definido em app.json > expo.extra.apiBaseUrl');
}

export const api = axios.create({
  baseURL: apiBaseUrl || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface StudentDTO {
  _id?: string;
  studentId: string;
  name: string;
  address: {
    zipcode: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  courses: string[];
}

export async function fetchStudents(): Promise<StudentDTO[]> {
  const { data } = await api.get<StudentDTO[]>('/students');
  return data;
}

export async function createStudent(payload: StudentDTO): Promise<StudentDTO> {
  const { data } = await api.post<StudentDTO>('/students', payload);
  return data;
}

export async function updateStudent(id: string, payload: StudentDTO): Promise<StudentDTO> {
  const { data } = await api.put<StudentDTO>(`/students/${id}`, payload);
  return data;
}

export async function deleteStudent(id: string): Promise<void> {
  await api.delete(`/students/${id}`);
}


