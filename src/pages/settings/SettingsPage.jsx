import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Save, 
  Layers, 
  CreditCard, 
  ChevronRight,
  ShieldCheck,
  Building2,
  Tag,
  Phone,
  X
} from 'lucide-react';
import { StorageService } from '../../services/storage';

const SettingsPage = () => {
  const { userData } = useAuth();
  const [settings, setSettings] = useState(null);
  const [newIncomeCat, setNewIncomeCat] = useState('');
  const [newExpenseCat, setNewExpenseCat] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [newContact, setNewContact] = useState({ name: '', phone: '' });

  useEffect(() => {
    if (userData?.tenant_id) {
      setSettings(StorageService.getSettings(userData.tenant_id));
    }
  }, [userData]);

  const handleAddCategory = (type) => {
    if (type === 'income' && newIncomeCat) {
      const updated = { ...settings, income_categories: [...settings.income_categories, newIncomeCat] };
      setSettings(updated);
      setNewIncomeCat('');
    } else if (type === 'expense' && newExpenseCat) {
      const updated = { ...settings, expense_categories: [...settings.expense_categories, newExpenseCat] };
      setSettings(updated);
      setNewExpenseCat('');
    }
  };

  const handleRemoveCategory = (type, index) => {
    const key = type === 'income' ? 'income_categories' : 'expense_categories';
    const updated = { ...settings, [key]: settings[key].filter((_, i) => i !== index) };
    setSettings(updated);
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      const updated = { 
        ...settings, 
        emergency_contacts: [...(settings.emergency_contacts || []), newContact] 
      };
      setSettings(updated);
      setNewContact({ name: '', phone: '' });
    }
  };

  const handleRemoveContact = (index) => {
    const updated = { 
      ...settings, 
      emergency_contacts: settings.emergency_contacts.filter((_, i) => i !== index) 
    };
    setSettings(updated);
  };

  const handleSave = () => {
    StorageService.updateSettings(userData.tenant_id, settings);
    setSaveStatus('Berhasil disimpan!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  if (!settings) return null;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="gradient-text">Pengaturan Sistem RT</h1>
          <p style={{ color: 'var(--text-muted)' }}>Konfigurasi kategori keuangan dan parameter operasional RT Anda.</p>
        </div>
        <button onClick={handleSave} className="btn btn-primary">
          <Save size={18} />
          <span>{saveStatus || 'Simpan Perubahan'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Financial Settings */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div className="gradient-bg" style={{ padding: '0.5rem', borderRadius: '8px' }}>
              <Tag size={20} color="white" />
            </div>
            <h3>Kategori Keuangan</h3>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label className="input-label">Kategori Pemasukan / Iuran</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input 
                type="text" className="input-field" placeholder="Tambah kategori baru..." 
                style={{ marginBottom: 0 }} value={newIncomeCat} onChange={e => setNewIncomeCat(e.target.value)}
              />
              <button onClick={() => handleAddCategory('income')} className="btn btn-outline" style={{ padding: '0.75rem' }}><Plus size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {settings.income_categories.map((cat, i) => (
                <div key={i} className="glass-panel" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)' }}>
                  {cat}
                  <button onClick={() => handleRemoveCategory('income', i)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: 0 }}><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">Kategori Pengeluaran / Operasional</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input 
                type="text" className="input-field" placeholder="Tambah kategori baru..." 
                style={{ marginBottom: 0 }} value={newExpenseCat} onChange={e => setNewExpenseCat(e.target.value)}
              />
              <button onClick={() => handleAddCategory('expense')} className="btn btn-outline" style={{ padding: '0.75rem' }}><Plus size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {settings.expense_categories.map((cat, i) => (
                <div key={i} className="glass-panel" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)' }}>
                  {cat}
                  <button onClick={() => handleRemoveCategory('expense', i)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: 0 }}><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Contacts Settings */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div className="gradient-bg" style={{ padding: '0.5rem', borderRadius: '8px' }}>
              <Phone size={20} color="white" />
            </div>
            <h3>Kontak Darurat Warga</h3>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 40px', gap: '0.5rem', marginBottom: '1rem' }}>
              <input 
                type="text" className="input-field" placeholder="Label (Misal: Polsek)" 
                style={{ marginBottom: 0 }} value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})}
              />
              <input 
                type="text" className="input-field" placeholder="No. Telepon" 
                style={{ marginBottom: 0 }} value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})}
              />
              <button onClick={handleAddContact} className="btn btn-outline" style={{ padding: '0.75rem' }}><Plus size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(settings.emergency_contacts || []).map((contact, i) => (
                <div key={i} className="glass-panel" style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.1rem' }}>{contact.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{contact.phone}</p>
                  </div>
                  <button onClick={() => handleRemoveContact(i)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Nominal Iuran Bulanan (Rp)</label>
            <input 
              type="number" className="input-field" 
              value={settings.monthly_due_amount} 
              onChange={e => setSettings({...settings, monthly_due_amount: parseInt(e.target.value)})} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
