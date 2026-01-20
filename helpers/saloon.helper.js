import Saloon from "../models/saloon.model.js";



export const getSaloonByOwner = async (ownerId) => {
  if (!ownerId) throw new Error("Owner ID is required");

  const saloon = await Saloon.findOne({ owner: ownerId });
  if (!saloon) {
    throw new Error("Saloon not found for this owner");
  }

  return saloon;
};
