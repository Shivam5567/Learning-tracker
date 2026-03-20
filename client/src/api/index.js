import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Categories
export const getCategories = () => API.get('/categories');
export const getCategory = (id) => API.get(`/categories/${id}`);
export const createCategory = (data) => API.post('/categories', data);
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

// Sections
export const addSection = (categoryId, data) => API.post(`/categories/${categoryId}/sections`, data);
export const updateSection = (categoryId, sectionId, data) => API.put(`/categories/${categoryId}/sections/${sectionId}`, data);
export const deleteSection = (categoryId, sectionId) => API.delete(`/categories/${categoryId}/sections/${sectionId}`);

// Topics
export const addTopic = (categoryId, sectionId, data) => API.post(`/categories/${categoryId}/sections/${sectionId}/topics`, data);
export const deleteTopic = (categoryId, sectionId, topicId) => API.delete(`/categories/${categoryId}/sections/${sectionId}/topics/${topicId}`);

// Topic actions
export const completeTopic = (data) => API.put('/topics/complete', data);
export const reviseTopic = (data) => API.put('/topics/revise', data);
export const getDueTopics = () => API.get('/topics/due');
export const getReviewHistory = () => API.get('/topics/review-history');

// Import
export const importTopics = (categoryId, data) => API.post(`/categories/${categoryId}/import`, data);

export default API;
