import { sign, verify } from "hono/jwt";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-super-secret-refresh-key";

export const generateTokens = async (userId: string) => {
  const accessToken = await sign(
    // 1 day
    { userId, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 1 },
    JWT_SECRET
  );
  const refreshToken = await sign(
    // 7 days
    { userId, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
    JWT_REFRESH_SECRET
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = async (token: string) => {
  try {
    return (await verify(token, JWT_SECRET)) as { userId: string };
  } catch {
    return null;
  }
};

export const verifyRefreshToken = async (token: string) => {
  try {
    return (await verify(token, JWT_REFRESH_SECRET)) as { userId: string };
  } catch {
    return null;
  }
};
