import Service from '../models/service.model.js';

import Saloon from '../models/saloon.model.js'; 

import { AppError } from '../helpers/error.js';
import { STATUS_CODES } from '../helpers/constants.js';
import { buildFileUrl } from "../utils/filePath.js";




export const createService = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return next(new AppError("Saloon not found", STATUS_CODES.NOT_FOUND));
    }

    const { name, category, description, duration, price, status } = req.body;

    if (!name || !category || !duration || !price) {
      return res.status(400).json({
        success: false,
        message: "Name, category, duration and price are required",
      });
    }

    const BASE_URL = "https://saloon-app-node-50470848550.asia-south1.run.app";

 
    const logo = req.file
      ? `${BASE_URL}/uploads/services/${req.file.filename}`
      : null;

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

  
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return next(new AppError('Saloon not found', STATUS_CODES.NOT_FOUND));
    }

  
    const services = await Service.find({ saloon: saloon._id });

   
    const BASE_URL = `${req.protocol}://${req.get('host')}`;


    const formattedServices = services.map(service => ({
      ...service._doc,
      logo: `${service.logo}`,  
      
    }));

    return res.status(200).json({
      message: 'Services retrieved successfully',
      data: formattedServices
    });

  } catch (err) {
    next(err);
  }
};


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



export const getPublicServicesBySaloonId = async (req, res, next) => {
  try {
    const { saloonId } = req.params;

    if (!saloonId) {
      return res.status(400).json({ success: false, message: "Saloon ID is required" });
    }

   
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

 
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return next(new AppError('Saloon not found', STATUS_CODES.NOT_FOUND));
    }

 
    const service = await Service.findOne({ _id: serviceId, saloon: saloon._id });
    if (!service) {
      return next(new AppError('Service not found or does not belong to your saloon', STATUS_CODES.NOT_FOUND));
    }

 
    await Service.findByIdAndDelete(serviceId);

    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (err) {
    next(err);
  }
};


export const getSaloonsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const services = await Service.find({ category });

    const saloonIds = [...new Set(services.map((s) => s.saloon.toString()))];

    const saloons = await Saloon.find({ _id: { $in: saloonIds } });


    const BASE_URL = "https://saloon-app-node-50470848550.asia-south1.run.app";

    const updatedSaloons = saloons.map((saloon) => {
      return {
        ...saloon._doc,
        logo: saloon.logo
          ? `${saloon.logo}`
          : null,
          category: saloon.category,
      };
    });

    res.json({ success: true, saloons: updatedSaloons });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const getSaloonsByCategorys = async (req, res) => {
  try {
    const { category } = req.params;

 
    const services = await Service.find({ category });

    if (!services.length) {
      return res.json({ success: true, saloons: [] });
    }

   
    const saloonIds = [...new Set(services.map((s) => s.saloon.toString()))];

    
    const saloons = await Saloon.find({ _id: { $in: saloonIds }, status: 'active' }).select(
      'name address rating logo'
    );

  
    res.json({ success: true, saloons });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const searchSalons = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) {
      return next(new AppError('Query is required', STATUS_CODES.BAD_REQUEST));
    }

   
    const normalizedQuery = query.replace(/\s+/g, '').toLowerCase();


    const matchedServices = await Service.aggregate([
      {
        $addFields: {
          normalizedName: {
            $replaceAll: { input: { $toLower: "$name" }, find: " ", replacement: "" }
          }
        }
      },
      {
        $match: {
          status: "active",
          normalizedName: { $regex: normalizedQuery, $options: "i" }
        }
      }
    ]);

    const salonIdsFromServices = matchedServices.map(s => s.saloon);

  
    const salons = await Saloon.aggregate([
      {
        $addFields: {
          normalizedName: {
            $replaceAll: { input: { $toLower: "$name" }, find: " ", replacement: "" }
          },
          normalizedCity: {
            $replaceAll: { input: { $toLower: "$city" }, find: " ", replacement: "" }
          },
          normalizedAddress: {
            $replaceAll: { input: { $toLower: "$location.address1" }, find: " ", replacement: "" }
          }
        }
      },
      {
        $match: {
          $or: [
            { normalizedName: { $regex: normalizedQuery } },
            { normalizedCity: { $regex: normalizedQuery } },
            { normalizedAddress: { $regex: normalizedQuery } },
            { _id: { $in: salonIdsFromServices } }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: "Salons fetched successfully",
      count: salons.length,
      data: salons
    });

  } catch (err) {
    next(err);
  }
};


