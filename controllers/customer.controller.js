// controllers/customer.controller.js
import Customer from '../models/customer.model.js';
import { STATUS_CODES } from '../helpers/constants.js';
import { AppError } from '../helpers/error.js';
import Country from '../models/Country.model.js';
import CustomerLocationModel from '../models/CustomerLocation.model.js';



export const CustomerController = {};


export const getUserDetails = async (req, res, next) => {
  try {
    const customerId = res.locals.user.id;

  
    const customer = await Customer.findById(customerId).populate('country');
    if (!customer) {
      return next(new AppError('Customer not found', STATUS_CODES.NOT_FOUND));
    }

   
    const locations = await CustomerLocationModel.find({ customer: customerId });

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'User details fetched successfully',
      data: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        dob: customer.dob,
        gender: customer.gender,
        mobile: customer.mobile,
        status: customer.status,
        role: customer.role,
        user_state_status: customer.user_state_status,
        country: customer.country
          ? {
              id: customer.country._id,
              name: customer.country.name,
              code: customer.country.code,
            }
          : null,

          
          
        addresses: customer.addresses,
        locations,
        favouriteSaloonIds: customer.favouriteSaloonIds,
        lastTokenIssuedAt: customer.lastTokenIssuedAt,
         profileImage: customer.profileImage
        

      },
    });
  } catch (err) {
    next(err);
  }
};


CustomerController.getProfile = async (req, res, next) => {
  try {
    const customerId = res.locals.user.id;

    const customer = await Customer.findById(customerId).select('-otp -otpExpiresAt -__v');
    if (!customer) {
      return next(new AppError('Customer not found', STATUS_CODES.NOT_FOUND));
    }

    return res.status(STATUS_CODES.OK).json({
      message: 'Customer profile fetched successfully',
      data: customer,
    });
  } catch (err) {
    next(err);
  }
};



CustomerController.updateProfile = async (req, res, next) => {
  try {
    const customerId = res.locals.user.id;
    const { name, gender, status } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return next(new AppError('Customer not found', STATUS_CODES.NOT_FOUND));
    }

    if (name !== undefined) customer.name = name;
    if (gender !== undefined) customer.gender = gender;
    if (status !== undefined) customer.status = status;

    await customer.save();

    return res.status(STATUS_CODES.OK).json({
      message: 'Profile updated successfully',
      data: {
        id: customer._id,
        mobile: customer.mobile,
        name: customer.name,
        gender: customer.gender,
        status: customer.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

CustomerController.addOrUpdateProfile = async (req, res, next) => {
  try {
    const customerId = res.locals.user.id;
    const { name, gender, email, dob, mobile, status } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

  
    if (name) customer.name = name;
    if (gender) customer.gender = gender.toLowerCase();
    if (email) customer.email = email;
    if (dob) customer.dob = dob;
    if (status) customer.status = status;

    
    if (mobile && mobile !== customer.mobile) {
      const existingUser = await Customer.findOne({ mobile });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "This mobile number is already registered with another account.",
        });
      }
      customer.mobile = mobile;
    }

 
    if (req.file) {
      customer.profileImage = `/uploads/profile/${req.file.filename}`;
    }

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      data: {
        id: customer._id,
        name: customer.name,
        gender: customer.gender,
        email: customer.email,
        dob: customer.dob,
        mobile: customer.mobile,
        status: "active",
        profileImage: customer.profileImage
          ? `${req.protocol}://${req.get("host")}${customer.profileImage}`
          : null,
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);
    next(err);
  }
};


CustomerController.removeFavouriteSaloon = async (req, res, next) => {
  try {
    const customer = res.locals.user;
    const { saloonId } = req.body;

    const updated = await Customer.findByIdAndUpdate(
      customer.id,
      { $pull: { favouriteSaloonIds: saloonId } },
      { new: true }
    ).populate('favouriteSaloonIds', 'name logo');

    return res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Saloon removed from favourites',
      favourites: updated.favouriteSaloonIds
    });

  } catch (err) {
    next(err);
  }
};
CustomerController.addFavouriteSaloon = async (req, res, next) => {
  try {
    const customerId = res.locals.user.id; 
    const { saloonId } = req.body;

    if (!saloonId) {
      return next(new AppError("Saloon ID is required", STATUS_CODES.BAD_REQUEST));
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { $addToSet: { favouriteSaloonIds: saloonId } }, 
      { new: true }
    ).populate('favouriteSaloonIds', 'name logo address');

    return res.status(STATUS_CODES.OK).json({
      success: true,
      message: "Saloon added to favourites",
      favourites: updatedCustomer.favouriteSaloonIds
    });

  } catch (err) {
    next(err);
  }
};

CustomerController.removeFavouriteSaloon = async (req, res, next) => {
  try {
    const customerId = res.locals.user.id; 
    const { saloonId } = req.body;

    if (!saloonId) {
      return next(new AppError("Saloon ID is required", STATUS_CODES.BAD_REQUEST));
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { $pull: { favouriteSaloonIds: saloonId } },
      { new: true }
    ).populate('favouriteSaloonIds', 'name logo address');

    return res.status(STATUS_CODES.OK).json({
      success: true,
      message: "Saloon removed from favourites",
      favourites: updatedCustomer.favouriteSaloonIds
    });

  } catch (err) {
    next(err);
  }
};


CustomerController.getFavouriteSaloons = async (req, res, next) => {
  try {
    const customerId = res.locals.user.id;

    const customer = await Customer.findById(customerId)
      .populate('favouriteSaloonIds', 'name logo address');

    return res.status(STATUS_CODES.OK).json({
      success: true,
      count: customer.favouriteSaloonIds.length,
      favourites: customer.favouriteSaloonIds
    });

  } catch (err) {
    next(err);
  }
};


CustomerController.updateProfile = async (req, res, next) => {
  try {
    const customerId = res.locals.user.id;
    const { profileImage, name, mobile, email, dob, gender } = req.body;

   

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { profileImage, name, mobile, email, dob, gender },
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      return next(new AppError('Customer not found', STATUS_CODES.NOT_FOUND));
    }

    return res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedCustomer
    });

  } catch (err) {
    next(err);
  }
};






export const partialCustomerProfile = async (req, res, next) => {
  try {
    const { name, gender, status } = req.body;
    const customerId = res.locals.user.id; 
    
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return next(new AppError('Customer not found', STATUS_CODES.NOT_FOUND));
    }

    if (name) customer.name = name.trim();
    if (gender) customer.gender = gender;
    if (status) customer.status = status;
    customer.user_state_status = 4;

    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Customer profile updated successfully',
      customer: {
        id: customer._id,
        name: customer.name,
        gender: customer.gender,
        status: customer.status,
        user_state_status: customer.user_state_status,
      },
    });
  } catch (err) {
    next(err);
  }
};









CustomerController.deleteAccount = async (req, res, next) => {
   try {
    const customerId = res.locals.user.id; 

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return next(new AppError('Customer not found', STATUS_CODES.NOT_FOUND));
    }

    await customer.deleteOne();
    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Your account has been deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};