import React from "react";
import Navbar from "../../components/navbar/Navbar";
import Dashboard from "../dashboard/Dashboard";
import SideNavbar from "../../components/common/SideNavbar";

const ReceptionDashboard = () => {
  return (
    <>
      <Navbar />
      <SideNavbar />
      <Dashboard />
    </>
  );
};

export default ReceptionDashboard;
