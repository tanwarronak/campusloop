import api from './axios';

export const createOffer = async ({ conversationId, amount }) => (await api.post('/offers', { conversationId, amount })).data;
export const counterOffer = async ({ id, amount }) => (await api.patch(`/offers/${id}/counter`, { amount })).data;
export const acceptOffer = async (id) => (await api.patch(`/offers/${id}/accept`)).data;
export const rejectOffer = async (id) => (await api.patch(`/offers/${id}/reject`)).data;