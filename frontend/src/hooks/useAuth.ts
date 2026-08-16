import { useAuthStore } from '../stores/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, logout } = useAuthStore();

  return {
    user,
    isAuthenticated,
    logout,
    isStaff: user?.accountType === 'staff',
    isUser: user?.accountType === 'user',
  };
};
