export interface Credentials {
  username: string;
  password: string;
  email: string;
}

interface AuthContextType {
  session: Session | null;
  loading: boolean;
}
