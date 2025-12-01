// src/components/HeaderUpdated.jsx
import React from "react";
import Navigation from "../pages/Auth/Navigation";

const HeaderUpdated = ({ onToggleSidebar }) => {
  // small wrapper - Navigation contains top nav and mobile bottom nav
  return (
    <header>
      <Navigation />
    </header>
  );
};

export default HeaderUpdated;
