import Country from '../models/Country.model.js';
import Owner from '../models/owner.model.js';
import { STATUS_CODES } from '../helpers/constants.js';
import { AppError } from '../helpers/error.js';

export const addCountryForOwner = async (req, res, next) => {
  try {
    const { name, code } = req.body;

    // Validation
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

    // Normalize input
    const countryName = name.trim();
    const countryCode = code.trim().toUpperCase();

    // Check if country exists
    let country = await Country.findOne({
      $or: [{ name: countryName }, { code: countryCode }],
    });

    // Create new country if not found
    if (!country) {
      country = new Country({ name: countryName, code: countryCode });
      await country.save();
    }

    // Get logged-in owner
    const ownerId = res.locals.user.id;
    const owner = await Owner.findById(ownerId);

    if (!owner) {
      return next(new AppError('Owner not found', STATUS_CODES.NOT_FOUND));
    }

    // Update owner data
    owner.country = country._id;
    owner.owner_state_status = 3; // Mark that owner has selected country
    await owner.save();

    // Populate response
    await owner.populate('country');

    res.status(201).json({
      success: true,
      message: 'Country added and owner updated successfully',
      owner: {
        id: owner._id,
        mobile: owner.mobile,
        owner_state_status: owner.owner_state_status,
        country: {
          id: owner.country._id,
          name: owner.country.name,
          code: owner.country.code,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};



export const getLocationBySaloonId = async (req, res, next) => {
  try {
    const { saloonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(saloonId)) {
      return next(new AppError('Invalid saloon ID', STATUS_CODES.BAD_REQUEST));
    }

    // Find location linked to this saloon
    const location = await OwnerLocation.findOne({ saloon: saloonId });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found',
      });
    }

    res.status(200).json({
      success: true,
      location,
    });
  } catch (err) {
    next(err);
  }
};

