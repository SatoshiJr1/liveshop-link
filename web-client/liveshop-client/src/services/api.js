const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur API');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Public routes for clients
  async getSellerProducts(sellerId) {
    return this.request(`/public/seller/${sellerId}/products`);
  }

  async createOrder(orderData) {
    return this.request('/public/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async getOrderStatus(orderId) {
    return this.request(`/public/orders/${orderId}/status`);
  }
}

export default new ApiService(); 