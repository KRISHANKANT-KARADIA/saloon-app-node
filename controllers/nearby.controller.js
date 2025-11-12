// nearby.controller.js
import Location from '../models/location.model.js';

// Controller: Get Nearby Salons
export const getNearbySalonsController = async (req, res, next) => {
  try {
    const { lat, long, city } = req.query;

    // Validate input
    if (!lat || !long || !city) {
      return res.status(400).json({ message: "Latitude, longitude, and city are required." });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(long);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: "Latitude and longitude must be valid numbers." });
    }

    const maxDistance = 5000; // 5 km in meters

    // Use aggregation with $geoNear
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
          from: 'saloons', // ensure this matches your collection name
          localField: 'saloon',
          foreignField: '_id',
          as: 'saloon'
        }
      },
      { $unwind: "$saloon" },
      { $sort: { distance: 1 } } // sort by nearest first
    ]);

    // Fallback: if no nearby locations, get by city
    if (nearbyLocations.length === 0) {
      nearbyLocations = await Location.find({ city, status: 'active' })
        .populate('saloon')
        .lean();
    }

    // Extract salons
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
