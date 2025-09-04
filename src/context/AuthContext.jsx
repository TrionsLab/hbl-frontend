import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem("token");
      // console.log("Token from localStorage:", token);
      if (token) {
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    initializeAuth();
  }, [isAuthenticated]);

  const login = (userData, token) => {
    // Save both token and user in localStorage
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");

    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        // user,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
