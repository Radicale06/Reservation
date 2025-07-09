import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests (commented out for now)
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('adminToken');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// Handle auth errors (commented out for now)
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('adminToken');
//       localStorage.removeItem('adminUser');
//       window.location.href = '/admin/login';
//     }
//     return Promise.reject(error);
//   }
// );

// Auth (simplified for now)
export const auth = {
  login: async (username, password) => {
    // Simplified login - just return a mock user for now
    const mockUser = { username: 'admin', name: 'Admin User' };
    localStorage.setItem('adminToken', 'mock-token');
    localStorage.setItem('adminUser', JSON.stringify(mockUser));
    return mockUser;
  },
  
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  },
  
  getUser: () => {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : { username: 'admin', name: 'Admin User' };
  },
  
  isAuthenticated: () => {
    return true; // Always return true for now
  }
};

// Reservations
export const reservations = {
  getAll: () => api.get('/reservations'),
  getById: (id) => api.get(`/reservations/${id}`),
  create: (data) => api.post('/reservations', data),
  cancel: (id) => api.post(`/reservations/${id}/cancel`),
  confirmPayment: (id, paymentId) => api.post(`/reservations/${id}/confirm-payment`, { paymentId }),
  updateCourt: (id, courtId) => api.put(`/reservations/${id}/court`, { courtId }),
  getDailyStats: (date) => api.get('/reservations/stats/daily', { params: { date } }),
  getMonthlyStats: (year, month) => api.get('/reservations/stats/monthly', { params: { year, month } }),
};

// Courts
export const courts = {
  getAll: () => api.get('/courts'),
  getActive: () => api.get('/courts/active'),
  getById: (id) => api.get(`/courts/${id}`),
  create: (data) => api.post('/courts', data),
  update: (id, data) => api.put(`/courts/${id}`, data),
  toggleActive: (id) => api.put(`/courts/${id}/toggle-active`),
};

// Payment
export const payment = {
  initPayment: (data) => api.post('/payment/init', data),
  verifyPayment: (gateway, paymentId) => api.get(`/payment/verify/${gateway}/${paymentId}`),
};

export default {
  auth,
  reservations,
  courts,
  payment,
};