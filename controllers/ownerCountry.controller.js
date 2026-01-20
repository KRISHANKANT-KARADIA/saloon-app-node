import Country from '../models/Country.model.js';
import Owner from '../models/owner.model.js';
import { STATUS_CODES } from '../helpers/constants.js';
import { AppError } from '../helpers/error.js';

export const addCountryForOwner = async (req, res, next) => {
  try {
    const { name, code } = req.body;

 
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

   
    const countryName = name.trim();
    const countryCode = code.trim().toUpperCase();


    let country = await Country.findOne({
      $or: [{ name: countryName }, { code: countryCode }],
    });

    if (!country) {
      country = new Country({ name: countryName, code: countryCode });
      await country.save();
    }

    const ownerId = res.locals.user.id;
    const owner = await Owner.findById(ownerId);

    if (!owner) {
      return next(new AppError('Owner not found', STATUS_CODES.NOT_FOUND));
    }


    owner.country = country._id;
    owner.owner_state_status = 3; 
    await owner.save();

    
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

