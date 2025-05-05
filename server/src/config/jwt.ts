const accessSecret = process.env.JWT_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

if (!accessSecret || !refreshSecret) {
  throw new Error("JWT_SECRET or JWT_REFRESH_SECRET environment variable is not defined.");
}

export const JWT_CONFIG = {
  ACCESS_SECRET: accessSecret,
  REFRESH_SECRET: refreshSecret
};
