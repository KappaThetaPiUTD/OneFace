import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function SidebarLink({ to, Icon, label, onClick }) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <NavLink
      to={to}
      className={({ isActive }) => (isActive ? "active" : undefined)}
      title={label}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={(e) => {
        if (onClick) {
          onClick(e);
        }
      }}
    >
      <Icon
        size={30}
        className={`sidebar-icon-hover ${isHovering ? "pulse" : ""}`}
        style={{ transition: "all 0.3s ease" }}
      />
    </NavLink>
  );
}
