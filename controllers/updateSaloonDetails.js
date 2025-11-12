import Saloon from '../models/saloon.model.js';

export const updateSaloonDetails = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;
    const updateData = req.body;

    // Find the saloon by owner
    const saloon = await Saloon.findOne({ owner: ownerId });

    if (!saloon) {
      return res.status(404).json({ message: 'Saloon not found' });
    }

    // Update fields from request body (only allow certain fields)
    const allowedFields = ['name', 'logo', 'ownerName', 'mobile'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        saloon[field] = updateData[field];
      }
    });

    await saloon.save();

    return res.status(200).json({ message: 'Saloon details updated successfully', saloon });
  } catch (err) {
    console.error('Error updating saloon details:', err.message);
    next(err);
  }
};
