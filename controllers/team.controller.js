import TeamMember from '../models/teamMember.model.js';
import Saloon from '../models/saloon.model.js';

export const addTeamMember = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // Find saloon by owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return res.status(404).json({ message: 'Saloon not found' });
    }

    const {
      name,
      role,
      services,
      startTime,
      endTime,
      workingDays,
      mobile,
      email
    } = req.body;

    // profile image path (if uploaded)
    const profile = req.file ? `/uploads/teamMembers/${req.file.filename}` : null;

    const teamMember = new TeamMember({
      saloon: saloon._id,
      profile,
      name,
      role,
      services,        // make sure client sends array or string array
      startTime,
      endTime,
      workingDays,     // array of days expected
      mobile,
      email
    });

    await teamMember.save();

    return res.status(201).json({ message: 'Team member added', teamMember });
  } catch (error) {
    next(error);
  }
};


export const getTeamMembers = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // Find saloon for this owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return res.status(404).json({ message: 'Saloon not found' });
    }

    // Find team members for this saloon
    const teamMembers = await TeamMember.find({ saloon: saloon._id });

    return res.status(200).json({ teamMembers });
  } catch (error) {
    next(error);
  }
};

export const getTopPerformers = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // 1️⃣ Find the saloon of this owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return res.status(404).json({ message: "Saloon not found" });
    }

    // 2️⃣ Get all team members
    const teamMembers = await TeamMember.find({ saloon: saloon._id });

    // 3️⃣ Get date range for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // 4️⃣ Get all appointments in this month
    const appointments = await Appointment.find({
      saloonId: saloon._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
      status: "confirmed"
    });

    // 5️⃣ Calculate appointments and revenue per team member
    const membersStats = teamMembers.map(member => {
      const memberAppointments = appointments.filter(a => a.professionalId.toString() === member._id.toString());
      const totalAmount = memberAppointments.reduce((sum, a) => sum + Number(a.price || 0), 0);

      return {
        id: member._id,
        name: member.name,
        totalAppointments: memberAppointments.length,
        totalRevenue: totalAmount,
      };
    });

    // 6️⃣ Sort descending by totalAppointments
    membersStats.sort((a, b) => b.totalAppointments - a.totalAppointments);

    return res.status(200).json({
      success: true,
      topPerformers: membersStats
    });

  } catch (err) {
    next(err);
  }
};


export const updateTeamMember = async (req, res, next) => {
  try {
    const teamMemberId = req.params.id;
    const updateData = { ...req.body };

    // Parse services and workingDays if sent as JSON strings
    if (updateData.services && typeof updateData.services === "string") {
      updateData.services = JSON.parse(updateData.services);
    }

    if (updateData.workingDays && typeof updateData.workingDays === "string") {
      updateData.workingDays = JSON.parse(updateData.workingDays);
    }

    // If profile image uploaded
    if (req.file) {
      updateData.profile = `/uploads/teamMembers/${req.file.filename}`;
    }

    const updatedMember = await TeamMember.findByIdAndUpdate(
      teamMemberId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedMember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    res.status(200).json({ message: "Team member updated", updatedMember });
  } catch (error) {
    console.error(error);
    next(error);
  }
};



// export const updateTeamMember = async (req, res, next) => {
//   try {
//     const teamMemberId = req.params.id;

//     // Prepare update data from body
//     const updateData = { ...req.body };

//     // If profile image uploaded
//     if (req.file) {
//       updateData.profile = `/uploads/teamMembers/${req.file.filename}`;
//     }

//     // Find and update
//     const updatedMember = await TeamMember.findByIdAndUpdate(
//       teamMemberId,
//       updateData,
//       { new: true, runValidators: true }
//     );

//     if (!updatedMember) {
//       return res.status(404).json({ message: 'Team member not found' });
//     }

//     res.status(200).json({ message: 'Team member updated', updatedMember });
//   } catch (error) {
//     next(error);
//   }
// };

export const getAllTeamMembers = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    // Find the saloon owned by this user
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return res.status(404).json({ message: 'Saloon not found for this owner.' });
    }

    // Find team members associated with this saloon
    const teamMembers = await TeamMember.find({ saloon: saloon._id });

    return res.status(200).json({ teamMembers });
  } catch (error) {
    next(error);
  }
};

// Get all team members by saloonId
export const getTeamMembersBySaloonId = async (req, res, next) => {
  try {
    const { saloonId } = req.params;

    if (!saloonId) {
      return res.status(400).json({ message: 'Saloon ID is required.' });
    }

    // Check if salon exists
    const saloon = await Saloon.findById(saloonId);
    if (!saloon) {
      return res.status(404).json({ message: 'Saloon not found.' });
    }

    // Find team members for this salon
    const teamMembers = await TeamMember.find({ saloon: saloonId });

    return res.status(200).json({
      success: true,
      message: 'Team members retrieved successfully',
      data: teamMembers,
    });
  } catch (error) {
    next(error);
  }
};



export const deleteTeamMember = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;
    const teamMemberId = req.params.id;

    // Find saloon of owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return res.status(404).json({ message: 'Saloon not found' });
    }

    // Find the team member and ensure it belongs to this saloon
    const teamMember = await TeamMember.findOne({ _id: teamMemberId, saloon: saloon._id });
    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found or does not belong to your saloon' });
    }

    // Delete the team member
    await TeamMember.findByIdAndDelete(teamMemberId);

    return res.status(200).json({ message: 'Team member deleted successfully' });
  } catch (error) {
    next(error);
  }
};



export const getTeamMemberById = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id; // owner making the request
    const teamMemberId = req.params.id;

    // Find the saloon of the owner
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return res.status(404).json({ message: "Saloon not found" });
    }

    // Find the team member and ensure it belongs to this saloon
    const teamMember = await TeamMember.findOne({
      _id: teamMemberId,
      saloon: saloon._id,
    });

    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found or does not belong to your saloon" });
    }

    return res.status(200).json({ member: teamMember });
  } catch (error) {
    next(error);
  }
}