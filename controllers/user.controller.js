import Owner from '../models/owner.model.js'; 


export const createUser = async (req, res, next) => {
  try {
    const {
     
      mobile,
      role,
      name,
      gender,
      saloonName,
      ownerName,
      logo,
      location
    } = req.body;

    if (!mobile) {
      return res.status(400).json({ success: false, message: 'Mobile is required' });
    }

    let user = await Owner.findOne({ mobile });

    if (!user) {
     

    user = new Owner({
  mobile,
  role: role ? role.toLowerCase() : 'owner', 
  name,
  gender,
  saloonName,
  ownerName,
  logo,
  location
});

      await user.save();
    }

    res.status(201).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};



export const getAllUsers = async (req, res, next) => {
  try {
    const requestingUser = res.locals.user;

    
    console.log('Requesting user:', requestingUser);

   
    if (!requestingUser || requestingUser.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admins only.',
      });
    }

    const users = await Owner.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};




export const updateSaloonInfo = async (req, res, next) => {
  try {
    const { id } = req.params; 
    const { saloonName, ownerName, logo } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const updatedFields = {};

    if (saloonName) updatedFields.saloonName = saloonName;
    if (ownerName) updatedFields.ownerName = ownerName;
    if (logo) updatedFields.logo = logo;

    const user = await Owner.findByIdAndUpdate(id, updatedFields, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'Saloon info updated', user });
  } catch (error) {
    next(error);
  }
};



export const getMySaloonProfile = async (req, res, next) => {
  try {
    const { id, role } = res.locals.user;

    if (!id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User ID missing' });
    }

    if (role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only owners can access this endpoint',
      });
    }

    const saloon = await Owner.findById(id).select('-__v -otp -otpExpiresAt -lastTokenIssuedAt');

    if (!saloon) {
      return res.status(404).json({
        success: false,
        message: 'Saloon not found',
      });
    }

    res.status(200).json({
      success: true,
      saloon: {
        ...saloon.toObject(),
        registrationDate: saloon.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const getRegisteredMobileNumber = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    const owner = await ownerModel.findById(ownerId).select('mobile');
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    return res.status(200).json({ mobile: owner.mobile });
  } catch (err) {
    next(err);
  }
};
