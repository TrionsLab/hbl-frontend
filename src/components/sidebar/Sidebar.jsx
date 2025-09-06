import { useState, useEffect } from "react";
import { logout } from "../../api/authService";
import logo from "/assets/logo.png";
import Dashboard from "../../components/dashboard/Dashboard";
import Reception from "../../pages/reception/Reception";
import Archive from "../archive/Archive";
import ReferralEarnings from "../referralEarnings/ReferralEarnings";
import ReferralManager from "../referralManager/ReferralManager";
import Stats from "../stats/Stats";
import Test from "../test/Test";

const SideNavbar = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (isMobileView) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    if (isMobileView) {
      setIsMobileMenuOpen(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "stats":
        return <Stats />;
      case "trash":
        return <Archive />;
      case "reference-manager":
        return <ReferralManager />;
      case "reports":
        return <ReferralEarnings />;
      case "reception-manager":
        return <Reception />;
      case "test":
        return <Test />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Mobile Header */}
      {isMobileView && (
        <div className="flex items-center justify-between p-4 bg-white shadow-md md:hidden">
          <img width={50} src={logo} alt="Logo" />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            {isMobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Side Navbar */}
      <div
        className={`
          ${isMobileView ? "fixed inset-y-0 left-0 z-50 transform" : "w-64"} 
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:relative md:w-64
          bg-white shadow-md transition-transform duration-300 ease-in-out
          w-64 h-full overflow-y-auto
        `}
      >
        <div className="flex justify-center p-4 border-b border-gray-200">
          <img width={75} src={logo} alt="Logo" />
        </div>
        <nav className="mt-6">
          <NavItem
            label="Dashboard"
            icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            active={activeTab === "dashboard"}
            onClick={() => handleTabClick("dashboard")}
          />
          <NavItem
            label="Statistics"
            icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            active={activeTab === "stats"}
            onClick={() => handleTabClick("stats")}
          />
          <NavItem
            label="Deleted Bills"
            icon="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            active={activeTab === "trash"}
            onClick={() => handleTabClick("trash")}
          />
          <NavItem
            label="Referral Expenses"
            icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            active={activeTab === "reports"}
            onClick={() => handleTabClick("reports")}
          />
          <NavItem
            label="Reference Manager"
            icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            active={activeTab === "reference-manager"}
            onClick={() => handleTabClick("reference-manager")}
          />
          <NavItem
            label="Reception Manager"
            icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            active={activeTab === "reception-manager"}
            onClick={() => handleTabClick("reception-manager")}
          />
          <NavItem
            label="Test"
            icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            active={activeTab === "test"}
            onClick={() => handleTabClick("test")}
          />
          <div
            onClick={handleLogout}
            className="flex items-center px-6 py-3 cursor-pointer transition-colors duration-200 text-red-600 hover:bg-red-50 font-medium"
          >
            <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </div>
        </nav>
      </div>

      {/* Overlay for mobile menu */}
      {isMobileView && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {renderContent()}
      </div>
    </div>
  );
};

const NavItem = ({ label, icon, active, onClick }) => {
  return (
    <div
      className={`
        flex items-center px-6 py-3 cursor-pointer transition-colors duration-200 
        ${
          active
            ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      onClick={onClick}
    >
      <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
      </svg>
      <span className="font-medium">{label}</span>
    </div>
  );
};

export default SideNavbar;