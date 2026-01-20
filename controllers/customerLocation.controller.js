import CustomerLocation from '../models/CustomerLocation.model.js';
import Customer from '../models/customer.model.js';
import { AppError } from '../helpers/error.js';
import { STATUS_CODES } from '../helpers/constants.js';

export const CustomerLocationController = {
  
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

 
    if (!address1 || !pincode || !city || !state || lat === undefined || long === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required location fields",
      });
    }

    
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
    console.error("updateNewLocation error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
},

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

