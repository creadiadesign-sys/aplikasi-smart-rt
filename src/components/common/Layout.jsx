import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Wallet, 
  FileText, 
  Bell, 
  LogOut, 
  ShieldCheck,
  ClipboardList,
  CreditCard,
  LifeBuoy,
  Settings,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SupportModal from './SupportModal';

const Layout = ({ children }) => {
  const { userData, isSuperAdmin, isAdmin, isResident, logout } = useAuth();
  const navigate = useNavigate();
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    // Common Items
    { icon: <Home size={20} />, label: 'Dashboard', path: '/dashboard', show: true },
    
    // Super Admin Items
    { icon: <ShieldCheck size={20} />, label: 'Manage Tenants', path: '/tenants', show: isSuperAdmin },
    { icon: <CreditCard size={20} />, label: 'Billing & Plans', path: '/billing', show: isSuperAdmin },
    { icon: <LifeBuoy size={20} />, label: 'Support Reports', path: '/support', show: isSuperAdmin },
    
    // Admin RT Items
    { icon: <Users size={20} />, label: 'Data Warga', path: '/warga', show: isAdmin },
    { icon: <Wallet size={20} />, label: 'Kas & Iuran', path: '/finance', show: isAdmin },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings', show: isAdmin },
    { icon: <FileText size={20} />, label: 'Persuratan', path: '/surat', show: isAdmin },
    { icon: <ClipboardList size={20} />, label: 'Aduan Warga', path: '/manage-reports', show: isAdmin },
    { icon: <Bell size={20} />, label: 'Pengumuman', path: '/announcements', show: isAdmin },
    
    // Resident Items
    { icon: <Wallet size={20} />, label: 'Tagihan Saya', path: '/my-bills', show: isResident },
    { icon: <FileText size={20} />, label: 'Request Surat', path: '/request-surat', show: isResident },
    { icon: <ClipboardList size={20} />, label: 'Lapor RT', path: '/report', show: isResident },
    { icon: <Bell size={20} />, label: 'Pengumuman', path: '/announcements', show: isResident },
  ];

  return (
    <div className="layout-container">
      {/* Sidebar - Desktop */}
      <aside className="sidebar glass-panel">
        <div className="brand gradient-text" style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
          SMART-RT
        </div>
        
        <nav style={{ flex: 1 }}>
          {navItems.filter(item => item.show).map((item, index) => (
            <NavLink 
              key={index} 
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
          
          {!isSuperAdmin && (
            <button 
              onClick={() => setIsSupportOpen(true)}
              className="nav-link"
              style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer' }}
            >
              <LifeBuoy size={20} />
              <span>Bantuan Sistem</span>
            </button>
          )}
        </nav>

        <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%' }}>
          <LogOut size={18} />
          <span>Keluar</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="gradient-text">
              Halo, {userData?.nama_lengkap || 'User'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {isAdmin ? `Ketua RT ${userData?.rt_number} / RW ${userData?.rw_number} | ` : ''}
              ID: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{userData?.tenant_id || 'Global'}</span>
            </p>
          </div>
        </header>
        
        <div className="animate-fade-in">
          {children}
        </div>
      </main>

      {/* Bottom Nav - Mobile */}
      <nav className="bottom-nav">
        {navItems.filter(item => item.show).slice(0, 4).map((item, index) => (
          <NavLink 
            key={index} 
            to={item.path}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'inherit', textDecoration: 'none', fontSize: '0.7rem' }}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
        {!isSuperAdmin && (
          <button 
            onClick={() => setIsSupportOpen(true)}
            className="bottom-nav-item"
            style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'inherit', fontSize: '0.7rem' }}
          >
            <LifeBuoy size={20} />
            <span>Bantuan</span>
          </button>
        )}
      </nav>

      {/* Support Modal */}
      <SupportModal 
        isOpen={isSupportOpen} 
        onClose={() => setIsSupportOpen(false)} 
        userData={userData}
      />

      <style>{`
        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: var(--text-muted);
          text-decoration: none;
          border-radius: var(--radius-md);
          margin-bottom: 0.5rem;
          transition: var(--transition);
          font-family: inherit;
          font-size: 0.95rem;
          text-align: left;
        }
        .nav-link:hover, .nav-link.active {
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
        }
        .nav-link.active {
          border-right: 3px solid var(--primary);
        }
        .bottom-nav-item.active {
          color: var(--primary);
        }
      `}</style>
    </div>
  );
};

export default Layout;
