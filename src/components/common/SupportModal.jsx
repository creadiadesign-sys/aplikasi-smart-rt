import React, { useState, useEffect } from 'react';
import { 
  X, 
  LifeBuoy, 
  Send, 
  Bug, 
  Lightbulb, 
  MessageSquare,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ChevronRight,
  User,
  History
} from 'lucide-react';
import { StorageService } from '../../services/storage';

const SupportModal = ({ isOpen, onClose, userData }) => {
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'
  const [formData, setFormData] = useState({
    category: 'Bug / Error',
    subject: '',
    description: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [myTickets, setMyTickets] = useState([]);
  const [viewTicket, setViewTicket] = useState(null);

  useEffect(() => {
    if (isOpen && userData?.email) {
      const all = StorageService.getTickets();
      setMyTickets(all.filter(t => t.user_email === userData.email || t.sender_name === userData.nama_lengkap));
    }
  }, [isOpen, userData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const ticket = {
      tenant_id: userData.tenant_id,
      user_name: userData.nama_lengkap,
      user_email: userData.email,
      role: userData.role,
      category: formData.category,
      subject: formData.subject,
      description: formData.description,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      replies: []
    };

    StorageService.addTicket(ticket);
    setSubmitted(true);
    
    // Refresh history
    const all = StorageService.getTickets();
    setMyTickets(all.filter(t => t.user_email === userData.email || t.sender_name === userData.nama_lengkap));

    setTimeout(() => {
      setSubmitted(false);
      setActiveTab('history');
      setFormData({ category: 'Bug / Error', subject: '', description: '' });
    }, 2000);
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      'Pending': { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' },
      'In Progress': { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' },
      'Resolved': { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }
    };
    const style = styles[status] || styles['Pending'];
    return (
      <span style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 'bold', background: style.bg, color: style.color }}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: viewTicket ? '600px' : '500px', padding: '2.5rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        {!viewTicket && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
            <button 
              onClick={() => setActiveTab('new')}
              style={{ background: 'transparent', border: 'none', color: activeTab === 'new' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'new' ? 'bold' : 'normal', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <MessageSquare size={16} /> Laporan Baru
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              style={{ background: 'transparent', border: 'none', color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'history' ? 'bold' : 'normal', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <History size={16} /> Riwayat & Balasan {myTickets.length > 0 && <span style={{ background: 'var(--primary)', color: 'white', fontSize: '0.6rem', padding: '0.1rem 0.3rem', borderRadius: '10px' }}>{myTickets.length}</span>}
            </button>
          </div>
        )}

        {viewTicket ? (
          <div className="animate-fade-in">
            <button onClick={() => setViewTicket(null)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1.5rem' }}>
              <X size={14} /> Kembali ke Riwayat
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>{viewTicket.subject}</h3>
              <StatusBadge status={viewTicket.status} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
              {/* User Message */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={16} />
                </div>
                <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', flex: 1 }}>
                  <p style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>{viewTicket.description || viewTicket.message}</p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{new Date(viewTicket.createdAt).toLocaleString('id-ID')}</p>
                </div>
              </div>

              {/* Developer Replies */}
              {(viewTicket.replies || []).map((reply, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LifeBuoy size={16} color="white" />
                  </div>
                  <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.05)', flex: 1, border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '0.25rem' }}>DEVELOPER REPLY</p>
                    <p style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>{reply.content}</p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{new Date(reply.createdAt).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'new' ? (
          submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <CheckCircle2 size={32} color="var(--success)" />
              </div>
              <h2 className="gradient-text">Laporan Terkirim!</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Membuka riwayat laporan Anda...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="animate-fade-in">
              <div className="input-group">
                <label className="input-label">Kategori</label>
                <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="Bug / Error">Bug / Error (Sistem Error)</option>
                  <option value="Saran Fitur">Saran Fitur Baru</option>
                  <option value="Pertanyaan">Pertanyaan Penggunaan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Subjek</label>
                <input type="text" className="input-field" required placeholder="Misal: Gagal cetak surat" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Detail Masalah</label>
                <textarea className="input-field" required style={{ minHeight: '120px' }} placeholder="Jelaskan kendala Anda..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
                <Send size={18} /> Kirim Laporan ke Developer
              </button>
            </form>
          )
        ) : (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {myTickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                <MessageSquare size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                <p>Belum ada riwayat laporan.</p>
              </div>
            ) : (
              myTickets.map((t) => (
                <div 
                  key={t.id} 
                  onClick={() => setViewTicket(t)}
                  className="glass-panel hover-target" 
                  style={{ padding: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{t.subject}</h4>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <StatusBadge status={t.status} />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(t.createdAt).toLocaleDateString('id-ID')}</span>
                      {(t.replies || []).length > 0 && (
                        <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 'bold' }}>• Ada Balasan</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--text-muted)" />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportModal;
