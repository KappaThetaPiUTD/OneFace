import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineCalendar,
  HiOutlineUserCircle,
  HiOutlineLogout,
} from "react-icons/hi";
import SidebarLink from "./SidebarLink";

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const linksRef = useRef([]);

  useEffect(() => {
    // Animate sidebar appearance
    if (sidebarRef.current) {
      sidebarRef.current.classList.add("slide-right");
    }

    // Staggered animation for sidebar links
    linksRef.current.forEach((link, index) => {
      if (link) {
        setTimeout(() => {
          link.classList.add("fade-in");
        }, 100 + index * 100);
      }
    });
  }, []);

  return (
    <aside ref={sidebarRef} className="sidebar theme-transition">
      <div ref={(el) => (linksRef.current[0] = el)}>
        <SidebarLink to="/dashboard" Icon={HiOutlineHome} label="Dashboard" />
      </div>
      <div ref={(el) => (linksRef.current[1] = el)}>
        <SidebarLink to="/calendar" Icon={HiOutlineCalendar} label="Calendar" />
      </div>
      <div ref={(el) => (linksRef.current[2] = el)}>
        <SidebarLink to="/settings" Icon={HiOutlineUserCircle} label="Settings" />
      </div>
      <div className="spacer" />
      <div ref={(el) => (linksRef.current[3] = el)}>
        <SidebarLink 
          to="/login" 
          Icon={HiOutlineLogout} 
          label="Logout"
          onClick={async () => {
            if (onLogout) {
              await onLogout();
              navigate("/login");
            }
          }} 
        />
      </div>
    </aside>
  );
}
