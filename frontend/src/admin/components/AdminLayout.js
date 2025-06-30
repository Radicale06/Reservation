import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Calendar, 
  Home, 
  Users, 
  Settings, 
  LogOut,
  BarChart3,
  MapPin
} from 'lucide-react';
import { auth } from '../services/adminApi';
import '../styles/AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const user = auth.getUser();

  const handleLogout = () => {
    auth.logout();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: <Home size={20} />, label: 'Tableau de bord' },
    { path: '/admin/reservations', icon: <Calendar size={20} />, label: 'Réservations' },
    { path: '/admin/courts', icon: <MapPin size={20} />, label: 'Terrains' },
    { path: '/admin/statistics', icon: <BarChart3 size={20} />, label: 'Statistiques' },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile Header */}
      <header className="admin-header-mobile">
        <button className="menu-toggle" onClick={toggleSidebar}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 className="admin-title">Administration</h1>
        <div className="header-spacer"></div>
      </header>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Padel Admin</h2>
          <button className="close-sidebar" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <Users size={20} />
            <span>{user?.fullName || 'Admin'}</span>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <Outlet />
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
    </div>
  );
};

export default AdminLayout;