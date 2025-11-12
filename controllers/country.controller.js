import Country from '../models/Country.model.js';
import Customer from '../models/customer.model.js';
import { STATUS_CODES } from '../helpers/constants.js';
import { AppError } from '../helpers/error.js';

// ✅ Add country & attach to user
export const addCountry = async (req, res, next) => {
  try {
    const { name, code } = req.body;

    // Validation
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

    // Normalize input
    const countryName = name.trim();
    const countryCode = code.trim().toUpperCase();

    // Check if country exists
    let country = await Country.findOne({
      $or: [{ name: countryName }, { code: countryCode }],
    });

    // Create new country if not found
    if (!country) {
      country = new Country({ name: countryName, code: countryCode });
      await country.save();
    }

    // Get logged-in customer
    const customerId = res.locals.user.id;
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return next(new AppError('Customer not found', STATUS_CODES.NOT_FOUND));
    }

    // Update customer data
    customer.country = country._id;
    customer.user_state_status = 3; // Mark that user has selected country
    await customer.save();

    // Populate response
    await customer.populate('country');

    res.status(201).json({
      success: true,
      message: 'Country added and user updated successfully',
      user: {
        id: customer._id,
        mobile: customer.mobile,
        user_state_status: customer.user_state_status,
        country: {
          id: customer.country._id,
          name: customer.country.name,
          code: customer.country.code,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Get all countries
export const getAllCountries = async (req, res, next) => {
  try {
    const countries = await Country.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      countries,
    });
  } catch (err) {
    next(err);
  }
};
