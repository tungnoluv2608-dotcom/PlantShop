import type { SignInData, SignUpData, User } from "../types";

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock user database
const mockUsers: (User & { password: string })[] = [
  { id: "1", name: "Nguyễn Văn A", email: "demo@plantweb.vn", password: "123456" },
  { id: "2", name: "Test User", email: "test@example.com", password: "password123" },
];

export const authService = {
  async signIn(data: SignInData): Promise<{ user: User; token: string }> {
    await delay(500);
    const user = mockUsers.find(
      (u) => u.email === data.email && u.password === data.password
    );
    if (!user) {
      throw new Error("Email hoặc mật khẩu không chính xác.");
    }
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token: "mock-jwt-token-" + Date.now(),
    };
  },

  async signUp(data: SignUpData): Promise<{ user: User; token: string }> {
    await delay(500);
    const exists = mockUsers.find((u) => u.email === data.email);
    if (exists) {
      throw new Error("Email này đã được sử dụng.");
    }
    const newUser: User & { password: string } = {
      id: String(mockUsers.length + 1),
      name: data.name,
      email: data.email,
      password: data.password,
    };
    mockUsers.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    return {
      user: userWithoutPassword,
      token: "mock-jwt-token-" + Date.now(),
    };
  },

  async signOut(): Promise<void> {
    await delay(200);
    // In real app: invalidate token, clear session
  },
};
