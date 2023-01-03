export interface UserUtils {
  hashPassword: (password: string) => Promise<string>
  verifyPassword: (password: string, passwordHash: string) => Promise<boolean>
}
