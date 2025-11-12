import Location from '../models/location.model.js';
import Saloon from '../models/saloon.model.js';
import { STATUS_CODES } from '../helpers/constants.js';

export const updateSaloonLocation = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;
    const {
      address1,
      address2,
      lat,
      long,
      pincode,
      area,
      city,
      state
    } = req.body;

    // Find saloon for this owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return res.status(404).json({ message: 'Saloon not found' });

    // Build location data
    const locationData = {
      saloon: saloon._id,
      owner: ownerId,
      address1,
      address2,
      lat,
      long,
      pincode,
      area,
      city,
      state,
      status: 'active',
      geoLocation: lat && long ? { type: 'Point', coordinates: [long, lat] } : undefined
    };

    // Remove undefined fields
    Object.keys(locationData).forEach(key => locationData[key] === undefined && delete locationData[key]);

    // Update if exists, otherwise create
    const location = await Location.findOneAndUpdate(
      { saloon: saloon._id }, // filter
      { $set: locationData },  // update fields
      { new: true, upsert: true } // return updated doc or insert if not found
    );

    return res.status(200).json({
      message: 'Saloon location updated successfully',
      location
    });
  } catch (err) {
    next(err);
  }
};



// export const updateSaloonLocation = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;
//     const {
//       address1,
//       address2,
//       lat,
//       long,
//       pincode,
//       area,
//       city,
//       state
//     } = req.body;

//     // Find saloon for this owner
//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) {
//       return res.status(404).json({ message: 'Saloon not found' });
//     }

//     // Find location by saloon id
//     let location = await Location.findOne({ saloon: saloon._id });

//     if (!location) {
//       // Create new location with geoLocation
//       location = new Location({
//         saloon: saloon._id,
//         owner: ownerId,
//         address1,
//         address2,
//         lat,
//         long,
//         pincode,
//         area,
//         city,
//         state,
//         status: 'active',
//         geoLocation: {
//           type: 'Point',
//           coordinates: [long, lat] // REQUIRED FIELD
//         }
//       });
//     } else {
//       // Update fields
//       const fields = { address1, address2, lat, long, pincode, area, city, state };
//       for (const [key, value] of Object.entries(fields)) {
//         if (value !== undefined) {
//           location[key] = value;
//         }
//       }

//       // Update geoLocation
//       if (lat && long) {
//         location.geoLocation = {
//           type: 'Point',
//           coordinates: [long, lat]
//         };
//       }
//     }

//     await location.save();

//     return res.status(200).json({
//       message: 'Saloon location updated successfully',
//       location
//     });
//   } catch (err) {
//     next(err);
//   }
// };



export const deleteSaloonLocation = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;
    const { locationId } = req.body; // Or req.params.locationId if using URL param

    // Validate input
    if (!locationId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: 'Location ID is required'
      });
    }

    // Find location belonging to this owner
    const location = await Location.findOne({ _id: locationId, owner: ownerId });

    if (!location) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        message: 'Location not found or does not belong to this owner'
      });
    }

    // Delete the location
    await location.deleteOne();

    return res.status(STATUS_CODES.OK).json({
      message: 'Location deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting location:', err); // Optional: log for debugging
    next(err);
  }
};




// export const updateSaloonLocation = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;
//     const {
//       address1,
//       address2,
//       lat,
//       long,
//       pincode,
//       area,
//       city,
//       state
//     } = req.body;

//     // Find saloon for this owner
//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) {
//       return res.status(404).json({ message: 'Saloon not found' });
//     }

//     // Find location by saloon id
//     let location = await Location.findOne({ saloon: saloon._id });

//     if (!location) {
//       // If no location exists yet, create new
//       location = new Location({
//         saloon: saloon._id,
//         address1,
//         address2,
//         lat,
//         long,
//         pincode,
//         area,
//         city,
//         state
//       });
//     } else {
//       // Update existing location fields if provided
//       const fields = { address1, address2, lat, long, pincode, area, city, state };
//       for (const [key, value] of Object.entries(fields)) {
//         if (value !== undefined) {
//           location[key] = value;
//         }
//       }
//     }

//     await location.save();

//     return res.status(200).json({ message: 'Saloon location updated successfully', location });
//   } catch (err) {
//     next(err);
//   }
// };
