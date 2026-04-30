import api from "./api";

export const createOrder = async (orderData, token) => {
  const response = await api.post("/orders", orderData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getMyOrders = async (token) => {
  const response = await api.get("/orders/my-orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getChefOrders = async (token) => {
  const response = await api.get("/orders/chef-orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const updateChefOrderStatus = async (orderId, status, token) => {
  const response = await api.put(
    `/orders/${orderId}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};