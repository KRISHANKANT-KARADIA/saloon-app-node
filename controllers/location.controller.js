import Location from '../models/location.model.js';
import ownerModel from '../models/owner.model.js';

export const addSaloonLocation = async (req, res, next) => {
 
  try {
    const ownerId = res.locals.user.id;
    const { address1, address2, city, state, pincode, mapLink, lat, long } = req.body;

    // Find existing location
    let location = await Location.findOne({ owner: ownerId });

    if (location) {
      // Update existing location
      location.address1 = address1;
      location.address2 = address2;
      location.city = city;
      location.state = state;
      location.pincode = pincode;
      location.mapLink = mapLink; // exactly what user entered
      if (lat && long) {
        location.geoLocation.coordinates = [long, lat];
      }
      await location.save();
    } else {
      // Create new location
      location = await Location.create({
        owner: ownerId,
        address1,
        address2,
        city,
        state,
        pincode,
        mapLink,
        geoLocation: { type: "Point", coordinates: [long, lat] },
      });
    }

    // ✅ Update owner_state_status = 2
    await ownerModel.findByIdAndUpdate(ownerId, { owner_state_status: 2 });

    return res.status(200).json({
      message: "Location saved successfully",
      location,
      owner_state_status: 2
    });
  } catch (err) {
    next(err);
  }
};

// ✅ New controller to fetch location by logged-in owner
export const getSaloonLocation = async (req, res, next) => {
 try {
    const ownerId = res.locals.user.id;

    // Verify owner exists
    const owner = await ownerModel.findById(ownerId);
    if (!owner) return res.status(404).json({ message: "Owner not found" });

    // Fetch location by owner
    const location = await Location.findOne({ owner: ownerId });
    if (!location) return res.status(404).json({ message: "Location not found" });

    return res.status(200).json({
      message: "Location fetched successfully",
      location, // send exactly what is stored
    });
  } catch (err) {
    next(err);
  }
};

export const putSaloonNewLocation = async (req, res, next) => {
  try {
    const { address1, address2, lat, long, pincode, area, city, state, mapLink } = req.body; // include mapLink
    const ownerId = res.locals.user.id;

    const owner = await ownerModel.findById(ownerId);
    if (!owner) return res.status(404).json({ message: 'Owner not found' });

    // Find existing location
    let location = await Location.findOne({ owner: ownerId });
    if (!location) return res.status(404).json({ message: 'Location not found' });

    // Update fields
    location.address1 = address1 ?? location.address1;
    location.address2 = address2 ?? location.address2;
    location.lat = lat ?? location.lat;
    location.long = long ?? location.long;
    location.pincode = pincode ?? location.pincode;
    location.area = area ?? location.area;
    location.city = city ?? location.city;
    location.state = state ?? location.state;
    location.mapLink = mapLink ?? location.mapLink; // update mapLink

    if (lat && long) {
      location.geoLocation = { type: 'Point', coordinates: [long, lat] };
    }

    await location.save();

    return res.status(200).json({
      message: 'Location updated successfully',
      location
    });
  } catch (err) {
    next(err);
  }
};
