import api, { getBackendBaseUrl } from "./api";

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
  if (!imageUrl || typeof imageUrl !== "string") {
    return "";
  }

  const cleanImageUrl = imageUrl.trim();

  if (!cleanImageUrl) {
    return "";
  }

  if (
    cleanImageUrl.startsWith("http://") ||
    cleanImageUrl.startsWith("https://") ||
    cleanImageUrl.startsWith("data:")
  ) {
    return cleanImageUrl;
  }

  const backendBaseUrl = getBackendBaseUrl();

  if (cleanImageUrl.startsWith("/uploads/")) {
    return `${backendBaseUrl}${cleanImageUrl}`;
  }

  if (cleanImageUrl.startsWith("uploads/")) {
    return `${backendBaseUrl}/${cleanImageUrl}`;
  }

  return `${backendBaseUrl}/uploads/${cleanImageUrl}`;
};