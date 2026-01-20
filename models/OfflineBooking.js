const mongoose = require("mongoose");

const OfflineBookingSchema = new mongoose.Schema({
    saloonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Saloon",
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String,
        required: true
    },
    serviceIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true
        }
    ],
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    appointmentTime: {
        type: String,
        required: true
    },
    notes: {
        type: String,
    },
    status: {
        type: String,
        enum: ["pending", "completed", "canceled"],
        default: "pending"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });

module.exports = mongoose.model("OfflineBooking", OfflineBookingSchema);
