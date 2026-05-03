import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, MapPin, Building2, User, Mail, Lock, Phone, CreditCard, XCircle } from 'lucide-react';
import { StorageService } from '../../services/storage';

const API_BASE = 'https://www.emsifa.com/api-wilayah-indonesia/api';

const Register = () => {
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    password: '',
    phone: '',
    nik: '',
    house_number: '',
    role: 'resident',
    province_id: '',
    city_id: '',
    district_id: '',
    village: '',
    tenant_id: ''
  });

  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);
  const [availableRTs, setAvailableRTs] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/provinces.json`)
      .then(res => res.json())
      .then(data => setProvinces(data));
  }, []);

  useEffect(() => {
    if (formData.province_id) {
      fetch(`${API_BASE}/regencies/${formData.province_id}.json`).then(res => res.json()).then(data => setCities(data));
    }
  }, [formData.province_id]);

  useEffect(() => {
    if (formData.city_id) {
      fetch(`${API_BASE}/districts/${formData.city_id}.json`).then(res => res.json()).then(data => setDistricts(data));
    }
  }, [formData.city_id]);

  useEffect(() => {
    if (formData.district_id) {
      fetch(`${API_BASE}/villages/${formData.district_id}.json`).then(res => res.json()).then(data => setVillages(data));
    }
  }, [formData.district_id]);

  // Load registered RTs in the selected village
  useEffect(() => {
    if (formData.village) {
      const allTenants = StorageService.getTenants();
      const filtered = allTenants.filter(t => t.village === formData.village);
      setAvailableRTs(filtered);
    }
  }, [formData.village]);

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.tenant_id) {
      setError('Silakan pilih RT tempat Anda tinggal.');
      setLoading(false);
      return;
    }

    try {
      const selectedRT = availableRTs.find(rt => rt.tenant_id === formData.tenant_id);
      
      const userData = {
        uid: `user-${Date.now()}`,
        ...formData,
        rt_name: selectedRT?.name,
        rt_number: selectedRT?.rt_number,
        rw_number: selectedRT?.rw_number,
        district: selectedRT?.district,
        city: selectedRT?.city,
        province: selectedRT?.province
      };

      // 1. Add to Residents list for the Admin RT
      StorageService.addResident(formData.tenant_id, {
        name: formData.nama_lengkap,
        nik: formData.nik,
        phone: formData.phone,
        house_number: formData.house_number,
        status_hunian: 'Pemilik',
        tenant_id: formData.tenant_id
      });

      // 2. Add to Global Users for Login
      const existingUsers = JSON.parse(localStorage.getItem('smart_rt_all_users') || '[]');
      localStorage.setItem('smart_rt_all_users', JSON.stringify([...existingUsers, userData]));

      alert('Pendaftaran berhasil! Silakan login menggunakan email Anda.');
      navigate('/login');
    } catch (err) {
      setError('Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card" style={{ maxWidth: '650px', padding: '2rem' }}>
        <div className="auth-header" style={{ marginBottom: '1.5rem' }}>
          <div className="auth-logo gradient-bg">
            <UserPlus color="white" size={32} />
          </div>
          <h1 className="gradient-text">Pendaftaran Warga</h1>
          <p>Daftarkan akun untuk akses layanan RT Digital.</p>
        </div>

        {error && (
          <div className="auth-error animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <XCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="auth-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Nama Lengkap</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input type="text" className="input-field" required value={formData.nama_lengkap} onChange={e => setFormData({...formData, nama_lengkap: e.target.value})} placeholder="Sesuai KTP" />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">No. Rumah</label>
              <div className="input-with-icon">
                <Building2 className="input-icon" size={18} />
                <input type="text" className="input-field" required value={formData.house_number} onChange={e => setFormData({...formData, house_number: e.target.value})} placeholder="Cth: B-12" />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Alamat Email (Untuk Login)</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input type="email" className="input-field" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="nama@email.com" />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">No. WhatsApp</label>
              <div className="input-with-icon">
                <Phone className="input-icon" size={18} />
                <input type="text" className="input-field" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="6281xxx" />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">NIK (Nomor Induk Kependudukan)</label>
            <div className="input-with-icon">
              <CreditCard className="input-icon" size={18} />
              <input type="text" className="input-field" required value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} placeholder="16 digit angka KTP" />
            </div>
          </div>

          <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
              <MapPin size={18} />
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Pilih Lokasi RT Anda</span>
            </div>
            
            <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <select className="input-field" style={{ padding: '0.6rem' }} value={formData.province_id} onChange={e => setFormData({...formData, province_id: e.target.value, city_id: '', district_id: '', village: '', tenant_id: ''})}>
                <option value="">-- Pilih Provinsi --</option>
                {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select className="input-field" style={{ padding: '0.6rem' }} value={formData.city_id} onChange={e => setFormData({...formData, city_id: e.target.value, district_id: '', village: '', tenant_id: ''})} disabled={!formData.province_id}>
                <option value="">-- Pilih Kota --</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <select className="input-field" style={{ padding: '0.6rem' }} value={formData.district_id} onChange={e => setFormData({...formData, district_id: e.target.value, village: '', tenant_id: ''})} disabled={!formData.city_id}>
                <option value="">-- Pilih Kecamatan --</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select className="input-field" style={{ padding: '0.6rem' }} value={formData.village} onChange={e => setFormData({...formData, village: e.target.value, tenant_id: ''})} disabled={!formData.district_id}>
                <option value="">-- Pilih Kelurahan --</option>
                {villages.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
              </select>
            </div>

            <div className="input-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
              <label className="input-label">Pilih RT (Yang Terdaftar)</label>
              <div className="input-with-icon">
                <Building2 className="input-icon" size={18} />
                <select className="input-field" value={formData.tenant_id} onChange={e => setFormData({...formData, tenant_id: e.target.value})} disabled={!formData.village}>
                  <option value="">-- Cari RT Anda --</option>
                  {availableRTs.map(rt => (
                    <option key={rt.tenant_id} value={rt.tenant_id}>RT {rt.rt_number} / RW {rt.rw_number} - {rt.name}</option>
                  ))}
                </select>
              </div>
              {formData.village && availableRTs.length === 0 && (
                <p style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: '0.5rem' }}>Belum ada RT di kelurahan ini yang terdaftar di SMART-RT.</p>
              )}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password Akun</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input type="password" className="input-field" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Min. 6 karakter" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ padding: '1rem' }}>
            {loading ? 'Sedang Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Sudah terdaftar? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
