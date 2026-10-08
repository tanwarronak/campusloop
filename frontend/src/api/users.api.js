import api from './axios';

export const getCurrentProfile = async () => (await api.get('/users/me')).data;
export const updateCurrentProfile = async (profile) => (await api.patch('/users/me', profile)).data;
export const getPublicProfile = async (id) => (await api.get(`/users/${id}`)).data;