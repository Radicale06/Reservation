import axios from "axios";

const API_URL = "http://localhost:3001";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const reservationService = {
  getAvailableSlots: async (date, courtId) => {
    let url = `/reservations/available-slots?date=${date}`;
    if (courtId) {
      url += `&courtId=${courtId}`;
    }
    const response = await api.get(url);
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

  checkStadiumAvailability: async (date, time) => {
    const response = await api.get(`/reservations/stadium-availability?date=${date}&time=${time}`);
    return response.data;
  },

  getCourtAssignments: async (date, time) => {
    const response = await api.get(`/reservations/court-assignments?date=${date}&time=${time}`);
    return response.data;
  },
};

export default api;
