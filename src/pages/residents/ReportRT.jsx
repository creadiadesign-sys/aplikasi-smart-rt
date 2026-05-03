import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Info,
  ChevronRight,
  ShieldAlert,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { StorageService } from '../../services/storage';

const ReportRT = () => {
  const { userData } = useAuth();
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Keamanan',
    title: '',
    content: '',
    urgency: 'Normal'
  });

  const categories = ['Keamanan', 'Kebersihan', 'Infrastruktur', 'Sosial', 'Lainnya'];
  const urgencyLevels = ['Normal', 'Penting', 'Darurat'];

  const [settings, setSettings] = useState(null);

  useEffect(() => {
    if (userData?.tenant_id) {
      setReports(StorageService.getReports(userData.tenant_id).filter(r => r.resident_name === userData.nama_lengkap));
      setSettings(StorageService.getSettings(userData.tenant_id));
    }
  }, [userData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newReport = {
      resident_name: userData.nama_lengkap,
      category: formData.category,
      title: formData.title,
      content: formData.content,
      urgency: formData.urgency,
      house_number: userData.house_number || '-'
    };

    StorageService.addReport(userData.tenant_id, newReport);
    alert('Laporan Anda telah terkirim ke Ketua RT. Terima kasih atas partisipasinya.');
    
    // Refresh history
    setReports(StorageService.getReports(userData.tenant_id).filter(r => r.resident_name === userData.nama_lengkap));
    
    setShowForm(false);
    setFormData({ category: 'Keamanan', title: '', content: '', urgency: 'Normal' });
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      'Pending': { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', icon: <Clock size={12} /> },
      'In Progress': { bg: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', icon: <Info size={12} /> },
      'Resolved': { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', icon: <CheckCircle2 size={12} /> }
    };
    const style = styles[status] || styles['Pending'];
    return (
      <span style={{ 
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.5rem', 
        borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', background: style.bg, color: style.color 
      }}>
        {style.icon} {status}
      </span>
    );
  };

  const UrgencyBadge = ({ level }) => {
    const styles = {
      'Normal': 'rgba(255,255,255,0.1)',
      'Penting': 'rgba(245, 158, 11, 0.2)',
      'Darurat': 'rgba(239, 68, 68, 0.2)'
    };
    const colors = {
      'Normal': 'var(--text-muted)',
      'Penting': 'var(--warning)',
      'Darurat': 'var(--error)'
    };
    return (
      <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: '2px', background: styles[level], color: colors[level], fontWeight: 'bold' }}>
        {level.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="gradient-text">Lapor RT</h1>
          <p style={{ color: 'var(--text-muted)' }}>Laporkan keluhan, saran, atau kejadian darurat di lingkungan Anda.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <ShieldAlert size={18} /> Buat Laporan Baru
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showForm ? '1fr' : '1.5fr 1fr', gap: '2rem' }}>
        {showForm ? (
          <div className="glass-panel" style={{ padding: '2rem', maxWidth: '750px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h3>Kirim Laporan Ke RT</h3>
              <button onClick={() => setShowForm(false)} className="btn btn-outline" style={{ padding: '0.4rem' }}><XCircle size={18} /></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Kategori Laporan</label>
                  <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Tingkat Urgensi</label>
                  <select className="input-field" value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})}>
                    {urgencyLevels.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Judul Laporan</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Contoh: Lampu jalan mati di depan Blok B"
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Isi Laporan / Keluhan</label>
                <textarea 
                  className="input-field" 
                  style={{ minHeight: '120px' }}
                  placeholder="Ceritakan detail kejadian atau keluhan Anda..."
                  required
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                ></textarea>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="input-label">Lampiran Foto (Optional)</label>
                <div style={{ border: '2px dashed var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', cursor: 'pointer' }}>
                  <ImageIcon size={32} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Klik atau seret foto ke sini untuk mengunggah</p>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Send size={18} /> Kirim Laporan Sekarang
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="glass-panel">
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                <h3 style={{ fontSize: '1rem' }}>Riwayat Laporan Saya</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {reports.length === 0 ? (
                  <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <MessageSquare size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                    <p>Belum ada laporan yang Anda buat.</p>
                  </div>
                ) : (
                  reports.map((report, idx) => (
                    <div key={idx} style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', transition: 'var(--transition)' }} className="hover-target">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <UrgencyBadge level={report.urgency} />
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{report.category}</span>
                        </div>
                        <StatusBadge status={report.status} />
                      </div>
                      <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{report.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {report.content}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          Lihat Detail <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), transparent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <ShieldAlert size={24} color="var(--error)" />
                  <h3 style={{ fontSize: '1.1rem' }}>Kontak Darurat</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(settings?.emergency_contacts || [
                    { name: 'Ketua RT', phone: '0812-3456-XXXX' },
                    { name: 'Keamanan (Pos)', phone: '0811-1234-XXXX' },
                    { name: 'Ambulans', phone: '118 / 119' }
                  ]).map((contact, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>{contact.name}</span>
                      <span className="font-bold">{contact.phone}</span>
                    </div>
                  ))}
                </div>
                <hr style={{ margin: '1rem 0', opacity: 0.1 }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Gunakan fitur Lapor RT untuk masalah non-darurat. Untuk kejadian darurat, segera hubungi nomor di atas.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportRT;
