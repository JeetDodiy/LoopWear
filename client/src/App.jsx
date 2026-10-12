import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar, Footer } from "./components/Navigation";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { ListingsPage } from "./pages/ListingsPage";
import { ItemDetailPage } from "./pages/ItemDetailPage";
import { SwapRequestPage } from "./pages/SwapRequestPage";
import { ChatPage } from "./pages/ChatPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdminPage } from "./pages/AdminPage";
import { AddItemModal } from "./components/AddItemModal";

function MainApp() {
  const [activePage, setActivePage] = useState("landing");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedSwapId, setSelectedSwapId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [authRoleTarget, setAuthRoleTarget] = useState("user"); // 'user' | 'admin'

  // Always reset window scroll smoothly to top when switching pages, preventing cheap auto-scroll glitches
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [activePage]);

  return (
    <div className="app-container">
      {/* Sticky Header */}
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenAdminAuth={() => {
          setAuthRoleTarget("admin");
          setActivePage("auth");
        }}
        onOpenUserAuth={() => {
          setAuthRoleTarget("user");
          setActivePage("auth");
        }}
      />

      {/* Main Page Router */}
      <main className="main-content">
        {activePage === "landing" && (
          <LandingPage 
            setActivePage={setActivePage}
            setSelectedItemId={setSelectedItemId}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activePage === "auth" && (
          <AuthPage 
            setActivePage={setActivePage} 
            initialPanel={authRoleTarget}
            onSwitchTargetPanel={(target) => setAuthRoleTarget(target)}
          />
        )}

        {activePage === "listings" && (
          <ListingsPage 
            setActivePage={setActivePage}
            setSelectedItemId={setSelectedItemId}
          />
        )}

        {activePage === "item-detail" && (
          <ItemDetailPage 
            itemId={selectedItemId}
            setActivePage={setActivePage}
            setSelectedItemId={setSelectedItemId}
          />
        )}

        {activePage === "swap-request" && (
          <SwapRequestPage 
            itemId={selectedItemId}
            setActivePage={setActivePage}
            setSelectedSwapId={setSelectedSwapId}
          />
        )}

        {activePage === "chat" && (
          <ChatPage 
            activeSwapId={selectedSwapId}
            setActivePage={setActivePage}
          />
        )}

        {activePage === "dashboard" && (
          <DashboardPage 
            setActivePage={setActivePage}
            setSelectedItemId={setSelectedItemId}
            setSelectedSwapId={setSelectedSwapId}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activePage === "admin" && (
          <AdminPage 
            setActivePage={setActivePage}
            setSelectedItemId={setSelectedItemId}
          />
        )}
      </main>

      {/* Universal Footer */}
      <Footer setActivePage={setActivePage} />

      {/* Upload Item Modal */}
      <AddItemModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        setActivePage={setActivePage}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
