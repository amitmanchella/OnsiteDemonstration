export interface User {
  id: string;
  username: string;
  email: string;
  role: 'loan_officer' | 'manager' | 'admin';
  firstName: string;
  lastName: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
