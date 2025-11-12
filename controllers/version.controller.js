import { Version } from '../models/version.model.js';

export const createVersion = async (req, res, next) => {
  try {
    const { version, platform, notes } = req.body;

    const newVersion = await Version.create({ version, platform, notes });
    res.status(201).json({ message: 'Version created', data: newVersion });
  } catch (err) {
    next(err);
  }
};

export const getLatestVersion = async (req, res, next) => {
  try {
    const { platform } = req.query;

    const query = platform ? { platform } : {};
    const latest = await Version.findOne(query).sort({ createdAt: -1 });

    if (!latest) {
      return res.status(404).json({ message: 'No version found' });
    }

    res.status(200).json({
      version: latest.version,
      notes: latest.notes,
      platform: latest.platform,
    });
  } catch (err) {
    next(err);
  }
};
