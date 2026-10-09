const express = require('express');
const router = express.Router();
const { db } = require('../database/connection');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

/**
 * GET /api/groups
 * Retorna todos os grupos do usuário (ou globais se autenticação opcional)
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const groups = await db.getGroups(userId);
    return res.json({ success: true, groups });
  } catch (err) {
    console.error('Erro ao listar grupos:', err);
    return res.status(500).json({ success: false, error: 'Erro ao carregar grupos.' });
  }
});

/**
 * GET /api/groups/:id
 * Retorna detalhes de um grupo
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const group = await db.getGroupById(req.params.id, userId);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Grupo não encontrado.' });
    }
    return res.json({ success: true, group });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Erro ao obter dados do grupo.' });
  }
});

/**
 * POST /api/groups
 * Cria um novo grupo
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, description, iconColor, platforms } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'O nome do grupo é obrigatório.' });
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({ success: false, error: 'Selecione pelo menos uma rede social para o grupo.' });
    }

    const userId = req.user ? req.user.id : 1;
    const newGroup = await db.createGroup({
      userId,
      name: name.trim(),
      description: description || '',
      iconColor: iconColor || '#6366f1',
      platforms
    });

    return res.status(201).json({
      success: true,
      message: 'Grupo criado com sucesso!',
      group: newGroup
    });
  } catch (err) {
    console.error('Erro ao criar grupo:', err);
    return res.status(500).json({ success: false, error: 'Erro ao cadastrar novo grupo.' });
  }
});

/**
 * PUT /api/groups/:id
 * Atualiza um grupo existente
 */
router.put('/:id', optionalAuth, async (req, res) => {
  try {
    const { name, description, iconColor, platforms } = req.body;
    const userId = req.user ? req.user.id : null;

    const existing = await db.getGroupById(req.params.id, userId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Grupo não encontrado.' });
    }

    const updated = await db.updateGroup(req.params.id, userId, {
      name,
      description,
      iconColor,
      platforms
    });

    return res.json({
      success: true,
      message: 'Grupo atualizado com sucesso!',
      group: updated
    });
  } catch (err) {
    console.error('Erro ao atualizar grupo:', err);
    return res.status(500).json({ success: false, error: 'Erro ao atualizar dados do grupo.' });
  }
});

/**
 * DELETE /api/groups/:id
 * Exclui um grupo
 */
router.delete('/:id', optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const existing = await db.getGroupById(req.params.id, userId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Grupo não encontrado.' });
    }

    await db.deleteGroup(req.params.id, userId);
    return res.json({ success: true, message: 'Grupo excluído com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir grupo:', err);
    return res.status(500).json({ success: false, error: 'Erro ao remover grupo.' });
  }
});

module.exports = router;
