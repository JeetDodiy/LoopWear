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
      
      // Do not auto-login new visitors: only restore if previously authenticated
      const storedUserId = localStorage.getItem("loopwear_user_id");
      const matched = storedUserId ? usersData.find((u) => u.id === storedUserId) : null;
      setCurrentUser(matched || null);

      const itemsData = await fetchItems();
      setItems(itemsData);

      if (matched) {
        const swapsData = await fetchSwaps(matched.id);
        setSwaps(swapsData);
      } else {
        setSwaps([]);
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

  const updateCurrentUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    setAllUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u)));
    localStorage.setItem("loopwear_user_id", updatedUser.id);
  };

  const logout = () => {
    localStorage.removeItem("loopwear_user_id");
    localStorage.removeItem("loopwear_token");
    setCurrentUser(null);
    setSwaps([]);
  };

  const isAdmin = currentUser?.role === "admin";

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        updateCurrentUser,
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
