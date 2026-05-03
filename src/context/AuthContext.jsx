import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '../services/storage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedSession = StorageService.getSession();
    if (savedSession) {
      setCurrentUser({ uid: savedSession.uid, email: savedSession.email });
      setUserData(savedSession);
    }
    setLoading(false);
  }, []);

  const mockUsers = {
    super_admin: {
      uid: 'mock_super',
      email: 'super@smart-rt.com',
      nama_lengkap: 'Super Admin',
      role: 'super_admin',
      tenant_id: 'GLOBAL_SYSTEM'
    },
    admin_rt: {
      uid: 'mock_admin',
      email: 'admin@rt01.com',
      nama_lengkap: 'Bpk. Ketua RT 01',
      role: 'admin_rt',
      tenant_id: 'RT01_KUNCIRAN'
    },
    resident: {
      uid: 'mock_warga',
      email: 'warga@demo.com',
      nama_lengkap: 'Sdr. Warga Contoh',
      role: 'resident',
      tenant_id: 'RT01_KUNCIRAN'
    }
  };

  const login = (user) => {
    setCurrentUser({ uid: user.uid, email: user.email });
    setUserData(user);
    StorageService.saveSession(user);
  };

  const loginAsMock = (role) => {
    const user = mockUsers[role];
    if (user) {
      login(user);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setUserData(null);
    StorageService.clearSession();
  };

  const value = {
    currentUser,
    userData,
    loading,
    isAdmin: userData?.role === 'admin_rt',
    isSuperAdmin: userData?.role === 'super_admin',
    isResident: userData?.role === 'resident',
    tenantId: userData?.tenant_id,
    login,
    loginAsMock,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
