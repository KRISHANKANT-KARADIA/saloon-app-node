// import CustomerLocation from '../models/CustomerLocation.model.js';
// import { AppError } from '../helpers/error.js';
// import { STATUS_CODES } from '../helpers/constants.js';

// export const CustomerLocationController = {};

// // Add or update single location (upsert style, one per customer)
// CustomerLocationController.addOrUpdateCustomerLocation = async (req, res, next) => {
//   try {
//     const customerId = res.locals.user.id;

//     const {
//       address1,
//       address2,
//       lat,
//       long,
//       pincode,
//       area,
//       city,
//       state,
//       label,
//       geoLocation
//     } = req.body;

//     if (!address1 || !pincode || !city || !state) {
//       return next(new AppError("Required fields are missing", STATUS_CODES.BAD_REQUEST));
//     }

//     let location = await CustomerLocation.findOne({ customer: customerId });

//     if (location) {
//       location.set({
//         address1,
//         address2,
//         lat,
//         long,
//         pincode,
//         area,
//         city,
//         state,
//         label,
//         geoLocation,
//       });
//       await location.save();
//     } else {
//       location = new CustomerLocation({
//         customer: customerId,
//         address1,
//         address2,
//         lat,
//         long,
//         pincode,
//         area,
//         city,
//         state,
//         label,
//         geoLocation,
//       });
//       await location.save();
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Location saved successfully',
//       location
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Get single location (one per customer)
// CustomerLocationController.getCustomerLocation = async (req, res, next) => {
//   try {
//     const customerId = res.locals.user.id;

//     const location = await CustomerLocation.findOne({ customer: customerId });

//     if (!location) {
//       return next(new AppError('Location not found', STATUS_CODES.NOT_FOUND));
//     }

//     res.status(200).json({ success: true, location });
//   } catch (error) {
//     next(error);
//   }
// };

// // Add multiple locations
// CustomerLocationController.addLocation = async (req, res, next) => {
//   try {
//     const customerId = res.locals.user.id;

//     const {
//       label,
//       address1,
//       address2,
//       lat,
//       long,
//       pincode,
//       area,
//       city,
//       state,
//       geoLocation
//     } = req.body;

//     if (!address1 || !pincode || !city || !state) {
//       return next(new AppError('Missing required location fields', STATUS_CODES.BAD_REQUEST));
//     }

//     if (geoLocation) {
//       if (geoLocation.type !== 'Point' || !Array.isArray(geoLocation.coordinates) || geoLocation.coordinates.length !== 2) {
//         return next(new AppError('Invalid geoLocation format', STATUS_CODES.BAD_REQUEST));
//       }
//     }

//     const newLocation = new CustomerLocation({
//       customer: customerId,
//       label,
//       address1,
//       address2,
//       lat,
//       long,
//       pincode,
//       area,
//       city,
//       state,
//       geoLocation
//     });

//     await newLocation.save();

//     res.status(STATUS_CODES.CREATED).json({
//       success: true,
//       message: 'Location added successfully',
//       location: newLocation
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // Update location by locationId
// CustomerLocationController.updateLocation = async (req, res, next) => {
//   try {
//     const customerId = res.locals.user.id;
//     const locationId = req.params.locationId;
//     const updateData = req.body;

//     const location = await CustomerLocation.findOne({ _id: locationId, customer: customerId });
//     if (!location) {
//       return next(new AppError('Location not found or unauthorized', STATUS_CODES.NOT_FOUND));
//     }

//     // Update allowed fields only
//     const allowedFields = ['label', 'address1', 'address2', 'lat', 'long', 'pincode', 'area', 'city', 'state', 'geoLocation'];
//     allowedFields.forEach(field => {
//       if (updateData[field] !== undefined) {
//         location[field] = updateData[field];
//       }
//     });

//     await location.save();

//     res.status(STATUS_CODES.OK).json({
//       success: true,
//       message: 'Location updated successfully',
//       location
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // Get all locations for customer
// CustomerLocationController.getLocations = async (req, res, next) => {
//   try {
//     const customerId = res.locals.user.id;

//     const locations = await CustomerLocation.find({ customer: customerId }).sort({ createdAt: -1 });

//     res.status(STATUS_CODES.OK).json({
//       success: true,
//       count: locations.length,
//       locations
//     });
//   } catch (err) {
//     next(err);
//   }
// };


// import CustomerLocation from '../models/CustomerLocation.model.js';
// import { AppError } from '../helpers/error.js';
// import { STATUS_CODES } from '../helpers/constants.js';

// export const CustomerLocationController = {};

// // Add or update single location (upsert style, one per customer)
// CustomerLocationController.addOrUpdateCustomerLocation = async (req, res, next) => {
//   try {
//     const customerId = res.locals.user.id;

//     const {
//       address1,
//       address2,
//       lat,
//       long,
//       pincode,
//       area,
//       city,
//       state,
//       label,
//       geoLocation
//     } = req.body;

//     if (!address1 || !pincode || !city || !state) {
//       return next(new AppError("Required fields are missing", STATUS_CODES.BAD_REQUEST));
//     }

//     let location = await CustomerLocation.findOne({ customer: customerId });

//     if (location) {
//       location.set({
//         address1,
//         address2,
//         lat,
//         long,
//         pincode,
//         area,
//         city,
//         state,
//         label,
//         geoLocation,
//       });
//       await location.save();
//     } else {
//       location = new CustomerLocation({
//         customer: customerId,
//         address1,
//         address2,
//         lat,
//         long,
//         pincode,
//         area,
//         city,
//         state,
//         label,
//         geoLocation,
//       });
//       await location.save();
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Location saved successfully',
//       location
//     });
//   } catch (error) {
//     next(error);
//   }
// };
// CustomerLocationController.addMultipleLocations = async (req, res, next) => {
//   try {
//     const customerId = res.locals.user.id;
//     const locations = req.body.locations;

//     if (!Array.isArray(locations) || locations.length === 0) {
//       return next(new AppError('locations must be a non-empty array', STATUS_CODES.BAD_REQUEST));
//     }

//     const newLocations = locations.map(loc => ({
//       customer: customerId,
//       label: loc.label,
//       address1: loc.address1,
//       address2: loc.address2,
//       lat: loc.lat,
//       long: loc.long,
//       pincode: loc.pincode,
//       area: loc.area,
//       city: loc.city,
//       state: loc.state,
//       geoLocation: loc.geoLocation
//     }));

//     const inserted = await CustomerLocation.insertMany(newLocations);

//     res.status(STATUS_CODES.CREATED).json({
//       success: true,
//       message: 'Locations added successfully',
//       count: inserted.length,
//       locations: inserted
//     });
//   } catch (err) {
//     next(err);
//   }
// };


// CustomerLocationController.addLocation = async (req, res, next) => {
//   try {
//     const customerId = res.locals.user.id;

//     const {
//       label,
//       address1,
//       address2,
//       lat,
//       long,
//       pincode,
//       area,
//       city,
//       state,
//       geoLocation
//     } = req.body;

//     if (!address1 || !pincode || !city || !state) {
//       return next(new AppError('Missing required location fields', STATUS_CODES.BAD_REQUEST));
//     }

//     if (geoLocation) {
//       if (geoLocation.type !== 'Point' || !Array.isArray(geoLocation.coordinates) || geoLocation.coordinates.length !== 2) {
//         return next(new AppError('Invalid geoLocation format', STATUS_CODES.BAD_REQUEST));
//       }
//     }

//     const newLocation = new CustomerLocation({
//       customer: customerId,
//       label,
//       address1,
//       address2,
//       lat,
//       long,
//       pincode,
//       area,
//       city,
//       state,
//       geoLocation
//     });

//     await newLocation.save();

//     res.status(STATUS_CODES.CREATED).json({
//       success: true,
//       message: 'Location added successfully',
//       location: newLocation
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // Get all locations for a customer
// CustomerLocationController.getLocations = async (req, res, next) => {
//   try {
//     const customerId = res.locals.user.id;

//     const locations = await CustomerLocation.find({ customer: customerId }).sort({ createdAt: -1 });

//     res.status(STATUS_CODES.OK).json({
//       success: true,
//       count: locations.length,
//       locations
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // Optional: Delete a location by ID
// CustomerLocationController.deleteLocation = async (req, res, next) => {
//   try {
//     const customerId = res.locals.user.id;
//     const { locationId } = req.params;

//     const location = await CustomerLocation.findOneAndDelete({ _id: locationId, customer: customerId });

//     if (!location) {
//       return next(new AppError('Location not found', STATUS_CODES.NOT_FOUND));
//     }

//     res.status(STATUS_CODES.OK).json({
//       success: true,
//       message: 'Location deleted successfully'
//     });
//   } catch (err) {
//     next(err);
//   }
// };


// controllers/customerLocation.controller.js



// controllers/customerLocation.controller.js


// controllers/customerLocation.controller.js
// controllers/customerLocation.controller.js
import CustomerLocation from '../models/CustomerLocation.model.js';
import Customer from '../models/customer.model.js';
import { AppError } from '../helpers/error.js';
import { STATUS_CODES } from '../helpers/constants.js';

export const CustomerLocationController = {
  // ✅ Add or update a location
  addLocation: async (req, res, next) => {
    try {
      const customerId = res.locals.user.id;
      const {
        label = 'Home',
        address1,
        address2,
        lat,
        long,
        pincode,
        area,
        city,
        state,
        geoLocation
      } = req.body;

      if (!address1 || !pincode || !city || !state || lat === undefined || long === undefined) {
        return next(new AppError('Missing required location fields', STATUS_CODES.BAD_REQUEST));
      }

      const locationObj = geoLocation || { type: 'Point', coordinates: [long, lat] };

      let location = await CustomerLocation.findOne({ customer: customerId, label });
      if (location) {
        location.address1 = address1;
        location.address2 = address2;
        location.lat = lat;
        location.long = long;
        location.pincode = pincode;
        location.area = area;
        location.city = city;
        location.state = state;
        location.geoLocation = locationObj;

        await location.save();
      } else {
        location = new CustomerLocation({
          customer: customerId,
          label,
          address1,
          address2,
          lat,
          long,
          pincode,
          area,
          city,
          state,
          geoLocation: locationObj
        });

        await location.save();
      }

      const customer = await Customer.findById(customerId);
      customer.user_state_status = 2;
      await customer.save();

      res.status(STATUS_CODES.SUCCESSFULLY_CREATED).json({
        success: true,
        message: 'Location saved successfully',
        location,
        user_state_status: customer.user_state_status
      });
    } catch (err) {
      next(err);
    }
  },
    addLocation1: async (req, res, next) => {
    try {
      const customerId = res.locals.user.id;
      const {
        label = 'Home',
        address1,
        address2,
        lat,
        long,
        pincode,
        area,
        city,
        state,
        geoLocation
      } = req.body;

      if (!address1 || !pincode || !city || !state || lat === undefined || long === undefined) {
        return next(new AppError('Missing required location fields', STATUS_CODES.BAD_REQUEST));
      }

      const locationObj = geoLocation || { type: 'Point', coordinates: [long, lat] };

      let location = await CustomerLocation.findOne({ customer: customerId, label });
      if (location) {
        location.address1 = address1;
        location.address2 = address2;
        location.lat = lat;
        location.long = long;
        location.pincode = pincode;
        location.area = area;
        location.city = city;
        location.state = state;
        location.geoLocation = locationObj;

        await location.save();
      } else {
        location = new CustomerLocation({
          customer: customerId,
          label,
          address1,
          address2,
          lat,
          long,
          pincode,
          area,
          city,
          state,
          geoLocation: locationObj
        });

        await location.save();
      }

      const customer = await Customer.findById(customerId);
      customer.user_state_status = 4;
      await customer.save();

      res.status(STATUS_CODES.SUCCESSFULLY_CREATED).json({
        success: true,
        message: 'Location saved successfully',
        location,
        user_state_status: customer.user_state_status
      });
    } catch (err) {
      next(err);
    }
  },

  // ✅ Get all locations
  getLocations: async (req, res, next) => {
    try {
      const customerId = res.locals.user.id;
      const locations = await CustomerLocation.find({ customer: customerId }).sort({ createdAt: -1 });

      res.status(STATUS_CODES.OK).json({
        success: true,
        count: locations.length,
        locations
      });
    } catch (err) {
      next(err);
    }
  },

updateNewLocation: async (req, res, next) => {
  try {
    const customerId = res.locals.user.id;
    const { locationId } = req.params;
    const {
      label,
      address1,
      address2,
      lat,
      long,
      pincode,
      area,
      city,
      state,
      geoLocation,
    } = req.body;

    // 🔴 Validate required fields
    if (!address1 || !pincode || !city || !state || lat === undefined || long === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required location fields",
      });
    }

    // ✅ Check if location exists and belongs to customer
    const location = await CustomerLocation.findOne({
      _id: locationId,
      customer: customerId,
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    // ✅ Update fields
    location.label = label || location.label;
    location.address1 = address1;
    location.address2 = address2;
    location.lat = lat;
    location.long = long;
    location.pincode = pincode;
    location.area = area;
    location.city = city;
    location.state = state;
    location.geoLocation =
      geoLocation || { type: "Point", coordinates: [long, lat] };

    await location.save();

    // ✅ Update user_state_status = 2 (or keep highest state)
    const customer = await Customer.findById(customerId);
    if (customer && (!customer.user_state_status || customer.user_state_status < 2)) {
      customer.user_state_status = 2;
      await customer.save();
    }

    return res.status(200).json({
      success: true,
      message: "Location updated successfully",
      location,
      user_state_status: customer.user_state_status,
    });
  } catch (err) {
    console.error("❌ updateNewLocation error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
},

  // ✅ Delete a location
  deleteLocation: async (req, res, next) => {
    try {
      const customerId = res.locals.user.id;
      const { locationId } = req.params;

      const location = await CustomerLocation.findOneAndDelete({ _id: locationId, customer: customerId });

      if (!location) {
        return next(new AppError('Location not found', STATUS_CODES.NOT_FOUND));
      }

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: 'Location deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
};





// updateLocation : async (req, res, next) => {
//   try {
//     const customerId = res.locals.user.id;
//     const locationId = req.params.locationId;
//     const {
//       label,
//       address1,
//       address2,
//       lat,
//       long,
//       pincode,
//       area,
//       city,
//       state,
//       geoLocation,
//     } = req.body;

//     // Validate required fields
//     if (!address1 || !pincode || !city || !state || lat === undefined || long === undefined) {
//       return next(new AppError('Missing required location fields', STATUS_CODES.BAD_REQUEST));
//     }

//     // Build geoLocation if not provided
//     const locationObj = geoLocation || { type: 'Point', coordinates: [parseFloat(long), parseFloat(lat)] };

//     // Find location by ID and customer
//     const location = await CustomerLocation.findOne({ _id: locationId, customer: customerId });
//     if (!location) {
//       return next(new AppError('Location not found', STATUS_CODES.NOT_FOUND));
//     }

//     // Update fields
//     location.label = label || location.label;
//     location.address1 = address1;
//     location.address2 = address2 || location.address2;
//     location.lat = parseFloat(lat);
//     location.long = parseFloat(long);
//     location.pincode = pincode;
//     location.area = area || location.area;
//     location.city = city;
//     location.state = state;
//     location.geoLocation = locationObj;

//     await location.save();

//     res.status(STATUS_CODES.OK).json({
//       success: true,
//       message: 'Location updated successfully',
//       location,
//     });
//   } catch (err) {
//     next(err);
//   }
// };


// // controllers/customerLocation.controller.js
// import CustomerLocation from '../models/CustomerLocation.model.js';
// import Customer from '../models/customer.model.js';
// import { AppError } from '../helpers/error.js';
// import { STATUS_CODES } from '../helpers/constants.js';

// export const addLocation = async (req, res, next) => {
//   try {
//     const customerId = res.locals.user.id;
//     const {
//       label = 'Home',
//       address1,
//       address2,
//       lat,
//       long,
//       pincode,
//       area,
//       city,
//       state,
//       geoLocation
//     } = req.body;

//     if (!address1 || !pincode || !city || !state || lat === undefined || long === undefined) {
//       return next(new AppError('Missing required location fields', STATUS_CODES.BAD_REQUEST));
//     }

//     // Build geoLocation if not provided
//     const locationObj = geoLocation || { type: 'Point', coordinates: [long, lat] };

//     // Find existing location by label
//     let location = await CustomerLocation.findOne({ customer: customerId, label });
//     if (location) {
//       location.address1 = address1;
//       location.address2 = address2;
//       location.lat = lat;
//       location.long = long;
//       location.pincode = pincode;
//       location.area = area;
//       location.city = city;
//       location.state = state;
//       location.geoLocation = locationObj;

//       await location.save();
//     } else {
//       // Create new location
//       location = new CustomerLocation({
//         customer: customerId,
//         label,
//         address1,
//         address2,
//         lat,
//         long,
//         pincode,
//         area,
//         city,
//         state,
//         geoLocation: locationObj
//       });

//       await location.save();
//     }

//     // Update user_state_status to 3
//     const customer = await Customer.findById(customerId);
//     customer.user_state_status = 2;
//     await customer.save();

//     res.status(STATUS_CODES.SUCCESSFULLY_CREATED).json({
//       success: true,
//       message: 'Location saved successfully',
//       location,
//       user_state_status: customer.user_state_status
//     });

//   } catch (err) {
//     next(err);
//   }
// };


