import api from "./api";

export const getMyNotifications = async (token) => {
  const response = await api.get("/notifications", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const markNotificationAsRead = async (notificationId, token) => {
  const response = await api.put(
    `/notifications/${notificationId}/read`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const markAllNotificationsAsRead = async (token) => {
  const response = await api.put(
    "/notifications/read-all",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};