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

    // Fetch customer
    const customer = await Customer.findById(customerId).populate('country');
    if (!customer) {
      return next(new AppError('Customer not found', STATUS_CODES.NOT_FOUND));
    }

    // Fetch all locations of the customer
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
        locations, // ✅ all saved locations
        favouriteSaloonIds: customer.favouriteSaloonIds,
        lastTokenIssuedAt: customer.lastTokenIssuedAt,
         profileImage: customer.profileImage
        

      },
    });
  } catch (err) {
    next(err);
  }
};

// Get authenticated customer details
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



// Update/Add personal details
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



// CustomerController.addOrUpdateProfile = async (req, res, next) => {
//   try {
//     const customerId = res.locals.user.id;
//     const {
//       name,
//       gender,
//       status,
//       email,
//       dob,
//       address1,
//       address2,
//       pincode,
//       area,
//       city,
//       state,
//       lat,
//       lon,
//       label,
//       countryId,
//       countryCode,
//       countryName,
//     } = req.body;

//     const customer = await Customer.findById(customerId);
//     if (!customer) {
//       return next(new AppError('Customer not found', STATUS_CODES.NOT_FOUND));
//     }

//     // ✅ Basic info
//     if (name) customer.name = name;
//     if (gender) customer.gender = gender;
//     if (status) customer.status = status;
//     if (email) customer.email = email;
//     if (dob) customer.dob = dob;

//     // ✅ Country lookup
//     let country = null;
//     if (countryId) {
//       country = await Country.findById(countryId);
//     } else if (countryCode) {
//       country = await Country.findOne({ code: countryCode.trim().toUpperCase() });
//     } else if (countryName) {
//       country = await Country.findOne({ name: countryName.trim() });
//     }

//     if (country) {
//       customer.country = country._id;
//     }

//     // ✅ Address addition (append or update as needed)
//     if (address1 && pincode && city && state && lat !== undefined && lon !== undefined) {
//       const newAddress = {
//         label: label || 'Home',
//         address1,
//         address2,
//         pincode,
//         area,
//         city,
//         state,
//         geoLocation: {
//           type: 'Point',
//           coordinates: [parseFloat(lon), parseFloat(lat)],
//         },
//       };

//       // You can replace all addresses or push. For now, let's replace first address
//       customer.addresses = [newAddress];
//     }

//     await customer.save();
//     await customer.populate('country');

//     res.status(STATUS_CODES.OK).json({
//       message: 'Profile saved successfully',
//       data: {
//         id: customer._id,
//         name: customer.name,
//         gender: customer.gender,
//         email: customer.email,
//         dob: customer.dob,
//         status: customer.status,
//         mobile: customer.mobile,
//         role: customer.role,
//         country: customer.country
//           ? {
//               id: customer.country._id,
//               name: customer.country.name,
//               code: customer.country.code,
//             }
//           : null,
//         addresses: customer.addresses,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// CustomerController.addOrUpdateProfile = async (req, res, next) => {
//   try {
//     const customerId = res.locals.user.id;
//     const {
//       name,
//       gender,
//       status,
//       email,
//       dob,
//       mobile,
//       address1,
//       address2,
//       pincode,
//       area,
//       city,
//       state,
//       lat,
//       lon,
//       label,
//       countryId,
//       countryCode,
//       countryName,
//     } = req.body;

//     const customer = await Customer.findById(customerId);
//     if (!customer) {
//       return next(new AppError('Customer not found', STATUS_CODES.NOT_FOUND));
//     }

//     // ✅ Basic info
//     if (name) customer.name = name;
//     if (gender) customer.gender = gender.toLowerCase();
//     if (status) customer.status = status;
//     if (email) customer.email = email;
//     if (dob) customer.dob = dob;

//     // ✅ Mobile update logic with duplicate check
//     if (mobile && mobile !== customer.mobile) {
//       const existingUser = await Customer.findOne({ mobile });
//       if (existingUser) {
//         return res.status(400).json({
//           success: false,
//           message: 'This mobile number is already registered with another account.',
//         });
//       }

//       customer.mobile = mobile;

//       // ⚠️ Force re-login if mobile changed
//       await customer.save();
//       return res.status(200).json({
//         success: true,
//         message: 'Mobile number updated. Please login again with your new number.',
//         forceLogout: true,
//       });
//     }

//     // ✅ Country lookup
//     let country = null;
//     if (countryId) {
//       country = await Country.findById(countryId);
//     } else if (countryCode) {
//       country = await Country.findOne({ code: countryCode.trim().toUpperCase() });
//     } else if (countryName) {
//       country = await Country.findOne({ name: countryName.trim() });
//     }

//     if (country) {
//       customer.country = country._id;
//     }

//     // ✅ Address addition
//     if (address1 && pincode && city && state && lat !== undefined && lon !== undefined) {
//       const newAddress = {
//         label: label || 'Home',
//         address1,
//         address2,
//         pincode,
//         area,
//         city,
//         state,
//         geoLocation: {
//           type: 'Point',
//           coordinates: [parseFloat(lon), parseFloat(lat)],
//         },
//       };
//       customer.addresses = [newAddress];
//     }

//     // ✅ Mark profile completed
//     customer.user_state_status = 4;

//     await customer.save();
//     await customer.populate('country');

//     res.status(200).json({
//       success: true,
//       message: 'Profile saved successfully',
//       data: {
//         id: customer._id,
//         name: customer.name,
//         gender: customer.gender,
//         email: customer.email,
//         dob: customer.dob,
//         status: customer.status,
//         mobile: customer.mobile,
//         role: customer.role,
//         user_state_status: customer.user_state_status,
//         country: customer.country
//           ? {
//               id: customer.country._id,
//               name: customer.country.name,
//               code: customer.country.code,
//             }
//           : null,
//         addresses: customer.addresses,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };

CustomerController.addOrUpdateProfile = async (req, res, next) => {
  try {
    const customerId = res.locals.user.id;
    const { name, gender, email, dob, mobile, status } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    // ✅ Update basic info
    if (name) customer.name = name;
    if (gender) customer.gender = gender.toLowerCase();
    if (email) customer.email = email;
    if (dob) customer.dob = dob;
    if (status) customer.status = status;

    // ✅ Mobile number update with duplicate check
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

    // ✅ Profile image
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





// CustomerController.addOrUpdateProfile = async (req, res, next) => {
//   try {
//     const customerId = res.locals.user.id;
//     const {
//       name,
//       gender,
//       status,
//       email,
//       dob,
//       mobile, 
//       address1,
//       address2,
//       pincode,
//       area,
//       city,
//       state,
//       lat,
//       lon,
//       label,
//       countryId,
//       countryCode,
//       countryName,
//     } = req.body;

//     const customer = await Customer.findById(customerId);
//     if (!customer) {
//       return next(new AppError('Customer not found', STATUS_CODES.NOT_FOUND));
//     }

//     // ✅ Basic info
//     if (name) customer.name = name;
//     if (gender) customer.gender = gender;
//     if (status) customer.status = status;
//     if (email) customer.email = email;
//     if (dob) customer.dob = dob;

//     // ✅ Country lookup
//     let country = null;
//     if (countryId) {
//       country = await Country.findById(countryId);
//     } else if (countryCode) {
//       country = await Country.findOne({ code: countryCode.trim().toUpperCase() });
//     } else if (countryName) {
//       country = await Country.findOne({ name: countryName.trim() });
//     }

//     if (country) {
//       customer.country = country._id;
//     }

//     // ✅ Address addition (replace first address)
//     if (address1 && pincode && city && state && lat !== undefined && lon !== undefined) {
//       const newAddress = {
//         label: label || 'Home',
//         address1,
//         address2,
//         pincode,
//         area,
//         city,
//         state,
//         geoLocation: {
//           type: 'Point',
//           coordinates: [parseFloat(lon), parseFloat(lat)],
//         },
//       };

//       customer.addresses = [newAddress];
//     }

//     // ✅ Update user_state_status to 4 after profile completion
//     customer.user_state_status = 4;

//     await customer.save();
//     await customer.populate('country');

//     res.status(STATUS_CODES.OK).json({
//         success: true,
//       message: 'Profile saved successfully',
//       data: {
//         id: customer._id,
//         name: customer.name,
//         gender: customer.gender,
//         email: customer.email,
//         dob: customer.dob,
//         status: customer.status,
//         mobile: customer.mobile,
//         role: customer.role,
//         user_state_status: customer.user_state_status, // ✅ send updated status
//         country: customer.country
//           ? {
//               id: customer.country._id,
//               name: customer.country.name,
//               code: customer.country.code,
//             }
//           : null,
//         addresses: customer.addresses,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };


// ✅ Remove saloon from favourites
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
    const customerId = res.locals.user.id; // From auth middleware
    const { saloonId } = req.body;

    if (!saloonId) {
      return next(new AppError("Saloon ID is required", STATUS_CODES.BAD_REQUEST));
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { $addToSet: { favouriteSaloonIds: saloonId } }, // $addToSet avoids duplicates
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

// Get all favourite saloons for the customer
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

    // You may want validation here

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





// Insert Partial Details


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
    const customerId = res.locals.user.id; // assuming auth middleware sets this

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return next(new AppError('Customer not found', STATUS_CODES.NOT_FOUND));
    }

    // Delete the customer document
    await customer.deleteOne(); // or Customer.findByIdAndDelete(customerId)

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Your account has been deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};