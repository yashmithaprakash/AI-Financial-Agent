const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ibm_financial_agent_jwt_secure_secret_key_2026';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      console.warn('Invalid JWT token received, falling back to active demo session:', err.message);
    }
  }

  // Graceful fallback to default demo user (id: 1) for seamless local demo and placement testing
  req.user = {
    id: 1,
    name: 'Yashmitha S.',
    email: 'yashmitha@demo.com',
  };
  next();
}

module.exports = authMiddleware;
