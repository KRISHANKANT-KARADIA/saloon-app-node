import OwnerLocation from '../models/OwnerLocation.js';
import Owner from '../models/owner.model.js';
import { STATUS_CODES } from '../helpers/constants.js';
import { AppError } from '../helpers/error.js';


export const OwnerLocationController = {};


 OwnerLocationController.addOrUpdateLocation = async (req, res, next) => {
    try {
      const ownerId = res.locals.user.id; 
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

  
      if (!address1 || !pincode || !city || !state || lat === undefined || long === undefined) {
        return next(new AppError('Missing required location fields', STATUS_CODES.BAD_REQUEST));
      }

     
      const geoLocation = { type: 'Point', coordinates: [long, lat] };

      
      let location = await OwnerLocation.findOne({ owner: ownerId, label });

      if (location) {
    
        ['address1','address2','lat','long','pincode','area','city','state'].forEach(field => {
          if (req.body[field] !== undefined) location[field] = req.body[field];
        });
        location.geoLocation = geoLocation;

        await location.save();
        const owner = await ownerModel.findById(ownerId);
        owner.owner_state_status = 2; 
        await owner.save();

        return res.status(200).json({
          success: true,
          message: 'Location updated successfully',
          location,
          owner_state_status: owner.owner_state_status
        });
      }

   
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
      const ownerId = res.locals.user.id; 

  
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

