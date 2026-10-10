const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database/connection');
const { JWT_SECRET, authenticateToken, requireRole } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Cadastro público de novo usuário
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'O nome deve ter pelo menos 2 caracteres.' });
    }

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Por favor, informe um e-mail válido.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'A senha deve conter no mínimo 6 caracteres.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await db.findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Este e-mail já está cadastrado no sistema.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Novos cadastros comuns recebem sempre o perfil 'user'
    const newUser = await db.createUser({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: 'user',
      status: 'active'
    });

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Conta criada com sucesso!',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Erro no cadastro de usuário:', err);
    return res.status(500).json({ success: false, error: 'Erro interno ao realizar cadastro.' });
  }
});

/**
 * GET /api/auth/auto-admin
 * Autenticação automática como Administrador Root (Gamefy) para manter o login e contas fixas
 */
router.get('/auto-admin', async (req, res) => {
  try {
    const rootUser = await db.ensureDefaultRoot();
    if (!rootUser) {
      return res.status(500).json({ success: false, error: 'Administrador não inicializado.' });
    }

    const token = jwt.sign(
      { id: rootUser.id, name: rootUser.name, email: rootUser.email, role: rootUser.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: rootUser.id,
        name: rootUser.name,
        email: rootUser.email,
        role: rootUser.role,
        status: rootUser.status
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/auth/login
 * Login de usuário
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Informe e-mail e senha para acessar.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await db.findUserByEmail(cleanEmail);

    if (!user) {
      return res.status(401).json({ success: false, error: 'E-mail ou senha incorretos.' });
    }

    if (user.status && user.status !== 'active') {
      return res.status(403).json({ success: false, error: 'Sua conta está desativada ou suspensa. Contate o administrador.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'E-mail ou senha incorretos.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    };

    return res.json({
      success: true,
      message: 'Login efetuado com sucesso!',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ success: false, error: 'Erro interno ao efetuar login.' });
  }
});

/**
 * GET /api/auth/me
 * Retorna dados do usuário autenticado
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });
    }
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Erro ao obter dados do usuário.' });
  }
});

/**
 * PUT /api/auth/update-profile
 * Atualiza perfil ou senha do usuário conectado
 */
router.put('/update-profile', authenticateToken, async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const user = await db.findUserByEmail(req.user.email);

    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });
    }

    const updates = {};
    if (name && name.trim().length >= 2) {
      updates.name = name.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, error: 'Informe a senha atual para definir uma nova senha.' });
      }

      const match = await bcrypt.compare(currentPassword, user.password_hash);
      if (!match) {
        return res.status(400).json({ success: false, error: 'A senha atual informada está incorreta.' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' });
      }

      const salt = await bcrypt.genSalt(10);
      updates.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    const updated = await db.updateUser(user.id, updates);
    return res.json({ success: true, message: 'Perfil atualizado com sucesso!', user: updated });
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    return res.status(500).json({ success: false, error: 'Erro ao atualizar dados do perfil.' });
  }
});

/**
 * GET /api/auth/users
 * Painel Administrativo: Lista todos os usuários (Root e Admin)
 */
router.get('/users', authenticateToken, requireRole(['root', 'admin']), async (req, res) => {
  try {
    const users = await db.getAllUsers();
    return res.json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Erro ao listar usuários.' });
  }
});

/**
 * PUT /api/auth/users/:id/role
 * Painel Root: Altera a permissão de um usuário
 */
router.put('/users/:id/role', authenticateToken, requireRole(['root']), async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    const { role, status } = req.body;

    const validRoles = ['root', 'admin', 'user', 'member'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ success: false, error: 'Nível de permissão inválido.' });
    }

    const updated = await db.updateUser(targetId, { role, status });
    return res.json({ success: true, message: 'Permissões atualizadas com sucesso!', user: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Erro ao atualizar papel do usuário.' });
  }
});

/**
 * DELETE /api/auth/users/:id
 * Painel Root: Exclui um usuário
 */
router.delete('/users/:id', authenticateToken, requireRole(['root']), async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (targetId === req.user.id) {
      return res.status(400).json({ success: false, error: 'Você não pode excluir sua própria conta Root.' });
    }

    await db.deleteUser(targetId);
    return res.json({ success: true, message: 'Usuário removido com sucesso.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Erro ao remover usuário.' });
  }
});

module.exports = router;
