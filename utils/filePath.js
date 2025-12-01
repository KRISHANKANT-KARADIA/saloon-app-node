export const buildFileUrl = (req, filePath) => {
  if (!filePath) return null;

  return `${req.protocol}://${req.get("host")}/uploads/${filePath}`;
};
