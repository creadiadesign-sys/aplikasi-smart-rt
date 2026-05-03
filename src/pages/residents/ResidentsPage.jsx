import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, 
  Search, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  MoreVertical,
  Edit2,
  Trash2,
  X,
  UserCheck,
  UserMinus,
  Home
} from 'lucide-react';
import { StorageService } from '../../services/storage';

const ResidentsPage = () => {
  const { userData } = useAuth();
  const [residents, setResidents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    phone: '',
    house_number: '',
    occupant_status: 'Pemilik',
    resident_status: 'Tetap'
  });

  useEffect(() => {
    if (userData?.tenant_id) {
      setResidents(StorageService.getResidents(userData.tenant_id));
    }
  }, [userData]);

  const handleOpenCreate = () => {
    setEditingResident(null);
    setFormData({ name: '', nik: '', phone: '', house_number: '', occupant_status: 'Pemilik', resident_status: 'Tetap' });
    setShowModal(true);
  };

  const handleOpenEdit = (resident) => {
    setEditingResident(resident);
    setFormData({ ...resident });
    setShowModal(true);
    setActiveMenu(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingResident) {
      StorageService.updateResident(editingResident.id, formData);
    } else {
      StorageService.addResident(userData.tenant_id, formData);
    }
    setResidents(StorageService.getResidents(userData.tenant_id));
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Hapus data warga ini?')) {
      StorageService.deleteResident(id);
      setResidents(StorageService.getResidents(userData.tenant_id));
      setActiveMenu(null);
    }
  };

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.nik.includes(searchTerm) ||
    r.house_number.includes(searchTerm)
  );

  return (
    <div className="animate-fade-in" onClick={() => setActiveMenu(null)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="gradient-text">Data Warga {userData?.rt_name}</h1>
          <p style={{ color: 'var(--text-muted)' }}>Kelola informasi kependudukan dan status tempat tinggal warga.</p>
        </div>
        <button onClick={(e) => { e.stopPropagation(); handleOpenCreate(); }} className="btn btn-primary">
          <Plus size={18} />
          <span>Tambah Warga</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Warga</p>
          <h3 style={{ fontSize: '1.5rem' }}>{residents.length}</h3>
        </div>
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Kepala Keluarga</p>
          <h3 style={{ fontSize: '1.5rem' }}>{residents.filter(r => r.occupant_status === 'Pemilik').length}</h3>
        </div>
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Kontrak/Kos</p>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--warning)' }}>{residents.filter(r => r.occupant_status !== 'Pemilik').length}</h3>
        </div>
        <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ color: 'var(--text-muted)', marginRight: '0.75rem' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Cari Nama, NIK, atau No. Rumah..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginBottom: 0, border: 'none', background: 'transparent' }}
          />
        </div>
      </div>

      <div className="glass-panel">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1.25rem 1.5rem' }}>Nama / NIK</th>
              <th style={{ padding: '1.25rem 1.5rem' }}>No. Rumah</th>
              <th style={{ padding: '1.25rem 1.5rem' }}>Status Hunian</th>
              <th style={{ padding: '1.25rem 1.5rem' }}>Kontak</th>
              <th style={{ padding: '1.25rem 1.5rem' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredResidents.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada data warga.</td></tr>
            ) : (
              filteredResidents.map(resident => (
                <tr key={resident.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <p style={{ fontWeight: '600' }}>{resident.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{resident.nik}</p>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Home size={14} color="var(--primary)" />
                      <span>No. {resident.house_number}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem',
                      background: resident.occupant_status === 'Pemilik' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: resident.occupant_status === 'Pemilik' ? 'var(--success)' : 'var(--warning)',
                    }}>
                      {resident.occupant_status}
                    </span>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>({resident.resident_status})</span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <p style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Phone size={12} /> {resident.phone}
                    </p>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', position: 'relative' }}>
                    <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === resident.id ? null : resident.id); }} className="btn btn-outline" style={{ padding: '0.4rem' }}>
                      <MoreVertical size={18} />
                    </button>
                    {activeMenu === resident.id && (
                      <div className="glass-panel" style={{ position: 'absolute', right: '1.5rem', top: '3.5rem', zIndex: 100, width: '160px', padding: '0.5rem' }}>
                        <button onClick={() => handleOpenEdit(resident)} className="menu-item"><Edit2 size={14} /> Edit Data</button>
                        <button onClick={() => handleDelete(resident.id)} className="menu-item" style={{ color: 'var(--error)' }}><Trash2 size={14} /> Hapus</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingResident ? 'Edit Data Warga' : 'Tambah Warga Baru'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Nama Lengkap</label>
                <input type="text" className="input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">NIK</label>
                  <input type="text" className="input-field" required value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">No. Rumah</label>
                  <input type="text" className="input-field" required value={formData.house_number} onChange={e => setFormData({...formData, house_number: e.target.value})} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Nomor WhatsApp</label>
                <input type="text" className="input-field" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Status Hunian</label>
                  <select className="input-field" value={formData.occupant_status} onChange={e => setFormData({...formData, occupant_status: e.target.value})}>
                    <option value="Pemilik">Pemilik</option>
                    <option value="Kontrak">Kontrak</option>
                    <option value="Kos">Kos</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Status Warga</label>
                  <select className="input-field" value={formData.resident_status} onChange={e => setFormData({...formData, resident_status: e.target.value})}>
                    <option value="Tetap">Tetap</option>
                    <option value="Sementara">Sementara</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                {editingResident ? 'Simpan Perubahan' : 'Tambah Warga'}
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

export default ResidentsPage;
