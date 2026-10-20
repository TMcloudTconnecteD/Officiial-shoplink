// src/components/Footer.jsx
import React from "react";
import { FaEnvelope } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="shoplink-shell" style={{ paddingBottom: "28px" }}>
      <div className="shoplink-surface" style={{ padding: "22px 20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--shoplink-text)" }}>ShopLink</div>
              <div style={{ fontSize: "0.88rem", color: "var(--shoplink-text-soft)" }}>Campus essentials for smarter student living.</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--shoplink-text-soft)", fontSize: "0.9rem" }}>
              <FaEnvelope />
              <a href="mailto:aobizness@gmail.com" style={{ color: "var(--shoplink-primary)" }}>aobizness@gmail.com</a>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(15, 23, 42, 0.08)", paddingTop: "14px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", color: "var(--shoplink-text-soft)", fontSize: "0.82rem" }}>
            <span>© TMcloud {currentYear}</span>
            <span>Fast • trusted • student-first</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
