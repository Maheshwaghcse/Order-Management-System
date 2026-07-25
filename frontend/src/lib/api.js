const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const cleanUrl = rawApiUrl.replace(/\/+$/, '');
const API_BASE = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.error || 'API Request Failed');
  }

  return data;
}

// Order APIs
export const createOrder = (orderData) =>
  fetchJSON(`${API_BASE}/orders`, {
    method: 'POST',
    body: JSON.stringify(orderData),
  });

export const getOrders = ({ store_id = '', status = '', page = 1, limit = 10 } = {}) => {
  const params = new URLSearchParams();
  if (store_id) params.append('store_id', store_id);
  if (status) params.append('status', status);
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());

  return fetchJSON(`${API_BASE}/orders?${params.toString()}`);
};

export const updateOrderStatus = ({ id, status }) =>
  fetchJSON(`${API_BASE}/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

// Analytics APIs
export const getOrdersPerDay = (store_id = '') => {
  const url = store_id
    ? `${API_BASE}/analytics/orders-per-day?store_id=${encodeURIComponent(store_id)}`
    : `${API_BASE}/analytics/orders-per-day`;
  return fetchJSON(url);
};

export const getRevenuePerStore = () =>
  fetchJSON(`${API_BASE}/analytics/revenue-per-store`);

export const getTopItems = (limit = 5) =>
  fetchJSON(`${API_BASE}/analytics/top-items?limit=${limit}`);

// Archival APIs
export const archiveOldOrders = (days = 30) =>
  fetchJSON(`${API_BASE}/archive-old-orders`, {
    method: 'POST',
    body: JSON.stringify({ days }),
  });

export const getArchiveStats = (days = 30) =>
  fetchJSON(`${API_BASE}/archive-stats?days=${days}`);
