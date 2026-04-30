import api from "./api";

export const getAllMeals = async () => {
  const response = await api.get("/meals");

  return response.data;
};

export const getMealById = async (mealId) => {
  const response = await api.get(`/meals/${mealId}`);

  return response.data;
};

export const getChefMeals = async (token) => {
  const response = await api.get("/meals/chef/my-meals", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const createMeal = async (mealData, token) => {
  const response = await api.post("/meals", mealData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const updateMeal = async (mealId, mealData, token) => {
  const response = await api.put(`/meals/${mealId}`, mealData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const deleteMeal = async (mealId, token) => {
  const response = await api.delete(`/meals/${mealId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};