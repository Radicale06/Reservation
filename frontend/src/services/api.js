import axios from "axios";

const API_URL = "http://localhost:3001";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const reservationService = {
  getAvailableSlots: async (date) => {
    const response = await api.get(
      `/reservations/available-slots?date=${date}`
    );
    return response.data;
  },

  createReservation: async (reservation) => {
    const response = await api.post("/reservations", reservation);
    return response.data;
  },

  initPayment: async (paymentData) => {
    const response = await api.post("/payment/init", paymentData);
    return response.data;
  },

  getReservation: async (id) => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  },
};

export default api;
