import api from "./api";

export const getMealReviews = async (mealId) => {
  const response = await api.get(`/meals/${mealId}/reviews`);

  return response.data;
};

export const createReview = async (mealId, reviewData, token) => {
  const response = await api.post(`/meals/${mealId}/reviews`, reviewData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};