import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ai_finance_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default demo profile for seamless interview presentation
    return {
      name: 'Yashmitha S.',
      email: 'yashmitha@demo.com',
      role: 'Candidate / Software Developer',
      avatar: 'YS',
      monthlyIncome: 85000,
    };
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('ai_finance_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ai_finance_user');
    }
  }, [user]);

  const login = (email, password) => {
    // Simulated credential check for demo / portfolio
    const namePart = email.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const loggedUser = {
      name: formattedName || 'Finance User',
      email,
      role: 'Personal Investor',
      avatar: (formattedName || 'U').substring(0, 2).toUpperCase(),
      monthlyIncome: 85000,
    };
    setUser(loggedUser);
    return true;
  };

  const register = (name, email, password, monthlyIncome) => {
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    const newUser = {
      name,
      email,
      role: 'Personal Investor',
      avatar: initials || 'US',
      monthlyIncome: Number(monthlyIncome) || 75000,
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
