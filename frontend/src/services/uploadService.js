import api from "./api";

export const uploadSingleImage = async (imageFile, token) => {
  const formData = new FormData();

  formData.append("image", imageFile);

  const response = await api.post("/uploads/single", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return "";
  }

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  const baseUrl =
    api.defaults.baseURL?.replace("/api", "") || "http://localhost:5000";

  return `${baseUrl}${imageUrl}`;
};