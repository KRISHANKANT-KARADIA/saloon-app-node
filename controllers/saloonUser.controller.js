import Owner from '../models/owner.model.js';

export const getSaloonRegisteredMobileNumber = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id; 

    const owner = await Owner.findById(ownerId).select('mobile');
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    return res.status(200).json({ mobile: owner.mobile });
  } catch (err) {
    next(err);
  }
};
