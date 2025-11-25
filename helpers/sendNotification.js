import axios from "axios";
import { getAccessToken } from "./generateAccessToken.js";

export const sendNotification = async (token, title, body, data = {}) => {
  const accessToken = getAccessToken();

  const url =
    "https://fcm.googleapis.com/v1/projects/saloonapp-227b0/messages:send";

  const message = {
    message: {
      token,
      notification: { title, body },
      data,
    },
  };

  const response = await axios.post(url, message, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};
