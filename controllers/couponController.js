import Coupon from "../models/Coupon.js";


export const addCoupon = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    const {
      code,
      title,
      description,
      discount_type,
      discount_value,
      min_order_value,
      valid_from,
      valid_until,
      max_uses,
      max_uses_per_user,
      applicable_services
    } = req.body;

    const existing = await Coupon.findOne({ owner: ownerId, code });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = new Coupon({
      owner: ownerId,
      code: code || Math.random().toString(36).substring(2, 8).toUpperCase(),
      title,
      description,
      discount_type,
      discount_value,
      min_order_value,
      valid_from,
      valid_until,
      max_uses,
      max_uses_per_user,
      applicable_services,
      active: true
    });

    await coupon.save();

    res.status(201).json({ success: true, coupon });
  } catch (err) {
    next(err);
  }
};

// ➤ Get coupon details
export const getCoupon = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;
    const { code } = req.params;

    const coupon = await Coupon.findOne({ owner: ownerId, code });
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: 'Coupon not found' });
    }

    res.json({ success: true, coupon });
  } catch (err) {
    next(err);
  }
};

export const getAllCoupons = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    const coupons = await Coupon.find({ owner: ownerId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: coupons.length,
      coupons
    });
  } catch (err) {
    next(err);
  }
};

// ➤ Verify coupon
// export const verifyCoupon = async (req, res, next) => {
//   try {
//     const { code, cart_amount, service_ids, user_id } = req.body;

//     const coupon = await Coupon.findOne({ code });
//     if (!coupon) {
//       return res.json({ valid: false, reason: 'not_found' });
//     }

//     const now = new Date();
//     if (!coupon.active || now < coupon.valid_from || now > coupon.valid_until) {
//       return res.json({ valid: false, reason: 'expired' });
//     }

//     if (coupon.min_order_value && cart_amount < coupon.min_order_value) {
//       return res.json({ valid: false, reason: 'min_order_not_met' });
//     }

//     if (
//       coupon.applicable_services?.length &&
//       service_ids?.length &&
//       !service_ids.some(s => coupon.applicable_services.includes(s))
//     ) {
//       return res.json({ valid: false, reason: 'not_applicable_service' });
//     }

//     if (coupon.max_uses && coupon.uses >= coupon.max_uses) {
//       return res.json({ valid: false, reason: 'usage_limit_reached' });
//     }

//     if (coupon.max_uses_per_user && user_id) {
//       const userCount = coupon.users_used?.get(user_id) || 0;
//       if (userCount >= coupon.max_uses_per_user) {
//         return res.json({ valid: false, reason: 'user_limit_reached' });
//       }
//     }

//     let discount = 0;
//     if (coupon.discount_type === 'percent') {
//       discount = (cart_amount * coupon.discount_value) / 100;
//     } else {
//       discount = coupon.discount_value;
//     }
//     if (discount > cart_amount) discount = cart_amount;

//     const final_amount = cart_amount - discount;

//     res.json({
//       valid: true,
//       code: coupon.code,
//       discount_amount: discount,
//       final_amount,
//       message: 'Coupon applied'
//     });
//   } catch (err) {
//     next(err);
//   }
// };


// ➤ Verify coupon and increment usage
export const verifyCoupon = async (req, res, next) => {
  try {
    const { code, cart_amount, service_ids, user_id } = req.body;

    const coupon = await Coupon.findOne({ code });
    if (!coupon) {
      return res.json({ valid: false, reason: 'not_found' });
    }

    const now = new Date();
    if (!coupon.active || now < coupon.valid_from || now > coupon.valid_until) {
      return res.json({ valid: false, reason: 'expired' });
    }

    if (coupon.min_order_value && cart_amount < coupon.min_order_value) {
      return res.json({ valid: false, reason: 'min_order_not_met' });
    }

    if (
      coupon.applicable_services?.length &&
      service_ids?.length &&
      !service_ids.some(s => coupon.applicable_services.includes(s))
    ) {
      return res.json({ valid: false, reason: 'not_applicable_service' });
    }

    if (coupon.max_uses && coupon.uses >= coupon.max_uses) {
      return res.json({ valid: false, reason: 'usage_limit_reached' });
    }

    if (coupon.max_uses_per_user && user_id) {
      if (!coupon.users_used) coupon.users_used = new Map();
      const userCount = coupon.users_used.get(user_id) || 0;
      if (userCount >= coupon.max_uses_per_user) {
        return res.json({ valid: false, reason: 'user_limit_reached' });
      }
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'percent') {
      discount = (cart_amount * coupon.discount_value) / 100;
    } else {
      discount = coupon.discount_value;
    }
    if (discount > cart_amount) discount = cart_amount;

    const final_amount = cart_amount - discount;

    // ✅ Increment usage (optional: only if you want to count usage immediately)
    coupon.uses = (coupon.uses || 0) + 1;
    if (user_id) {
      if (!coupon.users_used) coupon.users_used = new Map();
      const userCount = coupon.users_used.get(user_id) || 0;
      coupon.users_used.set(user_id, userCount + 1);
    }
    await coupon.save();

    res.json({
      valid: true,
      code: coupon.code,
      discount_amount: discount,
      final_amount,
      message: 'Coupon applied'
    });

  } catch (err) {
    next(err);
  }
};

