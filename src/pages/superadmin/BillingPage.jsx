import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Clock,
  AlertCircle,
  BellRing,
  Send,
  CheckCircle2,
  Wallet,
  MessageCircle,
  FileText,
  Download,
  Printer,
  X,
  Share2
} from 'lucide-react';
import { StorageService } from '../../services/storage';

const BillingPage = () => {
  const [billingData, setBillingData] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  useEffect(() => {
    setBillingData(StorageService.getBilling());
  }, []);

  const handlePay = (id) => {
    StorageService.payBill(id);
    setBillingData(StorageService.getBilling());
  };

  const handleWhatsAppReminder = (item) => {
    if (!item.phone) {
      alert('Nomor WhatsApp tidak tersedia.');
      return;
    }
    const message = `Halo Admin ${item.rt_name} (RT ${item.rt_number}), ini adalah pengingat dari SMART-RT. Tagihan bulan ini sebesar ${item.amount} sudah jatuh tempo pada ${item.dueDate}. Mohon segera melakukan pembayaran. Terima kasih.`;
    window.open(`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSendInvoiceWA = (invoice) => {
    const message = `Halo Admin ${invoice.rt_name} (RT ${invoice.rt_number}), Terima kasih atas pembayarannya. Berikut adalah bukti bayar (Invoice) Anda.\n\nNo. Invoice: ${invoice.id}\nStatus: LUNAS\nNominal: ${invoice.amount}\nTanggal Bayar: ${invoice.payDate}\n\nTerima kasih!`;
    window.open(`https://wa.me/${invoice.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const outstanding = billingData.filter(b => b.status === 'Belum Bayar');
  const paid = billingData.filter(b => b.status === 'Lunas');
  const totalRevenue = paid.length * 250000;

  const stats = [
    { label: 'Total Revenue', value: `Rp ${totalRevenue.toLocaleString('id-ID')}`, icon: <TrendingUp size={20} />, color: 'var(--success)' },
    { label: 'Total RT Terdaftar', value: `${StorageService.getTenants().length} RT`, icon: <Users size={20} />, color: 'var(--primary)' },
    { label: 'Tagihan Tertunda', value: `${outstanding.length} RT`, icon: <AlertCircle size={20} />, color: 'var(--error)' },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="gradient-text">Billing & Subscription</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manajemen tagihan otomatis dan invoice digital.</p>
      </div>

      <div className="dashboard-grid" style={{ padding: 0, marginBottom: '2.5rem' }}>
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: `${stat.color}10`, color: stat.color, width: 'fit-content', marginBottom: '1rem' }}>
              {stat.icon}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{stat.label}</p>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{stat.value}</h2>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Outstanding */}
          <div className="glass-panel">
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <BellRing size={20} color="var(--error)" />
              <h3 style={{ fontSize: '1.1rem' }}>Tunggakan Pembayaran ({outstanding.length})</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '1rem 1.5rem' }}>Nama RT / No</th>
                    <th style={{ padding: '1rem 1.5rem' }}>Tenggat</th>
                    <th style={{ padding: '1rem 1.5rem' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {outstanding.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.rt_name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>RT No: {item.rt_number || '-'}</p>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>{item.dueDate}</td>
                      <td style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleWhatsAppReminder(item)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderColor: '#25D366', color: '#25D366' }}><MessageCircle size={14} /> WA</button>
                        <button onClick={() => handlePay(item.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderColor: 'var(--success)', color: 'var(--success)' }}>Lunas</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paid History */}
          <div className="glass-panel">
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Riwayat Lunas</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <th style={{ padding: '1rem 1.5rem' }}>RT / Tenant</th>
                    <th style={{ padding: '1rem 1.5rem' }}>Tgl Bayar</th>
                    <th style={{ padding: '1rem 1.5rem' }}>Nominal</th>
                    <th style={{ padding: '1rem 1.5rem' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paid.map(tx => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--glass-border)', cursor: 'pointer' }} onClick={() => setSelectedInvoice(tx)}>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem' }}>
                        <p style={{ fontWeight: '600' }}>{tx.rt_name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RT No: {tx.rt_number || '-'}</p>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>{tx.payDate}</td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>{tx.amount}</td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}>
                          <FileText size={12} /> Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <Wallet size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <h3>SaaS Subscription</h3>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', margin: '0.5rem 0' }}>Rp 250.000</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Per RT / Bulan</p>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Invoice Digital</h2>
              <button onClick={() => setSelectedInvoice(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div id="invoice-content" style={{ padding: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                <div>
                  <h1 className="gradient-text" style={{ fontSize: '1.5rem', margin: 0 }}>SMART-RT</h1>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SaaS Digitalisasi RT</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>INVOICE</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{selectedInvoice.id}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>DITAGIHKAN KE:</p>
                  <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{selectedInvoice.rt_name}</p>
                  <p style={{ fontSize: '0.8rem' }}>RT Nomor: {selectedInvoice.rt_number || '-'}</p>
                  <p style={{ fontSize: '0.8rem' }}>Kel. {selectedInvoice.village}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>TANGGAL BAYAR:</p>
                  <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{selectedInvoice.payDate}</p>
                  <div style={{ marginTop: '0.5rem', display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', fontSize: '0.7rem', fontWeight: 'bold' }}>LUNAS</div>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2.5rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--glass-border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>DESKRIPSI</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1rem 0', fontSize: '0.9rem' }}>Langganan Smart-RT Premium (RT {selectedInvoice.rt_number})</td>
                    <td style={{ textAlign: 'right', padding: '1rem 0', fontWeight: 'bold' }}>{selectedInvoice.amount}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '200px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem' }}>Total Tagihan:</span>
                    <span style={{ fontWeight: 'bold' }}>{selectedInvoice.amount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--primary)', paddingTop: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold' }}>Total Bayar:</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{selectedInvoice.amount}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '1rem' }}>
              <button onClick={() => window.print()} className="btn btn-outline" style={{ flex: 1, gap: '0.5rem' }}><Printer size={16} /> Cetak / PDF</button>
              <button onClick={() => handleSendInvoiceWA(selectedInvoice)} className="btn btn-primary" style={{ flex: 1, gap: '0.5rem', background: '#25D366', borderColor: '#25D366' }}><MessageCircle size={16} /> Kirim via WA</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
