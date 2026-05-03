import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, 
  Search, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  User,
  Building2,
  ChevronRight,
  Send,
  CornerDownRight
} from 'lucide-react';
import { StorageService } from '../../services/storage';

const SupportTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    setTickets(StorageService.getTickets());
  }, []);

  const handleUpdateStatus = (id, newStatus) => {
    StorageService.updateTicketStatus(id, newStatus);
    const updatedTickets = StorageService.getTickets();
    setTickets(updatedTickets);
    if (selectedTicket?.id === id) {
      setSelectedTicket(updatedTickets.find(t => t.id === id));
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;

    const reply = {
      sender: 'Super Admin',
      content: replyText,
      role: 'super_admin'
    };

    StorageService.addTicketReply(selectedTicket.id, reply);
    setReplyText('');
    
    // Refresh
    const updatedTickets = StorageService.getTickets();
    setTickets(updatedTickets);
    setSelectedTicket(updatedTickets.find(t => t.id === selectedTicket.id));
    alert('Balasan telah dikirim.');
  };

  const filteredTickets = tickets.filter(t => filterStatus === 'Semua' || t.status === filterStatus);

  const StatusBadge = ({ status }) => {
    const styles = {
      'Pending': { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', icon: <AlertCircle size={14} /> },
      'In Progress': { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', icon: <Clock size={14} /> },
      'Resolved': { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', icon: <CheckCircle2 size={14} /> }
    };
    const style = styles[status] || styles['Pending'];
    return (
      <span style={{ 
        display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.6rem', 
        borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', background: style.bg, color: style.color 
      }}>
        {style.icon} {status}
      </span>
    );
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="gradient-text">Pusat Bantuan & Laporan</h1>
        <p style={{ color: 'var(--text-muted)' }}>Proses kendala teknis dari Warga dan Admin RT.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '2rem', alignItems: 'start' }}>
        {/* Ticket List */}
        <div className="glass-panel">
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '0.75rem' }}>
            {['Semua', 'Pending', 'In Progress', 'Resolved'].map(s => (
              <button 
                key={s} 
                onClick={() => setFilterStatus(s)}
                className={`btn ${filterStatus === s ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                {s}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '70vh', overflowY: 'auto' }}>
            {filteredTickets.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <LifeBuoy size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                <p>Belum ada laporan masuk.</p>
              </div>
            ) : (
              filteredTickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  onClick={() => setSelectedTicket(ticket)}
                  style={{ 
                    padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', cursor: 'pointer',
                    background: selectedTicket?.id === ticket.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                    transition: 'var(--transition)'
                  }}
                  className="hover-target"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1rem' }}>{ticket.subject}</h4>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><User size={12} /> {ticket.user_name || ticket.sender_name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Building2 size={12} /> {ticket.tenant_id}</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ticket Detail Panel */}
        <div className="glass-panel" style={{ position: 'sticky', top: '2rem', padding: '2rem', height: 'fit-content' }}>
          {selectedTicket ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{selectedTicket.id}</span>
                <StatusBadge status={selectedTicket.status} />
              </div>
              
              <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>{selectedTicket.subject}</h2>
              
              {/* Main Issue */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={16} />
                </div>
                <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', flex: 1 }}>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>{selectedTicket.description || selectedTicket.message}</p>
                </div>
              </div>

              {/* Replies History */}
              {(selectedTicket.replies || []).length > 0 && (
                <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {selectedTicket.replies.map((reply, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LifeBuoy size={16} color="white" />
                      </div>
                      <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.05)', flex: 1, border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '0.25rem' }}>DEVELOPER REPLY</p>
                        <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Tindakan & Status:</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleUpdateStatus(selectedTicket.id, 'In Progress')} className="btn btn-outline" style={{ flex: 1, fontSize: '0.75rem', borderColor: 'var(--warning)', color: 'var(--warning)' }}>Set In Progress</button>
                  <button onClick={() => handleUpdateStatus(selectedTicket.id, 'Resolved')} className="btn btn-outline" style={{ flex: 1, fontSize: '0.75rem', borderColor: 'var(--success)', color: 'var(--success)' }}>Set Resolved</button>
                </div>
              </div>

              {selectedTicket.status !== 'Resolved' && (
                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                  <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Balas Warga / RT:</p>
                  <textarea 
                    className="input-field" 
                    placeholder="Tulis balasan atau solusi..." 
                    rows="4"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                  ></textarea>
                  <button onClick={handleSendReply} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                    <Send size={18} /> Kirim Balasan
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <MessageSquare size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Pilih laporan untuk berdiskusi dengan pelapor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportTicketsPage;
