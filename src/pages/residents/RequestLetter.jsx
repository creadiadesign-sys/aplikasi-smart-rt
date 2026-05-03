import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Info, 
  ChevronRight, 
  Printer, 
  X,
  Building2
} from 'lucide-react';
import { StorageService } from '../../services/storage';

const RequestLetter = () => {
  const { userData } = useAuth();
  const [history, setHistory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'Surat Pengantar KTP',
    purpose: '',
    notes: ''
  });

  const letterTypes = [
    'Surat Pengantar KTP',
    'Surat Keterangan Domisili',
    'Surat Keterangan Tidak Mampu (SKTM)',
    'Surat Pengantar Nikah',
    'Surat Keterangan Usaha',
    'Surat Pindah'
  ];

  useEffect(() => {
    if (userData?.tenant_id) {
      const all = StorageService.getLetters(userData.tenant_id);
      const myLetters = all.filter(l => l.resident_name === userData.nama_lengkap);
      setHistory(myLetters);
    }
  }, [userData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRequest = {
      resident_name: userData.nama_lengkap,
      resident_address: `Blok/No. ${userData.house_number || '-'}`,
      type: formData.type,
      purpose: formData.purpose,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    StorageService.addLetterRequest(userData.tenant_id, newRequest);
    alert('Permohonan surat berhasil dikirim! Silakan tunggu verifikasi Ketua RT.');
    
    // Refresh history
    const all = StorageService.getLetters(userData.tenant_id);
    setHistory(all.filter(l => l.resident_name === userData.nama_lengkap));
    
    setShowForm(false);
    setFormData({ type: 'Surat Pengantar KTP', purpose: '', notes: '' });
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      'Pending': { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', icon: <Clock size={12} /> },
      'Approved': { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', icon: <CheckCircle2 size={12} /> },
      'Rejected': { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', icon: <XCircle size={12} /> }
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

  // NEW BULLETPROOF PRINT METHOD: Open in new window
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
              font-weight: bold;
              font-size: 10px;
              text-align: center;
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
            .content-section {
              margin-bottom: 20px;
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
            .signature-space {
              height: 80px;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-placeholder">LOGO<br>RT/RW</div>
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
                <td>NIK</td>
                <td>:</td>
                <td>${userData?.nik || '................................'}</td>
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
              <div class="signature-space"></div>
              <p><b>( ................................ )</b></p>
            </div>
            <div class="signature-box">
              <p>${userData?.city?.replace('KOTA ', '') || 'Tangerang'}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p>Ketua RT ${userData?.rt_number}</p>
              <div style="margin: 10px 0; display: flex; justify-content: center;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + '/verify/' + letter.id)}" 
                     alt="QR Verification" 
                     style="width: 80px; height: 80px; border: 1px solid #eee; padding: 5px;" />
              </div>
              <p style="font-size: 8pt; margin-top: -5px; color: #666;">Scan untuk verifikasi keaslian</p>
              <p><b>( ${letter.approved_by || 'Ketua RT'} )</b></p>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              // window.close(); // Optional: close after print
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="gradient-text">Permohonan Surat</h1>
          <p style={{ color: 'var(--text-muted)' }}>Ajukan surat pengantar RT secara digital tanpa perlu ke rumah Ketua RT.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <FileText size={18} /> Buat Permohonan Baru
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showForm ? '1fr' : '1.5fr 1fr', gap: '2rem' }}>
        {showForm ? (
          <div className="glass-panel" style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h3>Formulir Pengajuan Surat</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><XCircle size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Jenis Surat</label>
                <select className="input-field" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  {letterTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Keperluan / Alasan</label>
                <textarea 
                  className="input-field" 
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  placeholder="Contoh: Untuk persyaratan pembuatan KTP Baru atau Perpanjangan Paspor"
                  required
                  value={formData.purpose}
                  onChange={e => setFormData({...formData, purpose: e.target.value})}
                ></textarea>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                <Info size={20} color="var(--primary)" />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Setelah diajukan, Ketua RT akan memverifikasi permohonan Anda. Anda akan mendapatkan notifikasi status di halaman ini.
                </p>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Send size={18} /> Kirim Permohonan
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="glass-panel">
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                <h3 style={{ fontSize: '1rem' }}>Riwayat Pengajuan</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {history.length === 0 ? (
                  <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <FileText size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                    <p>Belum ada riwayat pengajuan surat.</p>
                  </div>
                ) : (
                  history.map((req, idx) => (
                    <div key={idx} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={20} color="var(--primary)" />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.95rem' }}>{req.type}</h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(req.createdAt).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <StatusBadge status={req.status} />
                        {req.status === 'Approved' && (
                          <button 
                            onClick={() => handlePrintLetter(req)}
                            className="btn btn-outline" 
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', color: 'var(--primary)', borderColor: 'var(--primary)40' }}
                          >
                            <Printer size={12} /> Cetak Surat
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), transparent)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>E-Surat Ready</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Surat yang telah disetujui Ketua RT dapat Anda unduh atau cetak langsung dari portal ini.
                </p>
                <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ width: '100%' }}>Ajukan Sekarang</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RequestLetter;
