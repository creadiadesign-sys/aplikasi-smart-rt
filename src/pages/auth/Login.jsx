import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Building2, ShieldCheck, User } from 'lucide-react';
import { StorageService } from '../../services/storage';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Check for Super Admin (Hardcoded for demo)
      if (email === 'superadmin@smartrt.com' && password === 'admin123') {
        const superAdminData = {
          uid: 'super-admin-001',
          email: email,
          role: 'super_admin',
          name: 'Global Super Admin'
        };
        login(superAdminData);
        navigate('/dashboard');
        return;
      }

      // 2. Check LocalStorage Tenants (For Admin RT Login)
      const tenants = StorageService.getTenants();
      const matchingTenant = tenants.find(t => t.admin_email === email);

      if (matchingTenant && password === 'admin123') {
        // Find the actual user record to get their real name (e.g. Restu Andrie Julian)
        const allUsers = JSON.parse(localStorage.getItem('smart_rt_all_users') || '[]');
        const realUser = allUsers.find(u => u.email === email);
        
        const adminRTData = {
          uid: realUser?.uid || `admin-${matchingTenant.id}`,
          email: email,
          role: 'admin_rt',
          nama_lengkap: realUser?.nama_lengkap || `Admin ${matchingTenant.name}`,
          tenant_id: matchingTenant.tenant_id,
          rt_name: matchingTenant.name,
          rt_number: matchingTenant.rt_number,
          rw_number: matchingTenant.rw_number,
          village: matchingTenant.village,
          district: matchingTenant.district,
          city: matchingTenant.city,
          province: matchingTenant.province,
          phone: matchingTenant.phone
        };
        login(adminRTData);
        navigate('/dashboard');
        return;
      }

      // 3. Check Self-Registered Users (Residents)
      const allUsers = JSON.parse(localStorage.getItem('smart_rt_all_users') || '[]');
      const registeredUser = allUsers.find(u => u.email === email && u.password === password);

      if (registeredUser) {
        login(registeredUser);
        navigate('/dashboard');
        return;
      }

      // 4. Fallback / Mock Resident (For Demo)
      if (email === 'warga@demo.com' && password === 'warga123') {
        const residentData = {
          uid: 'res-001',
          email: email,
          role: 'resident',
          name: 'Warga Contoh',
          tenant_id: 'RT01_RW005_KUNCIRAN_JAYA',
          rt_name: 'RT 01 Kunciran Jaya',
          rt_number: '001',
          rw_number: '005',
          village: 'KUNCIRAN JAYA'
        };
        login(residentData);
        navigate('/dashboard');
        return;
      }

      throw new Error('Email atau password salah. (Gunakan password admin123 untuk RT)');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header">
          <div className="auth-logo gradient-bg">
            <Building2 color="white" size={32} />
          </div>
          <h1 className="gradient-text">Selamat Datang</h1>
          <p>Masuk ke akun SMART-RT Anda</p>
        </div>

        {error && <div className="auth-error animate-fade-in">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={20} />
              <input 
                type="email" 
                className="input-field" 
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={20} />
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Mohon Tunggu...' : 'Masuk Sekarang'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', padding: '1rem', borderTop: '1px solid var(--glass-border)' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Warga Baru? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>Daftar sebagai Warga</Link>
          </p>
        </div>


      </div>
    </div>
  );
};

export default Login;
