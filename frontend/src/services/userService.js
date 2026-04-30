import api from "./api";

export const getMyProfile = async (token) => {
  const response = await api.get("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const updateMyProfile = async (profileData, token) => {
  const response = await api.put("/users/me", profileData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const updateMyPassword = async (passwordData, token) => {
  const response = await api.put("/users/me/password", passwordData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};