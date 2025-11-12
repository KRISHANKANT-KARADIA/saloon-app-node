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
    const radiusInMeters = 5 * 1000; // 5 km

    const nearbyLocations = await Location.find({
      geoLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude] // [long, lat]
          },
          $maxDistance: radiusInMeters
        }
      }
    }).populate('saloon'); // Get saloon details

    return res.status(STATUS_CODES.OK).json({
      success: true,
      count: nearbyLocations.length,
      data: nearbyLocations
    });

  } catch (err) {
    next(err);
  }
};




// Existing nearby saloons API
// LocationownerController.getNearbySaloons = async (req, res, next) => {
//     try {
//         const { lat, long } = req.query;
//         if (!lat || !long) {
//             return next(new AppError('Latitude and Longitude are required', STATUS_CODES.BAD_REQUEST));
//         }

//         const latitude = parseFloat(lat);
//         const longitude = parseFloat(long);
//         const radiusInMeters = 5 * 1000; // 5 km

//         const nearbyLocations = await Location.find({
//             geoLocation: {
//                 $near: {
//                     $geometry: { type: 'Point', coordinates: [longitude, latitude] },
//                     $maxDistance: radiusInMeters
//                 }
//             }
//         }).populate('saloon');

//         return res.status(STATUS_CODES.OK).json({
//             success: true,
//             count: nearbyLocations.length,
//             data: nearbyLocations
//         });
//     } catch (err) {
//         next(err);
//     }
// };

// New API to get all saloons
LocationownerController.getAllSaloons = async (req, res, next) => {
    try {
        const allLocations = await Location.find().populate('saloon'); // populate saloon details

        return res.status(STATUS_CODES.OK).json({
            success: true,
            count: allLocations.length,
            data: allLocations
        });
    } catch (err) {
        next(err);
    }
};
