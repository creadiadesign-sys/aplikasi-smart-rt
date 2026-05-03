import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Megaphone, Plus, Calendar, User } from 'lucide-react';
import { StorageService } from '../../services/storage';

const AnnouncementsPage = () => {
  const { tenantId, isAdmin, userData } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

  useEffect(() => {
    setAnnouncements(StorageService.getAnnouncements(tenantId));
  }, [tenantId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) return;

    const saved = StorageService.addAnnouncement({
      ...newAnnouncement,
      tenant_id: tenantId,
      author_name: userData.nama_lengkap
    });
    
    setAnnouncements([saved, ...announcements]);
    setNewAnnouncement({ title: '', content: '' });
    setShowForm(false);
  };

  return (
    <div className="announcements-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="gradient-text">Papan Pengumuman</h1>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            <Plus size={18} />
            {showForm ? 'Batal' : 'Buat Pengumuman'}
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Judul Pengumuman</label>
              <input 
                type="text" 
                className="input-field" 
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                placeholder="Contoh: Kerja Bakti Hari Minggu"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Isi Pengumuman</label>
              <textarea 
                className="input-field" 
                rows="4"
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                placeholder="Tulis detail pengumuman di sini..."
                style={{ resize: 'vertical' }}
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Kirim Pengumuman
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {announcements.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Megaphone size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Belum ada pengumuman untuk wilayah ini.</p>
          </div>
        ) : (
          announcements.map((item) => (
            <div key={item.id} className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div className="gradient-bg" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <Megaphone size={24} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>
                    {item.content}
                  </p>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <User size={14} /> {item.author_name}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={14} /> {new Date(item.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
