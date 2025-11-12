import OwnerLocation from '../models/OwnerLocation.js';
import Owner from '../models/owner.model.js';
import { STATUS_CODES } from '../helpers/constants.js';
import { AppError } from '../helpers/error.js';


export const OwnerLocationController = {};


 OwnerLocationController.addOrUpdateLocation = async (req, res, next) => {
    try {
      const ownerId = res.locals.user.id; // JWT se nikala ownerId
      const {
        label = 'Home',
        address1,
        address2,
        lat,
        long,
        pincode,
        area,
        city,
        state
      } = req.body;

      // 🔴 Validate required fields
      if (!address1 || !pincode || !city || !state || lat === undefined || long === undefined) {
        return next(new AppError('Missing required location fields', STATUS_CODES.BAD_REQUEST));
      }

      // 🔹 Construct geoLocation automatically
      const geoLocation = { type: 'Point', coordinates: [long, lat] };

      // 🔍 Check if location with same label exists for this owner
      let location = await OwnerLocation.findOne({ owner: ownerId, label });

      if (location) {
        // ✅ Update existing location
        ['address1','address2','lat','long','pincode','area','city','state'].forEach(field => {
          if (req.body[field] !== undefined) location[field] = req.body[field];
        });
        location.geoLocation = geoLocation;

        await location.save();
        const owner = await ownerModel.findById(ownerId);
        owner.owner_state_status = 2; // Example: profile completed
        await owner.save();

        return res.status(200).json({
          success: true,
          message: 'Location updated successfully',
          location,
          owner_state_status: owner.owner_state_status
        });
      }

      // ✅ Create new location if not exists
      location = new OwnerLocation({
        owner: ownerId,
        label,
        address1,
        address2,
        lat,
        long,
        pincode,
        area,
        city,
        state,
        geoLocation
      });

      await location.save();

      const owner = await Owner.findById(ownerId);
      owner.owner_state_status = 2;
      await owner.save();

      res.status(201).json({
        success: true,
        message: 'Location created successfully',
        location,
        owner_state_status: owner.owner_state_status
      });

    } catch (err) {
      next(err);
    }
  },
  OwnerLocationController.getLocations=async (req, res, next) => {
    try {
      const ownerId = res.locals.user.id; // From JWT

      // Optional: filter by label
      const { label } = req.query;
      const filter = { owner: ownerId };
      if (label) filter.label = label;

      const locations = await OwnerLocation.find(filter);

      if (!locations || locations.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No locations found for this owner'
        });
      }

      res.status(200).json({
        success: true,
        count: locations.length,
        locations
      });
    } catch (err) {
      next(err);
    }
  },

  // Optional: Get a single location by ID
  OwnerLocationController.getLocationById= async (req, res, next) => {
    try {
      const { locationId } = req.params;

      const location = await OwnerLocation.findById(locationId);

      if (!location) {
        return res.status(404).json({
          success: false,
          message: 'Location not found'
        });
      }

      res.status(200).json({
        success: true,
        location
      });
    } catch (err) {
      next(err);
    }
  }


// import OwnerLocation from '../models/OwnerLocation.js';
// import Owner from '../models/owner.model.js';
// import mongoose from 'mongoose';
// import Saloon from '../models/saloon.model.js';
// import { STATUS_CODES } from '../helpers/constants.js';
// import { AppError } from '../helpers/error.js';

// export const OwnerLocationController = {
//   // ✅ Add or update owner location
//   addLocation: async (req, res, next) => {
//     try {
//       const ownerId = res.locals.user.id; // JWT se nikala gaya ownerId
//       const {
//         label = 'Home',
//         address1,
//         address2,
//         lat,
//         long,
//         pincode,
//         area,
//         city,
//         state,
//         geoLocation
//       } = req.body;

//       // 🔴 Required field validation
//       if (!address1 || !pincode || !city || !state || lat === undefined || long === undefined) {
//         return next(new AppError('Missing required location fields', STATUS_CODES.BAD_REQUEST));
//       }

//       const locationObj = geoLocation || { type: 'Point', coordinates: [long, lat] };

//       // 🔍 Agar same label ke saath location already exist hai to update karo
//       let location = await OwnerLocation.findOne({ owner: ownerId, label });
//       if (location) {
//         location.address1 = address1;
//         location.address2 = address2;
//         location.lat = lat;
//         location.long = long;
//         location.pincode = pincode;
//         location.area = area;
//         location.city = city;
//         location.state = state;
//         location.geoLocation = locationObj;

//         await location.save();
//       } else {
//         // ✅ Nayi location create karo
//         location = new OwnerLocation({
//           owner: ownerId,
//           label,
//           address1,
//           address2,
//           lat,
//           long,
//           pincode,
//           area,
//           city,
//           state,
//           geoLocation: locationObj
//         });

//         await location.save();
//       }

//       // 👤 Owner ka state status update kar do (jaise customer me kiya tha)
//       const owner = await Owner.findById(ownerId);
//       owner.owner_state_status = 2; // Example: profile completed
//       await owner.save();

//       res.status(STATUS_CODES.SUCCESSFULLY_CREATED).json({
//         success: true,
//         message: 'Owner location saved successfully',
//         location,
//         owner_state_status: owner.owner_state_status
//       });
//     } catch (err) {
//       next(err);
//     }
//   },

// getLocationBySaloonId:async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id; // token se nikala owner ID

//     // Find location(s) for this owner
//     const location = await OwnerLocation.findOne({ owner: ownerId });

//     if (!location) {
//       return res.status(404).json({ success: false, message: 'Location not found' });
//     }

//     res.status(200).json({ success: true, location });
//   } catch (err) {
//     next(err);
//   }
// },


// updateLocationByToken: async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;
//     const { label, address1, address2, lat, long, pincode, area, city, state, geoLocation } = req.body;

//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) {
//       return next(new AppError('No saloon found for this owner. Please register a saloon first.', STATUS_CODES.NOT_FOUND));
//     }

//     let location = await OwnerLocation.findOne({ saloon: saloon._id });

//     if (!location) {
//       location = new OwnerLocation({ saloon: saloon._id });
//     }

//     Object.assign(location, { label, address1, address2, lat, long, pincode, area, city, state, geoLocation });

//     await location.save();

//     res.status(200).json({
//       success: true,
//       message: 'Location updated successfully',
//       location
//     });
//   } catch (err) {
//     next(err);
//   }
// },


// updateLocationBySaloonId: async (req, res, next) => {
//   try {
//     const { saloonId, label, address1, address2, lat, long, pincode, area, city, state } = req.body;

//     if (!saloonId) return res.status(400).json({ success: false, message: 'saloonId is required' });

//     // Construct geoLocation from lat/long
//     const geoLocation = (lat !== undefined && long !== undefined) 
//       ? { type: 'Point', coordinates: [long, lat] } 
//       : undefined;

//     // Find existing location
//     let location = await OwnerLocation.findOne({ saloon: saloonId });

//     if (location) {
//       // Update existing location
//       ['label','address1','address2','lat','long','pincode','area','city','state'].forEach(field => {
//         if (req.body[field] !== undefined) location[field] = req.body[field];
//       });
//       if (geoLocation) location.geoLocation = geoLocation;
//       await location.save();
//       return res.json({ success: true, message: 'Location updated successfully', location });
//     }

//     // Create new location if not exists
//     location = new OwnerLocation({ saloon: saloonId, label, address1, address2, lat, long, pincode, area, city, state, geoLocation });
//     await location.save();

//     res.json({ success: true, message: 'Location created successfully', location });

//   } catch (err) {
//     next(err);
//   }
// }
// ,
// };



