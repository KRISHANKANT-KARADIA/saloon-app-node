import TeamMember from '../models/teamMember.model.js';
import Saloon from '../models/saloon.model.js';
import Appointment from '../models/appointment.model.js';

export const addTeamMember = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

 
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

    const BASE_URL = "https://saloon-app-node-50470848550.asia-south1.run.app";


    const profile = req.file
      ? `${BASE_URL}/uploads/teamMembers/${req.file.filename}`
      : null;

    const teamMember = new TeamMember({
      saloon: saloon._id,
      profile,
      name,
      role,
      services,
      startTime,
      endTime,
      workingDays,
      mobile,
      email
    });

    await teamMember.save();

    return res.status(201).json({
      success: true,
      message: 'Team member added successfully',
      teamMember
    });
  } catch (error) {
    next(error);
  }
};


export const getTeamMembers = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

 
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return res.status(404).json({ message: 'Saloon not found' });
    }

    
    const teamMembers = await TeamMember.find({ saloon: saloon._id });

    return res.status(200).json({ teamMembers });
  } catch (error) {
    next(error);
  }
};

export const getTopPerformers = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) return res.status(404).json({ message: "Saloon not found" });

    const teamMembers = await TeamMember.find({ saloon: saloon._id });


    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  
    const appointments = await Appointment.find({
      saloonId: saloon._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
      
    });

    console.log("Total appointments fetched:", appointments.length);

    const membersStats = teamMembers.map(member => {
      const memberAppointments = appointments.filter(a =>
        a.professionalId && a.professionalId.toString() === member._id.toString()
      );

      const totalAmount = memberAppointments.reduce((sum, a) => sum + Number(a.price || 0), 0);

      console.log(member.name, memberAppointments.length, totalAmount);

      return {
        id: member._id,
        name: member.name,
        totalAppointments: memberAppointments.length,
        totalRevenue: totalAmount
      };
    });

    membersStats.sort((a, b) => b.totalAppointments - a.totalAppointments);

    return res.status(200).json({ success: true, topPerformers: membersStats });
  } catch (err) {
    console.error(err);
    next(err);
  }
};



export const updateTeamMember = async (req, res, next) => {
  try {
    const teamMemberId = req.params.id;
    const updateData = { ...req.body };

    const BASE_URL = "https://saloon-app-node-50470848550.asia-south1.run.app";

 
    if (updateData.services && typeof updateData.services === "string") {
      updateData.services = JSON.parse(updateData.services);
    }

  
    if (updateData.workingDays && typeof updateData.workingDays === "string") {
      updateData.workingDays = JSON.parse(updateData.workingDays);
    }

    if (req.file) {
      updateData.profile = `${BASE_URL}/uploads/teamMembers/${req.file.filename}`;
    }

    const updatedMember = await TeamMember.findByIdAndUpdate(
      teamMemberId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedMember) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Team member updated successfully",
      teamMember: updatedMember,
    });

  } catch (error) {
    console.error("Update team member error:", error);
    next(error);
  }
};




export const getAllTeamMembers = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;

    
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return res.status(404).json({ message: 'Saloon not found for this owner.' });
    }

    
    const teamMembers = await TeamMember.find({ saloon: saloon._id });

    return res.status(200).json({ teamMembers });
  } catch (error) {
    next(error);
  }
};



export const getTeamMembersBySaloonId = async (req, res, next) => {
  try {
    const { saloonId } = req.params;

    if (!saloonId) {
      return res.status(400).json({ message: 'Saloon ID is required.' });
    }

    const saloon = await Saloon.findById(saloonId);
    if (!saloon) {
      return res.status(404).json({ message: 'Saloon not found.' });
    }

    const teamMembers = await TeamMember.find({ saloon: saloonId });

    const IMAGE_BASE = "https://saloon-app-node-50470848550.asia-south1.run.app";

    const updatedTeamMembers = teamMembers.map(member => ({
      ...member._doc,
      profile:
        member.profile
          ? member.profile.startsWith("http")
            ? member.profile
            : `${IMAGE_BASE}${member.profile}`
          : null,
    }));

    return res.status(200).json({
      success: true,
      message: "Team members retrieved successfully",
      data: updatedTeamMembers,
    });

  } catch (error) {
    next(error);
  }
};



export const deleteTeamMember = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id;
    const teamMemberId = req.params.id;

  
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return res.status(404).json({ message: 'Saloon not found' });
    }

  
    const teamMember = await TeamMember.findOne({ _id: teamMemberId, saloon: saloon._id });
    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found or does not belong to your saloon' });
    }

 
    await TeamMember.findByIdAndDelete(teamMemberId);

    return res.status(200).json({ message: 'Team member deleted successfully' });
  } catch (error) {
    next(error);
  }
};



export const getTeamMemberById = async (req, res, next) => {
  try {
    const ownerId = res.locals.user.id; 
    const teamMemberId = req.params.id;

  
    const saloon = await Saloon.findOne({ owner: ownerId });
    if (!saloon) {
      return res.status(404).json({ message: "Saloon not found" });
    }

  
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