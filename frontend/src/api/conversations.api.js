import api from './axios';

export const createConversation = async (listingId) => (await api.post('/conversations', { listingId })).data;
export const getConversations = async (params = {}) => (await api.get('/conversations', { params })).data;
export const getConversation = async (id) => (await api.get(`/conversations/${id}`)).data;
export const getConversationMessages = async (id, params = {}) => (await api.get(`/conversations/${id}/messages`, { params })).data;
export const sendConversationMessage = async ({ id, text }) => (await api.post(`/conversations/${id}/messages`, { text })).data;