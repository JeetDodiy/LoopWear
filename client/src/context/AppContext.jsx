import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchUsers, fetchItems, fetchSwaps } from "../services/api";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [loading, setLoading] = useState(true);

  // Load initial data
  const loadInitialData = async () => {
    try {
      const usersData = await fetchUsers();
      setAllUsers(usersData);
      
      // Default to Maya Lin or stored user
      const storedUserId = localStorage.getItem("loopwear_user_id");
      const matched = usersData.find((u) => u.id === storedUserId) || usersData[0];
      setCurrentUser(matched);

      const itemsData = await fetchItems();
      setItems(itemsData);

      if (matched) {
        const swapsData = await fetchSwaps(matched.id);
        setSwaps(swapsData);
      }
    } catch (err) {
      console.error("Error initializing app state:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Switch demo user
  const switchUser = async (user) => {
    setCurrentUser(user);
    localStorage.setItem("loopwear_user_id", user.id);
    try {
      const swapsData = await fetchSwaps(user.id);
      setSwaps(swapsData);
    } catch (err) {
      console.error("Error updating user swaps:", err);
    }
  };

  const refreshItems = async (filters = {}) => {
    try {
      const fresh = await fetchItems(filters);
      setItems(fresh);
      return fresh;
    } catch (err) {
      console.error("Error refreshing items:", err);
    }
  };

  const refreshSwaps = async () => {
    if (!currentUser) return;
    try {
      const fresh = await fetchSwaps(currentUser.id);
      setSwaps(fresh);
      return fresh;
    } catch (err) {
      console.error("Error refreshing swaps:", err);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const pendingIncomingCount = swaps.filter(
    (s) => s.targetOwnerId === currentUser?.id && (s.status === "pending" || s.status === "negotiating")
  ).length;

  const logout = () => {
    localStorage.removeItem("loopwear_user_id");
    setCurrentUser(null);
    setSwaps([]);
  };

  const isAdmin = currentUser?.role === "admin";

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        allUsers,
        items,
        swaps,
        theme,
        loading,
        switchUser,
        logout,
        isAdmin,
        refreshItems,
        refreshSwaps,
        toggleTheme,
        pendingIncomingCount
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
