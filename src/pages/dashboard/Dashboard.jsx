import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Wallet, 
  FileText, 
  Bell, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  ArrowUpRight 
} from 'lucide-react';
import { StorageService } from '../../services/storage';

const Dashboard = () => {
  const { userData, isAdmin, isSuperAdmin, isResident } = useAuth();
  const [stats, setStats] = useState({
    wargaCount: 0,
    kasBalance: 0,
    letterCount: 0,
    announcementCount: 0,
    myUnpaidDues: 0,
    myLetterStatus: 'N/A',
    tenantsCount: 0
  });

  useEffect(() => {
    if (!userData) return;

    // Admin RT Stats
    if (isAdmin) {
      const residents = StorageService.getResidents(userData.tenant_id);
      const transactions = StorageService.getTransactions(userData.tenant_id);
      const letters = StorageService.getLetters(userData.tenant_id);
      const announcements = StorageService.getAnnouncements(userData.tenant_id);
      
      const balance = transactions.reduce((acc, curr) => 
        curr.type === 'income' ? acc + Number(curr.amount) : acc - Number(curr.amount), 0
      );

      setStats(prev => ({
        ...prev,
        wargaCount: residents.length,
        kasBalance: balance,
        letterCount: letters.filter(l => l.status === 'Pending').length,
        announcementCount: announcements.length
      }));
    }

    // Resident Stats
    if (isResident) {
      const letters = StorageService.getLetters(userData.tenant_id);
      const myLetters = letters.filter(l => l.resident_name === userData.nama_lengkap);
      const announcements = StorageService.getAnnouncements(userData.tenant_id);
      
      // Calculate unpaid dues (simple mock: if they registered, assume they owe for current month)
      // Real logic would check StorageService.getDuesPayments
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const payments = StorageService.getDuesPayments(userData.tenant_id, currentMonth, currentYear);
      const isPaid = payments.some(p => p.resident_name === userData.nama_lengkap);
      const settings = StorageService.getSettings(userData.tenant_id);

      setStats(prev => ({
        ...prev,
        myUnpaidDues: isPaid ? 0 : settings.monthly_due_amount,
        myLetterStatus: myLetters.length > 0 ? myLetters[0].status : 'Tidak Ada',
        announcementCount: announcements.length
      }));
    }

    // Super Admin Stats
    if (isSuperAdmin) {
      const tenants = StorageService.getTenants();
      setStats(prev => ({ ...prev, tenantsCount: tenants.length }));
    }
  }, [userData, isAdmin, isResident, isSuperAdmin]);

  const StatCard = ({ icon, label, value, color, trend }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
        <div style={{ 
          padding: '0.75rem', 
          borderRadius: '12px', 
          background: `${color}15`, 
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</p>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{value}</h3>
        </div>
      </div>
      {trend && (
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '0.7rem', color: trend.startsWith('+') ? 'var(--success)' : 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          {trend} <ArrowUpRight size={10} />
        </div>
      )}
      <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.03 }}>
        {React.cloneElement(icon, { size: 80 })}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '1.75rem' }}>Ringkasan Operasional</h1>
        <p style={{ color: 'var(--text-muted)' }}>Panel kendali utama sistem SMART-RT wilayah {userData?.rt_name || 'Global'}.</p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {isSuperAdmin && (
          <>
            <StatCard icon={<TrendingUp />} label="Total RT Terdaftar" value={stats.tenantsCount} color="#6366f1" trend="+2" />
            <StatCard icon={<Users />} label="Total Akun Pengguna" value={stats.tenantsCount * 10} color="#ec4899" />
            <StatCard icon={<Wallet />} label="Total Estimasi MRR" value={`Rp ${(stats.tenantsCount * 250000).toLocaleString()}`} color="#10b981" />
          </>
        )}

        {isAdmin && (
          <>
            <StatCard icon={<Users />} label="Total Warga Terdata" value={stats.wargaCount} color="#6366f1" />
            <StatCard icon={<Wallet />} label="Saldo Kas RT" value={`Rp ${stats.kasBalance.toLocaleString()}`} color="#10b981" />
            <StatCard icon={<FileText />} label="Surat Perlu Approval" value={stats.letterCount} color="#8b5cf6" />
            <StatCard icon={<Bell />} label="Pengumuman Aktif" value={stats.announcementCount} color="#f59e0b" />
          </>
        )}

        {isResident && (
          <>
            <StatCard icon={<Wallet />} label="Tagihan Bulan Ini" value={`Rp ${stats.myUnpaidDues.toLocaleString()}`} color={stats.myUnpaidDues > 0 ? '#ef4444' : '#10b981'} />
            <StatCard icon={<FileText />} label="Status Surat Terakhir" value={stats.myLetterStatus} color="#8b5cf6" />
            <StatCard icon={<Bell />} label="Info Pengumuman" value={`${stats.announcementCount} Aktif`} color="#f59e0b" />
          </>
        )}
      </div>

      <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: isResident ? '1fr' : '1.5fr 1fr', gap: '2rem' }}>
        {/* News / Announcements Section */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Pengumuman Terbaru</h3>
            <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>Lihat Semua</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {StorageService.getAnnouncements(userData?.tenant_id).slice(0, 3).map((ann, idx) => (
              <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>{ann.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ann.content}</p>
                <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--primary)' }}>{new Date(ann.createdAt).toLocaleDateString('id-ID')}</div>
              </div>
            ))}
            {StorageService.getAnnouncements(userData?.tenant_id).length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Belum ada pengumuman.</p>
            )}
          </div>
        </div>

        {!isResident && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Tugas Perlu Selesai</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-md)' }}>
                <CheckCircle color="var(--success)" size={20} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.85rem' }}>Laporan Kas Bulanan</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sudah disinkronkan</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: 'var(--radius-md)' }}>
                <Clock color="var(--warning)" size={20} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.85rem' }}>{stats.letterCount} Permohonan Surat</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Menunggu persetujuan</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
