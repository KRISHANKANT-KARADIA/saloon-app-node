import Offer from "../models/offer.model.js";
import Saloon from '../models/saloon.model.js'; 
import { AppError } from '../helpers/error.js';
import { STATUS_CODES } from '../helpers/constants.js';
import Review from "../models/Review.js";
import Appointment from "../models/appointment.model.js";
import appointmentModel from "../models/appointment.model.js";


export const addOffer = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;
    const {
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
      active
    } = req.body;

    const offer = await Offer.create({
      owner: ownerId,
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
      active
    });

    res.json({ success: true, offer });
  } catch (err) {
    next(err);
  }
};


export const getOffers = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    const offers = await Offer.find({ owner: ownerId })
      .populate("applicable_services")
      .sort({ createdAt: -1 });

    res.json({ success: true, offers });
  } catch (err) {
    next(err);
  }
};

export const getOffersWithData = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    const offers = await Offer.find({ owner: ownerId, active: true })
      .sort({ createdAt: -1 })
      .populate({
        path: "applicable_services",
        match: { status: "active" }, 
        select: "name saloon",
        populate: {
          path: "saloon",
          select: "name logo", 
        },
      });

    const formattedOffers = offers.map(offer => ({
      id: offer._id,
      title: offer.title,
      description: offer.description,
      discount_type: offer.discount_type,
      discount_value: offer.discount_value,
      min_order_value: offer.min_order_value,
      valid_from: offer.valid_from,
      valid_until: offer.valid_until,
      max_uses: offer.max_uses,
      max_uses_per_user: offer.max_uses_per_user,
      active: offer.active,
      applicable_services: offer.applicable_services.map(s => ({
        id: s._id,
        name: s.name,
        saloon: s.saloon ? {
          id: s.saloon._id,
          name: s.saloon.name,
          image: s.saloon.logo || null 
        } : null
      }))
    }));

    res.json({ success: true, offers: formattedOffers });

  } catch (err) {
    next(err);
  }
};


export const getOfferById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id).populate("applicable_services");

    if (!offer) return res.status(404).json({ success: false, message: "Offer not found" });

    res.json({ success: true, offer });
  } catch (err) {
    next(err);
  }
};


export const updateOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const offer = await Offer.findByIdAndUpdate(id, updateData, { new: true });

    if (!offer) return res.status(404).json({ success: false, message: "Offer not found" });

    res.json({ success: true, offer });
  } catch (err) {
    next(err);
  }
};


export const deleteOffer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findByIdAndDelete(id);

    if (!offer) return res.status(404).json({ success: false, message: "Offer not found" });

    res.json({ success: true, message: "Offer deleted successfully" });
  } catch (err) {
    next(err);
  }
};


export const getAllActiveOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find()
      .populate({
        path: "applicable_services",
        populate: { path: "saloon", select: "name logo" }, 
      })
      .sort({ createdAt: -1 });

   
    const formattedOffers = offers.map(offer => ({
      id: offer._id,
      title: offer.title,
      description: offer.description,
      discount_type: offer.discount_type,
      discount_value: offer.discount_value,
      min_order_value: offer.min_order_value,
      valid_from: offer.valid_from,
      valid_until: offer.valid_until,
      max_uses: offer.max_uses,
      max_uses_per_user: offer.max_uses_per_user,
      active: offer.active,
      applicable_services: offer.applicable_services.map(s => ({
        id: s._id,
        name: s.name,
        saloon: s.saloon ? {
          id: s.saloon._id,
          name: s.saloon.name,
          image: s.saloon.logo || null
        } : null
      }))
    }));

    res.json({ success: true, offers: formattedOffers });
  } catch (err) {
    next(err);
  }
};



export const updateTrendingSaloons = async (req, res) => {
  try {
    const thresholdBookings = 10;
    const thresholdRating = 4.5;

    const saloons = await Saloon.find({ status: "active" });

    let trendingCount = 0;

    for (const s of saloons) {
      if (s.bookingsCount >= thresholdBookings && s.rating >= thresholdRating) {
        s.isTrending = true;
        trendingCount++;
      } else {
        s.isTrending = false;
      }
      await s.save();
    }

    if (trendingCount === 0) {
      const fallbackSaloons = await Saloon.find({ status: "active" }).limit(5);
      for (const fs of fallbackSaloons) {
        fs.isTrending = true;
        await fs.save();
      }
    }

    res.json({ success: true, message: "Trending saloons updated!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTrendingSaloons = async (req, res) => {
  try {
    const { city } = req.query;

    const trending = await appointmentModel.aggregate([
  {
    $group: {
      _id: "$saloonId",
      totalAppointments: { $sum: 1 }
    }
  },
  {
    $lookup: {
      from: "saloons",
      localField: "_id",
      foreignField: "_id",
      as: "saloon"
    }
  },
  { $unwind: "$saloon" },


  ...(city
    ? [
        {
          $match: {
            "saloon.city": { $regex: new RegExp(city, "i") },
            "saloon.status": "active"
          }
        }
      ]
    : [
        {
          $match: {
            "saloon.status": "active"
          }
        }
      ]),

  { $sort: { totalAppointments: -1 } },
  { $limit: 25 },

  {
    $project: {
      _id: "$saloon._id",
      name: "$saloon.name",
      logo: "$saloon.logo",
      city: "$saloon.city",
      rating: "$saloon.rating",
      totalAppointments: 1
    }
  }
]);


    if (trending.length === 0) {
     
      const fallback = await Saloon.find({ status: "active" }).limit(25);
      return res.status(200).json({ success: true, saloons: fallback });
    }

    return res.status(200).json({ success: true, saloons: trending });
  } catch (error) {
    console.error("Error fetching trending saloons:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching trending saloons",
      error: error.message
    });
  }
};




export const addReview = async (req, res) => {
try {
    const { saloonId, rating, comment, userName, userProfile } = req.body;

    if (!saloonId || !rating || !userName) {
      return res.status(400).json({ 
        success: false, 
        message: "Saloon ID, rating, and userName are required" 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: "Rating must be 1-5" 
      });
    }

    const review = await Review.create({
      saloon: saloonId,
      user: null,         
      userName,          
      userProfile: userProfile || null,
      rating,
      comment,
    });

    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



export const getUserReviews = async (req, res) => {
  try {
    const userId = res.locals.user.id; 

    const reviews = await Review.find({ user: userId })
      .populate("saloon", "name logo") 
      .sort({ createdAt: -1 });

    res.json({ success: true, total: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const replyToReview = async (req, res) => {
 try {
    const { reviewId } = req.params;
    const { replyComment } = req.body;

    const userId = res.locals.user?.id;
    const userName = res.locals.user?.name || "Saloon Owner";

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!replyComment) {
      return res
        .status(400)
        .json({ success: false, message: "Reply comment is required" });
    }

   
    const review = await Review.findById(reviewId).populate("saloon", "owner name");
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    console.log("Review ID:", reviewId);
    console.log("Review saloon:", review.saloon);
    console.log("Saloon owner ID:", review.saloon?.owner?.toString());
    console.log("Current user ID:", userId);

  
    if (!review.saloon) {
      return res
        .status(400)
        .json({ success: false, message: "This review is not linked to any saloon" });
    }

    if (review.saloon.owner.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Only the saloon owner can reply to this review" });
    }


    review.replies.push({
      replyBy: userName,
      replyComment,
      createdAt: new Date(),
    });

    await review.save();

    res.json({ success: true, review });
  } catch (err) {
    console.error("Error replying to review:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


export const forMultipleSaloonReview = async (req, res) => {
 try {
    const { saloonId } = req.params;

    const reviews = await Review.find({ saloon: saloonId })
      .sort({ createdAt: -1 }) 
      .limit(5);               

    const mappedReviews = reviews.map((r) => ({
      _id: r._id,
      saloon: r.saloon,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: {
        name: r.userName || "Unknown User",
        profileImage: r.userProfile || null,
      },
    }));

    const total = mappedReviews.length;
    const avgRating =
      mappedReviews.reduce((sum, r) => sum + r.rating, 0) / (total || 1);

    const breakdown = [1, 2, 3, 4, 5].map((star) => ({
      star,
      percent:
        total > 0
          ? (mappedReviews.filter((r) => r.rating === star).length / total) * 100
          : 0,
    }));

    res.json({ success: true, avgRating, total, breakdown, reviews: mappedReviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};


export const forMultipleSaloonReviews = async (req, res) => {
 try {
    const { saloonId } = req.params;
    const page = parseInt(req.query.page) || 1;      
    const limit = parseInt(req.query.limit) || 10;   
    const skip = (page - 1) * limit;

 
    const reviews = await Review.find({ saloon: saloonId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const mappedReviews = reviews.map((r) => ({
      _id: r._id,
      saloon: r.saloon,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: {
        name: r.userName || "Unknown User",
        profileImage: r.userProfile || null,
      },
    }));

    
    const total = await Review.countDocuments({ saloon: saloonId });

    res.json({
      success: true,
      total,
      page,
      limit,
      reviews: mappedReviews,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const addReply = async (req, res) => {
  

   try {
    const { reviewId, replyComment } = req.body;
    const userId = res.locals.user.id; 

    if (!reviewId || !replyComment) {
      return res.status(400).json({ success: false, message: "Review ID and comment required" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

 
    const saloon = await Saloon.findById(review.saloon);
    if (!saloon) return res.status(404).json({ success: false, message: "Saloon not found" });

    review.replies.push({
      replyBy: saloon.name,   
      replyComment,
    });

    await review.save();
    res.json({ success: true, review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSaloonReview = async (req, res) => { 
  try {
    const { saloonId } = req.params;


    const reviews = await Review.find({ saloon: saloonId }).sort({ createdAt: -1 });

    const mappedReviews = reviews.map((r) => ({
      _id: r._id,
      saloon: r.saloon,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: {
        name: r.userName || "Unknown User",
        profileImage: r.userProfile || null,
      },
      replies: r.replies.map((reply) => ({
        replyBy: reply.replyBy,      
        replyComment: reply.replyComment,
        createdAt: reply.createdAt,
      })),
    }));

    const total = mappedReviews.length;
    const avgRating =
      mappedReviews.reduce((sum, r) => sum + r.rating, 0) / (total || 1);

    const breakdown = [1, 2, 3, 4, 5].map((star) => ({
      star,
      percent:
        total > 0
          ? (mappedReviews.filter((r) => r.rating === star).length / total) * 100
          : 0,
    }));

    res.json({ success: true, avgRating, total, breakdown, reviews: mappedReviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

