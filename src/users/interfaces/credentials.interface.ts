export interface ICredentials {
  version: number;
  lastPassword: string;
  passwordUpdatedAt: number;
  updatedAt: number;
  updateVersion: () => void;
  updatePassword: (password: string) => void;
}
