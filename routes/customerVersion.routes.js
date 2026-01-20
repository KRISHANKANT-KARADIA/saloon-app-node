import express from 'express';
import { Version } from '../models/version.model.js';

const router = express.Router();


router.post('/customer/version', async (req, res) => {
  try {
    const { version, platform, notes } = req.body;
    const newVersion = new Version({ version, platform, notes });
    await newVersion.save();
    res.status(201).json({ message: 'Version saved', data: newVersion });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save version' });
  }
});


router.get('/customer/version', async (req, res) => {
  try {
    const latest = await Version.findOne().sort({ createdAt: -1 });
    if (!latest) return res.status(404).json({ message: 'No versions found' });
    res.json(latest);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch version' });
  }
});



export default router;
