import Location from '../models/location.model.js';
import { AppError } from '../helpers/error.js';
import { STATUS_CODES } from '../helpers/constants.js';

export const LocationownerController = {};

LocationownerController.getNearbySaloons = async (req, res, next) => {
  try {
    const { lat, long } = req.query;

    if (!lat || !long) {
      return next(new AppError('Latitude and Longitude are required', STATUS_CODES.BAD_REQUEST));
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(long);
<<<<<<< HEAD
    const radiusInMeters = 5 * 1000; 
=======
    const radiusInMeters = 5 * 1000;
>>>>>>> 27573fe1304c5274a50b02fa6d39d7db0f9513f5

    const nearbyLocations = await Location.find({
      geoLocation: {
        $near: {
          $geometry: {
            type: 'Point',
<<<<<<< HEAD
            coordinates: [longitude, latitude] 
=======
            coordinates: [longitude, latitude]
>>>>>>> 27573fe1304c5274a50b02fa6d39d7db0f9513f5
          },
          $maxDistance: radiusInMeters
        }
      }
    }).populate('saloon');

    return res.status(STATUS_CODES.OK).json({
      success: true,
      count: nearbyLocations.length,
      data: nearbyLocations
    });

  } catch (err) {
    next(err);
  }
};





LocationownerController.getAllSaloons = async (req, res, next) => {
<<<<<<< HEAD
    try {
        const allLocations = await Location.find().populate('saloon');

        return res.status(STATUS_CODES.OK).json({
            success: true,
            count: allLocations.length,
            data: allLocations
        });
    } catch (err) {
        next(err);
    }
=======
  try {
    const allLocations = await Location.find().populate('saloon');

    return res.status(STATUS_CODES.OK).json({
      success: true,
      count: allLocations.length,
      data: allLocations
    });
  } catch (err) {
    next(err);
  }
>>>>>>> 27573fe1304c5274a50b02fa6d39d7db0f9513f5
};
