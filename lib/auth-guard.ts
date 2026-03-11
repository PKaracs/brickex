const MOCK_USER_ID = "mock-user-dev";

const MOCK_SESSION = {
  user: {
    id: MOCK_USER_ID,
    name: "Dev User",
    email: "dev@brickex.com",
    image: null,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  session: {
    id: "mock-session",
    userId: MOCK_USER_ID,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    ipAddress: "127.0.0.1",
    userAgent: "dev",
  },
};

export async function requireAuth(): Promise<string> {
  return MOCK_USER_ID;
}

export async function getOptionalAuth(): Promise<string | null> {
  return MOCK_USER_ID;
}

export async function requireAuthWithSession() {
  return MOCK_SESSION;
}
