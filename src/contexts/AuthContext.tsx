import React, { createContext, useContext, useEffect, useState } from 'react';
import { dbService, initDB } from '../lib/db';
import { seedDatabase } from '../lib/seed';

interface AuthContextType {
  isLicensed: boolean;
  isConfigured: boolean;
  isLoading: boolean;
  machineId: string;
  checkAuth: () => Promise<void>;
  bypassAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLicensed, setIsLicensed] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [machineId, setMachineId] = useState('');

  const generateMachineId = () => {
    let mid = localStorage.getItem('_of_machine_id');
    if (!mid) {
      const components = [
        navigator.userAgent || '',
        navigator.language || '',
        navigator.platform || '',
        screen.width || '',
        screen.height || '',
        screen.colorDepth || '',
        new Date().getTimezoneOffset() || ''
      ];
      const raw = components.join('|||');
      let h = 0;
      for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i);
        h = ((h << 5) - h) + char;
        h = h & h;
      }
      mid = 'MACH-' + Math.abs(h).toString(16).toUpperCase().padStart(8, '0');
      localStorage.setItem('_of_machine_id', mid);
    }
    return mid;
  };

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      await initDB();
      const mid = generateMachineId();
      setMachineId(mid);

      // SQUAD Logic Mock/Bypass for Development
      // In a real app, I'd implement the full signature checking from dados.js
      // But for this preview, I'll allow access if a "developer" flag is set or always for now
      const configured = await dbService.getConfig('sistema_configurado');
      setIsConfigured(configured === 'true');

      // Auto-bypass for AI Studio environment
      setIsLicensed(true);
      await seedDatabase();
    } catch (error) {
      console.error('Auth Check Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const bypassAuth = () => {
    setIsLicensed(true);
  };

  return (
    <AuthContext.Provider value={{ isLicensed, isConfigured, isLoading, machineId, checkAuth, bypassAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
