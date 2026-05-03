import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wallet, CheckCircle, Clock, CreditCard, Receipt, ArrowRight } from 'lucide-react';
import { StorageService } from '../../services/storage';

const MyBills = () => {
  const { userData } = useAuth();
  const [bills, setBills] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    if (userData?.tenant_id) {
      const rtSettings = StorageService.getSettings(userData.tenant_id);
      setSettings(rtSettings);
      
      // Generate some mock historical bills + check current status
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      const payments = StorageService.getDuesPayments(userData.tenant_id, currentMonth, currentYear);
      const isCurrentPaid = payments.some(p => p.resident_name === userData.nama_lengkap);

      const history = [
        { month: currentMonth, year: currentYear, amount: rtSettings.monthly_due_amount, status: isCurrentPaid ? 'Lunas' : 'Belum Bayar', date: isCurrentPaid ? payments[0].createdAt : '-' },
        { month: currentMonth - 1 || 12, year: currentMonth === 1 ? currentYear - 1 : currentYear, amount: rtSettings.monthly_due_amount, status: 'Lunas', date: '05/04/2026' },
        { month: currentMonth - 2 || 11, year: currentMonth <= 2 ? currentYear - 1 : currentYear, amount: rtSettings.monthly_due_amount, status: 'Lunas', date: '02/03/2026' }
      ];
      setBills(history);
    }
  }, [userData]);

  const getMonthName = (m) => {
    return new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(2026, m - 1));
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="gradient-text">Tagihan & Iuran Saya</h1>
        <p style={{ color: 'var(--text-muted)' }}>Pantau status pembayaran iuran RT Anda secara transparan.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div className="gradient-bg" style={{ width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Wallet color="white" size={30} />
            </div>
            <h2 style={{ fontSize: '1.5rem' }}>Rp {settings?.monthly_due_amount.toLocaleString()}</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Iuran Bulanan RT {userData?.rt_number}</p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
              <span color="var(--text-muted)">Metode Pembayaran</span>
              <span style={{ fontWeight: 'bold' }}>Tunai / Transfer Ke RT</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
              "Silakan hubungi Bendahara RT atau bayar melalui kolektor warga untuk update status lunas."
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }}>
            <Receipt size={18} /> Konfirmasi Pembayaran
          </button>
        </div>

        <div className="glass-panel">
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '1rem' }}>Riwayat Pembayaran</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {bills.map((bill, idx) => (
              <div key={idx} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem' }}>Iuran {getMonthName(bill.month)} {bill.year}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nominal: Rp {bill.amount.toLocaleString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.6rem', 
                    borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 'bold',
                    background: bill.status === 'Lunas' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: bill.status === 'Lunas' ? 'var(--success)' : 'var(--error)'
                  }}>
                    {bill.status === 'Lunas' ? <CheckCircle size={12} /> : <Clock size={12} />}
                    {bill.status}
                  </span>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{bill.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBills;
