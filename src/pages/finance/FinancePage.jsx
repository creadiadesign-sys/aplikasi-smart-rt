import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Search, 
  Filter,
  Download,
  Calendar,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { StorageService } from '../../services/storage';

const FinancePage = () => {
  const { userData } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [residents, setResidents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [settings, setSettings] = useState(null);
  const [showAddTx, setShowAddTx] = useState(false);
  const [activeTab, setActiveTab] = useState('Kas');
  
  // Period State
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [txData, setTxData] = useState({
    title: '',
    amount: '',
    type: 'income',
    category: 'Iuran Warga',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (userData?.tenant_id) {
      setTransactions(StorageService.getTransactions(userData.tenant_id));
      setResidents(StorageService.getResidents(userData.tenant_id));
      setSettings(StorageService.getSettings(userData.tenant_id));
      setPayments(StorageService.getDuesPayments(userData.tenant_id, selectedMonth, selectedYear));
    }
  }, [userData, selectedMonth, selectedYear]);

  const handleAddTx = (e) => {
    e.preventDefault();
    StorageService.addTransaction(userData.tenant_id, {
      ...txData,
      amount: parseInt(txData.amount)
    });
    setTransactions(StorageService.getTransactions(userData.tenant_id));
    setShowAddTx(false);
    setTxData({ title: '', amount: '', type: 'income', category: 'Iuran Warga', date: new Date().toISOString().split('T')[0] });
  };

  const handlePayDues = (resident) => {
    const amount = settings?.monthly_due_amount || 50000;
    StorageService.payDues(userData.tenant_id, {
      resident_id: resident.id,
      resident_name: resident.name,
      month: selectedMonth,
      year: selectedYear,
      amount: amount
    });
    // Refresh data
    setPayments(StorageService.getDuesPayments(userData.tenant_id, selectedMonth, selectedYear));
    setTransactions(StorageService.getTransactions(userData.tenant_id));
  };

  const calculateTotal = (type) => {
    return transactions
      .filter(t => t.type === type)
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  const balance = calculateTotal('income') - calculateTotal('expense');

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const changePeriod = (dir) => {
    let newMonth = selectedMonth + dir;
    let newYear = selectedYear;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="gradient-text">Keuangan RT {userData?.rt_name}</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor kas, iuran warga, dan pengeluaran operasional.</p>
        </div>
        <button onClick={() => setShowAddTx(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>Input Transaksi</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Saldo Kas Saat Ini</span>
            <Wallet color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>Rp {balance.toLocaleString('id-ID')}</h3>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Pemasukan</span>
            <ArrowUpCircle color="var(--success)" />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>Rp {calculateTotal('income').toLocaleString('id-ID')}</h3>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Pengeluaran</span>
            <ArrowDownCircle color="var(--error)" />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>Rp {calculateTotal('expense').toLocaleString('id-ID')}</h3>
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', justifyContent: 'space-between', alignItems: 'center', pr: '1.5rem' }}>
          <div style={{ display: 'flex' }}>
            <button 
              onClick={() => setActiveTab('Kas')}
              style={{ 
                padding: '1.25rem 2rem', background: 'transparent', border: 'none', color: activeTab === 'Kas' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'Kas' ? '2px solid var(--primary)' : 'none', cursor: 'pointer', fontWeight: '600'
              }}
            >
              Log Transaksi Kas
            </button>
            <button 
              onClick={() => setActiveTab('Iuran')}
              style={{ 
                padding: '1.25rem 2rem', background: 'transparent', border: 'none', color: activeTab === 'Iuran' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'Iuran' ? '2px solid var(--primary)' : 'none', cursor: 'pointer', fontWeight: '600'
              }}
            >
              Monitoring Iuran Warga
            </button>
          </div>
          
          {activeTab === 'Iuran' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingRight: '1.5rem' }}>
              <button onClick={() => changePeriod(-1)} className="btn btn-outline" style={{ padding: '0.3rem' }}><ChevronLeft size={16} /></button>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', minWidth: '120px', textAlign: 'center' }}>
                {monthNames[selectedMonth-1]} {selectedYear}
              </span>
              <button onClick={() => changePeriod(1)} className="btn btn-outline" style={{ padding: '0.3rem' }}><ChevronRight size={16} /></button>
            </div>
          )}
        </div>

        <div style={{ padding: '1.5rem' }}>
          {activeTab === 'Kas' ? (
            <div className="animate-fade-in">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '1rem' }}>Tanggal</th>
                    <th style={{ padding: '1rem' }}>Deskripsi</th>
                    <th style={{ padding: '1rem' }}>Kategori</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada data transaksi.</td></tr>
                  ) : (
                    transactions.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{t.date}</td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: '600' }}>{t.title}</td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem' }}><span style={{ opacity: 0.7 }}>{t.category}</span></td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: t.type === 'income' ? 'var(--success)' : 'var(--error)' }}>
                          {t.type === 'income' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1rem' }}>Data Iuran Warga</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Menampilkan status pembayaran periode {monthNames[selectedMonth-1]} {selectedYear}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                  <div className="glass-panel" style={{ padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                    Lunas: {residents.filter(r => payments.some(p => p.resident_id === r.id)).length}
                  </div>
                  <div className="glass-panel" style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
                    Belum: {residents.length - residents.filter(r => payments.some(p => p.resident_id === r.id)).length}
                  </div>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '1rem' }}>Nama Warga</th>
                    <th style={{ padding: '1rem' }}>No. Rumah</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {residents.length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Mohon isi data warga terlebih dahulu di menu Data Warga.</td></tr>
                  ) : (
                    residents.map(r => {
                      const isPaid = payments.some(p => p.resident_id === r.id);
                      return (
                        <tr key={r.id} style={{ borderBottom: '1px solid var(--glass-border)', opacity: isPaid ? 0.7 : 1 }}>
                          <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{r.name}</td>
                          <td style={{ padding: '1rem', fontSize: '0.85rem' }}>No. {r.house_number}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ 
                              padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold',
                              background: isPaid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: isPaid ? 'var(--success)' : 'var(--error)'
                            }}>
                              {isPaid ? 'Lunas' : 'Belum Bayar'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            {!isPaid ? (
                              <button 
                                onClick={() => handlePayDues(r)}
                                className="btn btn-primary" 
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                              >
                                Terima Iuran
                              </button>
                            ) : (
                              <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem', fontSize: '0.75rem' }}>
                                <CheckCircle2 size={16} /> Terverifikasi
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddTx && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Input Transaksi Baru</h2>
            <form onSubmit={handleAddTx}>
              <div className="input-group">
                <label className="input-label">Jenis Transaksi</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => setTxData({...txData, type: 'income'})} className={`btn ${txData.type === 'income' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }}>Pemasukan</button>
                  <button type="button" onClick={() => setTxData({...txData, type: 'expense'})} className={`btn ${txData.type === 'expense' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1, background: txData.type === 'expense' ? 'var(--error)' : 'transparent', color: txData.type === 'expense' ? 'white' : 'var(--text)' }}>Pengeluaran</button>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Keterangan / Deskripsi</label>
                <input type="text" className="input-field" required value={txData.title} onChange={e => setTxData({...txData, title: e.target.value})} placeholder="Contoh: Pembelian Sapu Jalan" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Nominal (Rp)</label>
                  <input type="number" className="input-field" required value={txData.amount} onChange={e => setTxData({...txData, amount: e.target.value})} placeholder="50000" />
                </div>
                <div className="input-group">
                  <label className="input-label">Kategori</label>
                  <select className="input-field" value={txData.category} onChange={e => setTxData({...txData, category: e.target.value})}>
                    {txData.type === 'income' 
                      ? settings?.income_categories.map(c => <option key={c} value={c}>{c}</option>)
                      : settings?.expense_categories.map(c => <option key={c} value={c}>{c}</option>)
                    }
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Tanggal</label>
                <input type="date" className="input-field" value={txData.date} onChange={e => setTxData({...txData, date: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddTx(false)} className="btn btn-outline" style={{ flex: 1 }}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancePage;
