// nearby.controller.js
import Location from '../models/location.model.js';


export const getNearbySalonsController = async (req, res, next) => {
  try {
    const { lat, long, city } = req.query;

    
    if (!lat || !long || !city) {
      return res.status(400).json({ message: "Latitude, longitude, and city are required." });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(long);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: "Latitude and longitude must be valid numbers." });
    }

    const maxDistance = 5000;

    
    let nearbyLocations = await Location.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [longitude, latitude] },
          distanceField: "distance",
          maxDistance: maxDistance,
          spherical: true,
          query: { status: 'active' }
        }
      },
      {
        $lookup: {
          from: 'saloons',
          localField: 'saloon',
          foreignField: '_id',
          as: 'saloon'
        }
      },
      { $unwind: "$saloon" },
      { $sort: { distance: 1 } }
    ]);


    if (nearbyLocations.length === 0) {
      nearbyLocations = await Location.find({ city, status: 'active' })
        .populate('saloon')
        .lean();
    }

 
    const salons = nearbyLocations.map(loc => loc.saloon).filter(Boolean);

    return res.status(200).json({
      success: true,
      message: 'Nearby salons fetched successfully',
      data: salons
    });

  } catch (err) {
    console.error("Error fetching nearby salons:", err);
    next(err);
  }
};
