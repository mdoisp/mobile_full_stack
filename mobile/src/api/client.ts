import axios from 'axios';
import Constants from 'expo-constants';

// Resolve extras tanto em dev (Expo Go) quanto em build
const extras: any = (Constants.expoConfig?.extra as any)
  ?? (Constants as any).manifestExtra
  ?? (Constants as any).manifest?.extra;

const apiBaseUrl: string | undefined = extras?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
  console.error('apiBaseUrl não definido. Configure em app.json (expo.extra.apiBaseUrl) ou EXPO_PUBLIC_API_BASE_URL');
}

export const api = axios.create({
  baseURL: apiBaseUrl,
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


