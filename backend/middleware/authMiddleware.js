import jwt from 'jsonwebtoken';

/**
 * Protect middleware — verifies the Bearer JWT from the Authorization header.
 * Attaches `req.user = { id, role }` on success.
 */
export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — no Bearer token provided',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — empty token',
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('[Auth Middleware] JWT_SECRET is not set in environment variables!');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error — JWT not configured',
    });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Session expired — please log in again'
        : 'Not authorized — invalid token';
    return res.status(401).json({ success: false, message });
  }
};

/**
 * Role authorization middleware factory.
 * Usage: authorize('admin', 'agency')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied — requires role: ${roles.join(' or ')}`,
      });
    }
    return next();
  };
};
