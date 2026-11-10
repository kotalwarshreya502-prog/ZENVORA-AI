import jwt from 'jsonwebtoken';

/**
 * Generate a signed JWT for the given user ID and role.
 * @param {string} id  - Mongoose ObjectId as string
 * @param {string} role - User role (user | admin | agency)
 * @returns {string} Signed JWT token
 */
export const generateToken = (id, role = 'user') => {
  const secret = process.env.JWT_SECRET;
  const expire = process.env.JWT_EXPIRE || '7d';

  if (!secret || secret.length < 20) {
    throw new Error('JWT_SECRET is missing or too short in environment variables.');
  }

  return jwt.sign({ id, role }, secret, { expiresIn: expire });
};

/**
 * Verify a JWT and return the decoded payload.
 * Returns null if verification fails.
 * @param {string} token
 * @returns {object|null}
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

