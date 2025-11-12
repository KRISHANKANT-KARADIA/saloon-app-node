export const validateVersionInput = (req, res, next) => {
  const { version, platform } = req.body;

  if (!version) {
    return res.status(400).json({ message: 'Version is required' });
  }

  if (platform && !['android', 'ios', 'web'].includes(platform)) {
    return res.status(400).json({ message: 'Invalid platform' });
  }

  next();
};
