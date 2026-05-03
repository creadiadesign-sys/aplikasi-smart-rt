import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  Filter,
  User,
  Home,
  ChevronRight,
  MoreVertical,
  Check,
  Play
} from 'lucide-react';
import { StorageService } from '../../services/storage';

const ManageReports = () => {
  const { userData } = useAuth();
  const [reports, setReports] = useState([]);
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    if (userData?.tenant_id) {
      const all = StorageService.getReports(userData.tenant_id);
      setReports(all);
    }
  }, [userData]);

  const handleUpdateStatus = (id, status) => {
    StorageService.updateReportStatus(id, status);
    setReports(StorageService.getReports(userData.tenant_id));
    if (selectedReport?.id === id) {
      setSelectedReport({ ...selectedReport, status });
    }
  };

  const filteredReports = reports.filter(r => filterStatus === 'Semua' || r.status === filterStatus);

  const StatusBadge = ({ status }) => {
    const styles = {
      'Pending': { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', icon: <Clock size={12} /> },
      'In Progress': { bg: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', icon: <Play size={12} /> },
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
      'Normal': 'rgba(255,255,255,0.05)',
      'Penting': 'rgba(245, 158, 11, 0.1)',
      'Darurat': 'rgba(239, 68, 68, 0.15)'
    };
    const colors = {
      'Normal': 'var(--text-muted)',
      'Penting': 'var(--warning)',
      'Darurat': 'var(--error)'
    };
    return (
      <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: '2px', background: styles[level], color: colors[level], fontWeight: 'bold', border: `1px solid ${colors[level]}20` }}>
        {level.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="gradient-text">Manajemen Aduan Warga</h1>
        <p style={{ color: 'var(--text-muted)' }}>Pantau dan tangani laporan serta keluhan dari warga RT Anda.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
        {/* Reports List */}
        <div className="glass-panel">
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '0.75rem', overflowX: 'auto' }}>
            {['Semua', 'Pending', 'In Progress', 'Resolved'].map(s => (
              <button 
                key={s} 
                onClick={() => setFilterStatus(s)}
                className={`btn ${filterStatus === s ? 'btn-primary' : ''}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: filterStatus === s ? 'var(--primary)' : 'transparent', color: filterStatus === s ? 'white' : 'var(--text-muted)', border: filterStatus === s ? 'none' : '1px solid var(--glass-border)' }}
              >
                {s}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredReports.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <MessageSquare size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                <p>Tidak ada laporan untuk kategori ini.</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div 
                  key={report.id} 
                  onClick={() => setSelectedReport(report)}
                  style={{ 
                    padding: '1.25rem 1.5rem', 
                    borderBottom: '1px solid var(--glass-border)', 
                    cursor: 'pointer',
                    background: selectedReport?.id === report.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                    transition: 'var(--transition)'
                  }}
                  className="hover-target"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <UrgencyBadge level={report.urgency} />
                      <h4 style={{ fontSize: '0.95rem' }}>{report.title}</h4>
                    </div>
                    <StatusBadge status={report.status} />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><User size={12} /> {report.resident_name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Home size={12} /> Blok {report.house_number}</span>
                    <span>{new Date(report.createdAt).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Report Detail */}
        <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content', position: 'sticky', top: '2rem' }}>
          {selectedReport ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <UrgencyBadge level={selectedReport.urgency} />
                <StatusBadge status={selectedReport.status} />
              </div>

              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{selectedReport.title}</h2>
              
              <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {selectedReport.content}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Pelapor</label>
                  <p style={{ fontWeight: '600' }}>{selectedReport.resident_name}</p>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Kategori</label>
                  <p style={{ fontWeight: '600' }}>{selectedReport.category}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Tindakan Pengurus RT:</p>
                
                {selectedReport.status === 'Pending' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedReport.id, 'In Progress')}
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                  >
                    <Play size={18} /> Tandai Sedang Diproses
                  </button>
                )}
                
                {selectedReport.status !== 'Resolved' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedReport.id, 'Resolved')}
                    className="btn btn-outline" 
                    style={{ width: '100%', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                  >
                    <CheckCircle2 size={18} /> Selesaikan Laporan
                  </button>
                )}

                {selectedReport.status === 'Resolved' && (
                  <div style={{ padding: '1rem', textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    LAPORAN TELAH DISELESAIKAN
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
              <p>Pilih salah satu laporan untuk melihat detail dan mengambil tindakan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageReports;
