const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'gamefy_social_publisher_secret_key_2026_secure';

/**
 * Middleware para exigir usuário autenticado via JWT
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['x-access-token'];
  const token = authHeader && (authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Acesso não autorizado. Token de autenticação não fornecido.',
      code: 'AUTH_REQUIRED'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Sessão expirada ou token inválido. Por favor, faça login novamente.',
        code: 'TOKEN_INVALID'
      });
    }

    req.user = decodedUser;
    next();
  });
}

/**
 * Middleware de autenticação opcional (anexa req.user se houver token válido)
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['x-access-token'];
  const token = authHeader && (authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader);

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (!err && decodedUser) {
      req.user = decodedUser;
    } else {
      req.user = null;
    }
    next();
  });
}

/**
 * Middleware de controle de acesso por papel (RBAC: root, admin, user, member)
 * Root sempre possui acesso total.
 */
function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado.',
        code: 'AUTH_REQUIRED'
      });
    }

    // Root possui passe livre administrativo
    if (req.user.role === 'root') {
      return next();
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Você não possui permissão para executar esta ação.',
        code: 'FORBIDDEN_ROLE',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  optionalAuth,
  requireRole
};
