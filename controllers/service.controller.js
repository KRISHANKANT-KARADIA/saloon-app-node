import Service from '../models/service.model.js';

import Saloon from '../models/saloon.model.js'; 

import { AppError } from '../helpers/error.js';
import { STATUS_CODES } from '../helpers/constants.js';


// export const createService = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;

//     // Find saloon of owner
//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) {
//       return next(new AppError("Saloon not found", STATUS_CODES.NOT_FOUND));
//     }

//     const { name, category, description, duration, price, status } = req.body;

//     // Multer file: req.file
//     const logo = req.file ? `/uploads/services/${req.file.filename}` : null;

//     const newService = new Service({
//       saloon: saloon._id,
//       name,
//       category,
//       description,
//       duration,
//       price,
//       logo,
//       status: status || "active",
//     });

//     await newService.save();

//     res.status(201).json({
//       message: "Service registered successfully",
//       data: newService,
//     });
//   } catch (err) {
//     next(err);
//   }
// };


// export const createService = async (req, res, next) => {
//   try {
//     const ownerId = res.locals.user.id;

//     // Find saloon of owner
//     const saloon = await Saloon.findOne({ owner: ownerId });
//     if (!saloon) {
//       return next(new AppError("Saloon not found", STATUS_CODES.NOT_FOUND));
//     }

//     const { name, category, description, duration, price, status } = req.body;

//     // Multer file: req.file
//     const logo = req.file ? `/uploads/services/${req.file.filename}` : null;

//     const newService = new Service({
//       saloon: saloon._id,
//       name,
//       category,
//       description,
//       duration,
//       price,
//       logo,
//       status: status || "active",
//     });

//     await newService.save();

//     res.status(201).json({
//       message: "Service registered successfully",
//       data: newService,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

export const createService = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;


    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return next(new AppError("Saloon not found", STATUS_CODES.NOT_FOUND));
    }

    const { name, category, description, duration, price, status } = req.body;


    // Multer file: req.file
    const logo = req.file ? `/uploads/services/${req.file.filename}` : null;

    if (!name || !category || !duration || !price) {
      return res.status(400).json({
        success: false,
        message: "Name, category, duration and price are required",
      });
    }

    // Base URL
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Full image URL (if uploaded)
    // const logo = req.file
    //   ? `${baseUrl}/uploads/services/${req.file.filename}`
    //   : null;


    const newService = new Service({
      saloon: saloon._id,
      name,
      category,
      description,
      duration,
      price,
      logo,
      status: status || "active",
    });

    await newService.save();

    res.status(201).json({

      success: true,
      message: "Service registered successfully",
      data: newService,
    });
  } catch (err) {

    console.error("Error creating service:", err);

    next(err);
  }
};




// export const updateService = async (req, res, next) => {
//   try {
//     const { serviceId } = req.params;
//     const updateData = { ...req.body };

//     // Optional: validate status if present
//     if (updateData.status && !['active', 'inactive'].includes(updateData.status)) {
//       return next(new AppError('Invalid status value', STATUS_CODES.BAD_REQUEST));
//     }

//     // Find and update the service
//     const updatedService = await Service.findByIdAndUpdate(
//       serviceId,
//       updateData,
//       { new: true, runValidators: true }
//     );

//     if (!updatedService) {
//       return next(new AppError('Service not found', STATUS_CODES.NOT_FOUND));
//     }

//     res.status(200).json({
//       message: 'Service updated successfully',
//       data: updatedService
//     });
//   } catch (err) {
//     next(err);
//   }
// };


export const updateService = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const { status } = req.body;

    if (status && !['active', 'inactive'].includes(status)) {
      return next(new AppError('Invalid status value', 400));
    }

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return next(new AppError('Service not found', 404));
    }

    res.status(200).json({
      message: 'Service updated successfully',
      data: updatedService
    });
  } catch (err) {
    next(err);
  }
};


export const getSaloonServices = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // Find the saloon owned by this user
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return next(new AppError('Saloon not found', STATUS_CODES.NOT_FOUND));
    }

    // Find services for this saloon
    const services = await Service.find({ saloon: saloon._id });

    res.status(200).json({
      message: 'Services retrieved successfully',
      data: services
    });
  } catch (err) {
    next(err);
  }
};

// Get all registered services (public, no auth)
export const getAllRegisteredServices = async (req, res, next) => {
  try {
    const services = await Service.find();

    if (!services || services.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No services registered yet"
      });
    }

    res.status(200).json({
      success: true,
      message: "All registered services fetched successfully",
      data: services
    });
  } catch (err) {
    console.error("Error fetching registered services:", err.message);
    next(err);
  }
};


export const getAllRegisteredActiveServices = async (req, res, next) => {
  try {
    // ✅ Fetch only active services
    const services = await Service.find({ status: "active" });

    if (!services || services.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active services found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Active services fetched successfully",
      count: services.length,
      data: services
    });
  } catch (err) {
    console.error("Error fetching active services:", err.message);
    next(err);
  }
};



// @route   GET /api/saloon/:saloonId/services
// @desc    Get all services for a given saloon ID
// @access  Public
export const getPublicServicesBySaloonId = async (req, res, next) => {
  try {
    const { saloonId } = req.params;

    if (!saloonId) {
      return res.status(400).json({ success: false, message: "Saloon ID is required" });
    }

    // Find services for this saloon
    const services = await Service.find({ saloon: saloonId });

    if (!services || services.length === 0) {
      return res.status(404).json({ success: false, message: "No services found for this saloon" });
    }

    res.status(200).json({
      success: true,
      message: "Services retrieved successfully",
      data: services
    });
  } catch (err) {
    console.error("Error fetching services:", err.message);
    next(err);
  }
};


export const deleteService = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;
    const { serviceId } = req.params;

    // Find the saloon owned by the user
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return next(new AppError('Saloon not found', STATUS_CODES.NOT_FOUND));
    }

    // Find the service and check if it belongs to this saloon
    const service = await Service.findOne({ _id: serviceId, saloon: saloon._id });
    if (!service) {
      return next(new AppError('Service not found or does not belong to your saloon', STATUS_CODES.NOT_FOUND));
    }

    // Delete the service
    await Service.findByIdAndDelete(serviceId);

    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (err) {
    next(err);
  }
};


// Get all saloons by category
export const getSaloonsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    // Find all services for this category
    const services = await Service.find({ category });

    const saloonIds = [...new Set(services.map((s) => s.saloon.toString()))];

    const saloons = await Saloon.find({ _id: { $in: saloonIds } });

    res.json({ success: true, saloons });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getSaloonsByCategorys = async (req, res) => {
  try {
    const { category } = req.params;

    // 1️⃣ Find services of this category (active or inactive)
    const services = await Service.find({ category });

    if (!services.length) {
      return res.json({ success: true, saloons: [] });
    }

    // 2️⃣ Extract unique saloon IDs
    const saloonIds = [...new Set(services.map((s) => s.saloon.toString()))];

    // 3️⃣ Fetch active saloon details
    const saloons = await Saloon.find({ _id: { $in: saloonIds }, status: 'active' }).select(
      'name address rating logo'
    );

    // 4️⃣ Return formatted response
    res.json({ success: true, saloons });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};


export const searchSalons = async (req, res, next) => {
  try {
    const { query } = req.query; // ?query=ha

    if (!query) {
      return next(new AppError('Query is required', STATUS_CODES.BAD_REQUEST));
    }

    // ✅ Case-insensitive, partial match (starts with or contains anywhere)
    const regex = new RegExp(query, 'i'); // "i" = case-insensitive

    // 🔹 Find services matching the query
    const matchedServices = await Service.find({

      name: { $regex: regex }, 

      name: { $regex: regex },
      status: 'active'
    });

    const salonIdsFromServices = matchedServices.map(s => s.saloon);

    // 🔹 Find salons matching name, city, address OR linked services
    const salons = await Saloon.find({
      $or: [
        { name: { $regex: regex } },
        { city: { $regex: regex } },
        { 'location.address1': { $regex: regex } },
        { _id: { $in: salonIdsFromServices } }
      ]
    });

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Salons fetched successfully',
      count: salons.length,
      data: salons
    });

  } catch (err) {
    next(err);
  }
};



// export const searchSalons = async (req, res, next) => {
//  try {
//       const { query = '', city = '', service = '' } = req.query;

//       // Build dynamic filter
//       const filters = {};

//       if (query) {
//         filters.name = { $regex: query, $options: 'i' }; // case-insensitive
//       }

//       if (city) {
//         filters.city = { $regex: city, $options: 'i' };
//       }

//       // Search by service
//       let serviceFilter = {};
//       if (service) {
//         const serviceDoc = await Service.find({ name: { $regex: service, $options: 'i' } });
//         const serviceIds = serviceDoc.map(s => s._id);
//         serviceFilter = { services: { $in: serviceIds } };
//       }

//       // Merge filters
//       const finalFilter = { ...filters, ...serviceFilter };

//       const salons = await Saloon.find(finalFilter)
//         .populate('services')
//         .limit(50); // limit results

//       res.status(STATUS_CODES.OK).json({
//         success: true,
//         message: 'Salons fetched successfully',
//         count: salons.length,
//         data: salons,
//       });
//     } catch (err) {
//       next(err);
//     }
// }

// export const searchSalons = async (req, res, next) => {
//   try {
//     const { query } = req.query; // ?query=haircut

//     if (!query) {
//       return next(new AppError('Query is required', STATUS_CODES.BAD_REQUEST));
//     }

//     // 🔹 Find services matching the query
//     const matchedServices = await Service.find({
//       name: { $regex: query, $options: 'i' }, // case-insensitive
//       status: 'active'
//     });

//     const salonIdsFromServices = matchedServices.map(s => s.saloon);

//     // 🔹 Find salons matching name, city, address OR linked services
//     const salons = await Saloon.find({
//       $or: [
//         { name: { $regex: query, $options: 'i' } },
//         { city: { $regex: query, $options: 'i' } },
//         { 'location.address1': { $regex: query, $options: 'i' } },
//         { _id: { $in: salonIdsFromServices } } // salons from matched services
//       ]
//     });

//     res.status(STATUS_CODES.OK).json({
//       success: true,
//       message: 'Salons fetched successfully',
//       count: salons.length,
//       data: salons
//     });

//   } catch (err) {
//     next(err);
//   }
// };

