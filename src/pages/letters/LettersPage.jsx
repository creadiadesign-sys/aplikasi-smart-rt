import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  User,
  FileSearch,
  Check,
  X,
  Building2
} from 'lucide-react';
import { StorageService } from '../../services/storage';

const LettersPage = () => {
  const { userData } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [selectedLetter, setSelectedLetter] = useState(null);

  useEffect(() => {
    if (userData?.tenant_id) {
      try {
        const data = StorageService.getLetters(userData.tenant_id);
        if (data.length === 0) {
          const seeds = [
            { id: 'LET-101', resident_name: 'Budi Santoso', resident_address: 'Blok A No. 12', type: 'Surat Pengantar KTP', purpose: 'Pembuatan KTP Baru', status: 'Pending', createdAt: new Date().toISOString() },
            { id: 'LET-102', resident_name: 'Siti Aminah', resident_address: 'Blok C No. 05', type: 'Surat Keterangan Domisili', purpose: 'Pembukaan Rekening Bank', status: 'Approved', approved_by: userData.nama_lengkap, createdAt: new Date(Date.now() - 86400000).toISOString() }
          ];
          seeds.forEach(s => StorageService.addLetterRequest(userData.tenant_id, s));
          setRequests(StorageService.getLetters(userData.tenant_id));
        } else {
          setRequests(data);
        }
      } catch (err) {
        console.error("Error fetching letters:", err);
      }
    }
  }, [userData]);

  const handleUpdateStatus = (id, status) => {
    try {
      const additionalData = status === 'Approved' ? { approved_by: userData.nama_lengkap } : {};
      StorageService.updateLetterStatus(id, status, additionalData);
      setRequests(StorageService.getLetters(userData.tenant_id));
      setSelectedLetter(null);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handlePrintLetter = (letter) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    
    const htmlContent = `
      <html>
        <head>
          <title>Cetak Surat Pengantar - ${letter.type}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');
            body { 
              font-family: 'Times New Roman', Times, serif; 
              padding: 2cm; 
              color: black; 
              background: white;
              line-height: 1.6;
            }
            .header {
              display: flex;
              align-items: center;
              gap: 20px;
              border-bottom: 4px double black;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .logo-placeholder {
              width: 80px;
              height: 80px;
              border: 2px solid black;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .header-text {
              flex: 1;
              text-align: center;
            }
            .header-text h1 {
              margin: 0;
              font-size: 18pt;
              text-transform: uppercase;
            }
            .header-text p {
              margin: 2px 0;
              font-size: 12pt;
            }
            .title {
              text-align: center;
              margin-bottom: 30px;
            }
            .title h2 {
              text-decoration: underline;
              margin-bottom: 5px;
              font-size: 14pt;
            }
            .details-table {
              width: 100%;
              margin-left: 30px;
              margin-bottom: 30px;
            }
            .details-table td {
              padding: 5px 0;
              vertical-align: top;
            }
            .details-table td:first-child {
              width: 180px;
            }
            .details-table td:nth-child(2) {
              width: 20px;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
            }
            .signature-box {
              text-align: center;
              width: 250px;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M8 10h.01"></path><path d="M16 10h.01"></path><path d="M8 14h.01"></path><path d="M16 14h.01"></path><path d="M10 18h.01"></path><path d="M14 18h.01"></path></svg>
            </div>
            <div class="header-text">
              <h1>PENGURUS RT ${userData?.rt_number || '...'} RW ${userData?.rw_number || '...'}</h1>
              <p><b>KELURAHAN ${userData?.village?.toUpperCase() || '...'} - KECAMATAN ${userData?.district?.toUpperCase() || '...'}</b></p>
              <p>${userData?.city?.toUpperCase() || '...'} - ${userData?.province?.toUpperCase() || '...'}</p>
            </div>
          </div>

          <div class="title">
            <h2>SURAT PENGANTAR</h2>
            <p>Nomor: ${letter.id}/RT-${userData?.rt_number}/RW-${userData?.rw_number}/${new Date().getFullYear()}</p>
          </div>

          <div class="content-section">
            <p>Yang bertanda tangan di bawah ini, Ketua RT ${userData?.rt_number} / RW ${userData?.rw_number}, menerangkan bahwa:</p>
            
            <table class="details-table">
              <tr>
                <td>N a m a</td>
                <td>:</td>
                <td><b>${letter.resident_name}</b></td>
              </tr>
              <tr>
                <td>Alamat</td>
                <td>:</td>
                <td>${letter.resident_address}</td>
              </tr>
              <tr>
                <td>Maksud / Tujuan</td>
                <td>:</td>
                <td>${letter.purpose}</td>
              </tr>
            </table>

            <p>Adalah benar warga kami yang bertempat tinggal di wilayah tersebut di atas. Demikian surat pengantar ini kami buat untuk dapat dipergunakan sebagaimana mestinya.</p>
          </div>

          <div class="footer">
            <div class="signature-box">
              <p>Mengetahui,<br>Ketua RW ${userData?.rw_number}</p>
              <div style="height: 80px"></div>
              <p><b>( ................................ )</b></p>
            </div>
            <div class="signature-box">
              <p>${userData?.city?.replace('KOTA ', '') || 'Tangerang'}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p>Ketua RT ${userData?.rt_number}</p>
              <div style="margin: 10px 0; display: flex; justify-content: center;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + '/verify/' + letter.id)}" 
                     style="width: 80px; height: 80px; border: 1px solid #eee; padding: 5px;" />
              </div>
              <p style="font-size: 8pt; margin-top: -5px; color: #666;">Scan untuk verifikasi keaslian</p>
              <p><b>( ${letter.approved_by || userData.nama_lengkap || '................................'} )</b></p>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const filteredRequests = (requests || []).filter(r => filterStatus === 'Semua' || r.status === filterStatus);

  const StatusBadge = ({ status }) => {
    const styles = {
      'Pending': { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', icon: <Clock size={14} /> },
      'Approved': { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', icon: <CheckCircle2 size={14} /> },
      'Rejected': { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', icon: <XCircle size={14} /> }
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

  if (!userData) return null;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="gradient-text">Manajemen Persuratan</h1>
        <p style={{ color: 'var(--text-muted)' }}>Proses pengajuan surat pengantar dan dokumen warga secara digital.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
        <div className="glass-panel">
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '1rem', overflowX: 'auto' }}>
            {['Semua', 'Pending', 'Approved', 'Rejected'].map(s => (
              <button 
                key={s} 
                onClick={() => setFilterStatus(s)}
                style={{ 
                  background: filterStatus === s ? 'var(--primary)' : 'transparent',
                  color: filterStatus === s ? 'white' : 'var(--text-muted)',
                  border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap'
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredRequests.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ada permohonan.</div>
            ) : (
              filteredRequests.map(req => (
                <div 
                  key={req.id} 
                  onClick={() => setSelectedLetter(req)}
                  style={{ 
                    padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', cursor: 'pointer',
                    background: selectedLetter?.id === req.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1rem' }}>{req.type}</h4>
                    <StatusBadge status={req.status} />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><User size={12} /> {req.resident_name}</span>
                    <span>{req.createdAt ? new Date(req.createdAt).toLocaleDateString('id-ID') : '-'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
          {selectedLetter ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {selectedLetter.id}</span>
                <StatusBadge status={selectedLetter.status} />
              </div>
              
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{selectedLetter.type}</h2>
              
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Nama Pemohon</label>
                  <p style={{ fontWeight: '600' }}>{selectedLetter.resident_name}</p>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Alamat</label>
                  <p>{selectedLetter.resident_address}</p>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Keperluan</label>
                  <p style={{ fontStyle: 'italic' }}>"{selectedLetter.purpose}"</p>
                </div>
              </div>

              {selectedLetter.status === 'Pending' ? (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => handleUpdateStatus(selectedLetter.id, 'Approved')} className="btn btn-primary" style={{ flex: 1 }}><Check size={18} /> Setujui</button>
                  <button onClick={() => handleUpdateStatus(selectedLetter.id, 'Rejected')} className="btn btn-outline" style={{ flex: 1, borderColor: 'var(--error)', color: 'var(--error)' }}><X size={18} /> Tolak</button>
                </div>
              ) : selectedLetter.status === 'Approved' ? (
                <button onClick={() => handlePrintLetter(selectedLetter)} className="btn btn-primary" style={{ width: '100%' }}>
                  <Printer size={18} /> Cetak Surat Digital (QR Verified)
                </button>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--error)', fontSize: '0.9rem' }}>
                  Permohonan ini telah ditolak.
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <FileSearch size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p>Pilih permohonan surat untuk memprosesnya.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LettersPage;
