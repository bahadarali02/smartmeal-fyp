import api from "./api";

export const getMyFavorites = async (token) => {
  const response = await api.get("/favorites", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const addFavorite = async (mealId, token) => {
  const response = await api.post(
    `/favorites/${mealId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const removeFavorite = async (mealId, token) => {
  const response = await api.delete(`/favorites/${mealId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};