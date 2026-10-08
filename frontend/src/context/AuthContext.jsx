import React, { createContext, useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

const AuthContext = createContext(null);

const fetchCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    if (error?.message === 'Authentication required.') return null;
    throw error;
  }
};

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const userQuery = useQuery({
    queryKey: ['current-user'],
    queryFn: fetchCurrentUser,
    retry: false
  });
  const logoutMutation = useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => queryClient.setQueryData(['current-user'], null)
  });

  const login = () => {
    window.location.assign(`${import.meta.env.VITE_API_URL || '/api'}/auth/google`);
  };

  return (
    <AuthContext.Provider
      value={{
        user: userQuery.data || null,
        loading: userQuery.isLoading,
        isAuthenticated: Boolean(userQuery.data),
        login,
        logout: logoutMutation.mutate,
        refreshUser: userQuery.refetch
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);