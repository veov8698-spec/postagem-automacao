const express = require('express');
const router = express.Router();
const { db } = require('../database/connection');

router.get('/status', async (req, res) => {
  try {
    const dbStatus = db.getStatus();
    const allPosts = await db.getPosts();

    const stats = {
      total: allPosts.length,
      published: allPosts.filter(p => p.status === 'published').length,
      scheduled: allPosts.filter(p => p.status === 'scheduled').length,
      failed: allPosts.filter(p => p.status === 'failed').length,
      instagram: allPosts.filter(p => p.platforms?.includes('instagram')).length,
      facebook: allPosts.filter(p => p.platforms?.includes('facebook')).length,
      youtube: allPosts.filter(p => p.platforms?.includes('youtube')).length
    };

    res.json({
      success: true,
      database: dbStatus,
      stats,
      simulationMode: process.env.SIMULATE_API_PUBLISH === 'true'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
