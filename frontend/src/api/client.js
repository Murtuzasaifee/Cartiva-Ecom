const BASE_URL = '/api';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  getProducts: () => request('/products'),
  getProduct: (id) => request(`/products/${id}`),

  createOrder: (order) => request('/orders', { method: 'POST', body: JSON.stringify(order) }),
  getOrder: (id) => request(`/orders/${id}`),

  getCustomer: (id) => request(`/customers/${id}`),
  updateCustomer: (id, profile) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(profile) }),
  getCustomerOrders: (id) => request(`/customers/${id}/orders`),
  getCustomerTickets: (id) => request(`/customers/${id}/tickets`),

  createTicket: (ticket) => request('/tickets', { method: 'POST', body: JSON.stringify(ticket) }),
  getTicket: (id) => request(`/tickets/${id}`),
};
