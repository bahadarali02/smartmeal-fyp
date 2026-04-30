import api from "./api";

export const getMyFollowing = async (token) => {
  const response = await api.get("/follows", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const followChef = async (chefId, token) => {
  const response = await api.post(
    `/follows/${chefId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const unfollowChef = async (chefId, token) => {
  const response = await api.delete(`/follows/${chefId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};