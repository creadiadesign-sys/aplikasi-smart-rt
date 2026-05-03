import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Building2, 
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Key,
  X,
  Phone,
  Calendar,
  Filter,
  MapPin,
  Users,
  Award,
  User as UserIcon,
  Check
} from 'lucide-react';
import { StorageService } from '../../services/storage';

const API_BASE = 'https://www.emsifa.com/api-wilayah-indonesia/api';

const TenantsPage = () => {
  const [tenants, setTenants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingTenant, setEditingTenant] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tenantUsers, setTenantUsers] = useState([]);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVillage, setFilterVillage] = useState('Semua Kelurahan');

  const [formData, setFormData] = useState({ 
    name: '', 
    rt_number: '', 
    rw_number: '',
    province: '', 
    city: '',
    district: '',
    village: '', 
    admin_email: '',
    phone: '',
    billing_day: '1'
  });

  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  useEffect(() => {
    setTenants(StorageService.getTenants());
    fetch(`${API_BASE}/provinces.json`)
      .then(res => res.json())
      .then(data => setProvinces(data));
  }, []);

  // Cascading Fetchers
  useEffect(() => {
    if (formData.province_id) {
      fetch(`${API_BASE}/regencies/${formData.province_id}.json`)
        .then(res => res.json())
        .then(data => setCities(data));
    }
  }, [formData.province_id]);

  useEffect(() => {
    if (formData.city_id) {
      fetch(`${API_BASE}/districts/${formData.city_id}.json`)
        .then(res => res.json())
        .then(data => setDistricts(data));
    }
  }, [formData.city_id]);

  useEffect(() => {
    if (formData.district_id) {
      fetch(`${API_BASE}/villages/${formData.district_id}.json`)
        .then(res => res.json())
        .then(data => setVillages(data));
    }
  }, [formData.district_id]);

  // Unique villages for filter
  const uniqueVillages = ['Semua Kelurahan', ...new Set(tenants.map(t => t.village))];

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tenant.tenant_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVillage = filterVillage === 'Semua Kelurahan' || tenant.village === filterVillage;
    return matchesSearch && matchesVillage;
  });

  const handleOpenCreate = () => {
    setEditingTenant(null);
    setFormData({ 
      name: '', rt_number: '', rw_number: '', 
      province: '', province_id: '',
      city: '', city_id: '',
      district: '', district_id: '',
      village: '', 
      admin_email: '', phone: '', billing_day: '1' 
    });
    setShowModal(true);
  };

  const handleOpenEdit = (tenant) => {
    setEditingTenant(tenant);
    setFormData({ ...tenant });
    setShowModal(true);
    setActiveMenu(null);
  };

  const handleOpenUserManagement = (tenant) => {
    setSelectedTenant(tenant);
    const users = StorageService.getUsers(tenant.tenant_id);
    setTenantUsers(users);
    setShowUserModal(true);
    setActiveMenu(null);
  };

  const handlePromoteToRT = (userToPromote) => {
    if (window.confirm(`Jadikan ${userToPromote.nama_lengkap} sebagai Ketua RT Baru untuk ${selectedTenant.name}? Ketua RT lama akan otomatis menjadi Warga Biasa.`)) {
      // 1. Find the current RT admin
      const currentRT = tenantUsers.find(u => u.role === 'admin_rt');
      
      // 2. Demote current RT if exists
      if (currentRT) {
        StorageService.updateUserRole(currentRT.uid, 'resident');
      }
      
      // 3. Promote new RT
      StorageService.updateUserRole(userToPromote.uid, 'admin_rt');
      
      // 4. Update local state
      const updatedUsers = StorageService.getUsers(selectedTenant.tenant_id);
      setTenantUsers(updatedUsers);
      
      // 5. Update tenant's admin email record
      StorageService.updateTenant(selectedTenant.id, { admin_email: userToPromote.email });
      setTenants(StorageService.getTenants());
      
      alert(`Berhasil! ${userToPromote.nama_lengkap} sekarang adalah Ketua RT resmi.`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTenant) {
      StorageService.updateTenant(editingTenant.id, formData);
      setTenants(StorageService.getTenants());
    } else {
      const tenantId = `RT${formData.rt_number}_RW${formData.rw_number}_${formData.village.toUpperCase().replace(/\s/g, '_')}`;
      const saved = StorageService.addTenant({
        ...formData,
        tenant_id: tenantId,
        status: 'active'
      });
      setTenants([saved, ...tenants]);
    }
    setShowModal(false);
  };

  const handleResetPassword = (email) => {
    alert(`Instruksi reset password telah dikirim ke email: ${email}`);
    setActiveMenu(null);
  };

  const toggleStatus = (id) => {
    const updated = tenants.map(t => t.id === id ? { ...t, status: t.status === 'active' ? 'suspended' : 'active' } : t);
    setTenants(updated);
    setActiveMenu(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Hapus tenant ini secara permanen?')) {
      StorageService.deleteTenant(id);
      setTenants(StorageService.getTenants());
      setActiveMenu(null);
    }
  };

  return (
    <div className="animate-fade-in" onClick={() => setActiveMenu(null)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="gradient-text">Manajemen Tenant (RT)</h1>
          <p style={{ color: 'var(--text-muted)' }}>Pendaftaran RT dengan validasi wilayah nasional.</p>
        </div>
        <button onClick={(e) => { e.stopPropagation(); handleOpenCreate(); }} className="btn btn-primary">
          <Plus size={18} />
          <span>Daftarkan RT Baru</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Cari nama RT atau Tenant ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '3rem', marginBottom: 0 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '200px' }}>
          <Filter size={18} color="var(--text-muted)" />
          <select 
            className="input-field" 
            value={filterVillage}
            onChange={(e) => setFilterVillage(e.target.value)}
            style={{ marginBottom: 0, flex: 1 }}
          >
            {uniqueVillages.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-panel table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1.25rem 1.5rem' }}>Wilayah RT / RW</th>
              <th style={{ padding: '1.25rem 1.5rem' }}>Lokasi Administratif</th>
              <th style={{ padding: '1.25rem 1.5rem' }}>Kontak Admin</th>
              <th style={{ padding: '1.25rem 1.5rem' }}>Status</th>
              <th style={{ padding: '1.25rem 1.5rem' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada RT terdaftar.</td></tr>
            ) : (
              filteredTenants.map(tenant => (
                <tr key={tenant.id} style={{ borderBottom: '1px solid var(--glass-border)', opacity: tenant.status === 'suspended' ? 0.6 : 1 }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="gradient-bg" style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Building2 size={20} color="white" />
                      </div>
                      <div>
                        <p style={{ fontWeight: '600' }}>{tenant.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '0.2rem' }}>RT {tenant.rt_number} / RW {tenant.rw_number}</p>
                        <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: 'var(--text-muted)', border: '1px solid var(--glass-border)' }}>
                          ID: {tenant.tenant_id}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <p style={{ fontSize: '0.85rem' }}>{tenant.village}, {tenant.district}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tenant.city}, {tenant.province}</p>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <p style={{ fontSize: '0.85rem' }}>{tenant.admin_email}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{tenant.phone}</p>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', 
                      background: tenant.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: tenant.status === 'active' ? 'var(--success)' : 'var(--error)',
                      border: `1px solid ${tenant.status === 'active' ? 'var(--success)' : 'var(--error)'}40`
                    }}>
                      {tenant.status === 'active' ? 'Aktif' : 'Suspended'}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', position: 'relative' }}>
                    <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === tenant.id ? null : tenant.id); }} className="btn btn-outline" style={{ padding: '0.4rem' }}>
                      <MoreVertical size={18} />
                    </button>
                    {activeMenu === tenant.id && (
                      <div className="glass-panel" style={{ position: 'absolute', right: '1.5rem', top: '4rem', zIndex: 100, width: '220px', padding: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)' }}>
                        <button onClick={() => handleOpenUserManagement(tenant)} className="menu-item" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                          <Users size={14} /> Kelola Pejabat RT
                        </button>
                        <div style={{ margin: '0.5rem 0', borderTop: '1px solid var(--glass-border)' }}></div>
                        <button onClick={() => handleOpenEdit(tenant)} className="menu-item"><Edit2 size={14} /> Edit Detail RT</button>
                        <button onClick={() => handleResetPassword(tenant.admin_email)} className="menu-item"><Key size={14} /> Reset Password</button>
                        <button onClick={() => toggleStatus(tenant.id)} className="menu-item" style={{ color: tenant.status === 'active' ? 'var(--warning)' : 'var(--success)' }}>
                          {tenant.status === 'active' ? <><ShieldAlert size={14} /> Suspend Akses</> : <><ShieldCheck size={14} /> Aktifkan Kembali</>}
                        </button>
                        <div style={{ margin: '0.5rem 0', borderTop: '1px solid var(--glass-border)' }}></div>
                        <button onClick={() => handleDelete(tenant.id)} className="menu-item" style={{ color: 'var(--error)' }}>
                          <Trash2 size={14} /> Hapus Permanen
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: Manage Users / Role Transfer */}
      {showUserModal && selectedTenant && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '650px', padding: '2.5rem', position: 'relative' }}>
            <button onClick={() => setShowUserModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div className="gradient-bg" style={{ width: '64px', height: '64px', borderRadius: '16px', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={32} color="white" />
              </div>
              <h2 className="gradient-text">Suksesi Kepemimpinan RT</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pilih warga yang akan dipromosikan menjadi Ketua RT untuk <strong>{selectedTenant.name}</strong>.</p>
            </div>

            <div style={{ maxHeight: '350px', overflowY: 'auto', marginBottom: '2rem' }}>
              {tenantUsers.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Belum ada warga terdaftar di RT ini.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {tenantUsers.map((user) => (
                    <div key={user.uid} className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: user.role === 'admin_rt' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)', borderColor: user.role === 'admin_rt' ? 'var(--primary)' : 'var(--glass-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <UserIcon size={20} color={user.role === 'admin_rt' ? 'var(--primary)' : 'var(--text-muted)'} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1rem' }}>{user.nama_lengkap}</h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
                        </div>
                      </div>
                      
                      {user.role === 'admin_rt' ? (
                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <ShieldCheck size={12} /> KETUA RT AKTIF
                        </span>
                      ) : (
                        <button 
                          onClick={() => handlePromoteToRT(user)}
                          className="btn btn-outline" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderColor: 'var(--primary)40', color: 'var(--primary)' }}
                        >
                          Promosikan Jadi RT
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem' }}>
              <ShieldAlert size={20} color="var(--warning)" />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                <strong>Peringatan Keamanan:</strong> Tindakan ini akan mencabut hak akses admin dari Ketua RT lama dan memberikannya kepada warga terpilih. Data historis RT tetap aman dan tidak akan terhapus.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create/Edit Tenant */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>{editingTenant ? 'Edit Detail RT' : 'Pendaftaran RT Baru'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* ... form content ... */}
              <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.5fr 0.5fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Nama Wilayah</label>
                  <input type="text" className="input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Kunciran Jaya" />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">No. RT</label>
                  <input type="text" className="input-field" required value={formData.rt_number} onChange={e => setFormData({...formData, rt_number: e.target.value})} placeholder="001" />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">No. RW</label>
                  <input type="text" className="input-field" required value={formData.rw_number} onChange={e => setFormData({...formData, rw_number: e.target.value})} placeholder="005" />
                </div>
              </div>

              <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>
                  <MapPin size={16} />
                  <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Lokasi Administratif</span>
                </div>
                
                <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '0.7rem' }}>Provinsi</label>
                    <select 
                      className="input-field" value={formData.province_id} 
                      onChange={e => { const p = provinces.find(x => x.id === e.target.value); setFormData({...formData, province_id: e.target.value, province: p.name, city_id: '', district_id: ''}); }}
                      style={{ padding: '0.5rem' }}
                    >
                      <option value="">Pilih Provinsi</option>
                      {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '0.7rem' }}>Kota / Kabupaten</label>
                    <select 
                      className="input-field" value={formData.city_id} 
                      onChange={e => { const c = cities.find(x => x.id === e.target.value); setFormData({...formData, city_id: e.target.value, city: c.name, district_id: ''}); }}
                      disabled={!formData.province_id}
                      style={{ padding: '0.5rem' }}
                    >
                      <option value="">Pilih Kota</option>
                      {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '0.7rem' }}>Kecamatan</label>
                    <select 
                      className="input-field" value={formData.district_id} 
                      onChange={e => { const d = districts.find(x => x.id === e.target.value); setFormData({...formData, district_id: e.target.value, district: d.name}); }}
                      disabled={!formData.city_id}
                      style={{ padding: '0.5rem' }}
                    >
                      <option value="">Pilih Kecamatan</option>
                      {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '0.7rem' }}>Kelurahan / Desa</label>
                    <select 
                      className="input-field" value={formData.village} 
                      onChange={e => setFormData({...formData, village: e.target.value})}
                      disabled={!formData.district_id}
                      style={{ padding: '0.5rem' }}
                    >
                      <option value="">Pilih Kelurahan</option>
                      {villages.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Email Admin (Username)</label>
                  <input type="email" className="input-field" required value={formData.admin_email} onChange={e => setFormData({...formData, admin_email: e.target.value})} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">No. WhatsApp</label>
                  <input type="text" className="input-field" placeholder="62812xxx" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              
              <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label className="input-label">Siklus Tagihan (Billing Day)</label>
                <select className="input-field" value={formData.billing_day} onChange={e => setFormData({...formData, billing_day: e.target.value})}>
                  {[...Array(28)].map((_, i) => (
                    <option key={i+1} value={i+1}>Ditagih setiap tanggal {i+1}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontWeight: 'bold' }}>
                {editingTenant ? 'Simpan Perubahan' : 'Daftarkan RT & Aktifkan'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .menu-item { display: flex; align-items: center; gap: 0.75rem; width: 100%; padding: 0.75rem 1rem; background: transparent; border: none; color: var(--text-muted); font-size: 0.85rem; text-align: left; cursor: pointer; border-radius: var(--radius-sm); transition: var(--transition); }
        .menu-item:hover { background: rgba(255,255,255,0.05); color: white; }
      `}</style>
    </div>
  );
};

export default TenantsPage;
