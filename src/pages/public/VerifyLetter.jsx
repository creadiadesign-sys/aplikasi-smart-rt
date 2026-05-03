import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StorageService } from '../../services/storage';
import { CheckCircle2, XCircle, ShieldCheck, Clock, User, FileText, Building2, MapPin } from 'lucide-react';

const VerifyLetter = () => {
  const { id } = useParams();
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from a database using the ID.
    // Here we search through all letters in localStorage for the ID.
    const allTenants = JSON.parse(localStorage.getItem('smart_rt_letters') || '{}');
    let foundLetter = null;
    let foundTenantId = null;

    for (const tenantId in allTenants) {
      const match = allTenants[tenantId].find(l => l.id === id);
      if (match) {
        foundLetter = match;
        foundTenantId = tenantId;
        break;
      }
    }

    if (foundLetter) {
      setLetter(foundLetter);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p>Memverifikasi Dokumen...</p>
        </div>
      </div>
    );
  }

  if (!letter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white p-6">
        <div className="glass-panel max-w-md w-100 text-center p-8 border-error/20">
          <XCircle size={64} className="text-error mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Dokumen Tidak Valid</h1>
          <p className="text-text-muted mb-6">Maaf, data surat dengan ID tersebut tidak ditemukan di sistem kami atau telah dihapus.</p>
          <Link to="/" className="btn btn-primary w-full">Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Verification Badge */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3 bg-success/10 text-success px-6 py-3 rounded-full border border-success/20 animate-bounce-subtle">
            <ShieldCheck size={24} />
            <span className="font-bold tracking-wide">DOKUMEN TERVERIFIKASI ASLI</span>
          </div>
        </div>

        <div className="glass-panel p-6 md:p-10 relative overflow-hidden">
          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
            <Building2 size={400} />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-10 border-b border-white/10 pb-8">
              <div>
                <h2 className="text-text-muted text-sm uppercase tracking-widest mb-1">Jenis Dokumen</h2>
                <h1 className="text-2xl font-bold text-primary">{letter.type}</h1>
                <p className="text-sm text-text-muted mt-1">ID: {letter.id}</p>
              </div>
              <div className="text-right">
                <h2 className="text-text-muted text-sm uppercase tracking-widest mb-1">Status Keaslian</h2>
                <div className="flex items-center gap-2 text-success font-bold justify-end">
                  <CheckCircle2 size={18} />
                  <span>SAH & BERLAKU</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-text-muted mb-2 text-sm uppercase tracking-wider">
                    <User size={16} />
                    <span>Pemilik Dokumen</span>
                  </div>
                  <p className="text-lg font-semibold">{letter.resident_name}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-text-muted mb-2 text-sm uppercase tracking-wider">
                    <MapPin size={16} />
                    <span>Alamat Terdaftar</span>
                  </div>
                  <p className="text-lg font-semibold">{letter.resident_address}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-text-muted mb-2 text-sm uppercase tracking-wider">
                    <FileText size={16} />
                    <span>Keperluan</span>
                  </div>
                  <p className="text-lg font-semibold">{letter.purpose}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-text-muted mb-2 text-sm uppercase tracking-wider">
                    <Clock size={16} />
                    <span>Tanggal Dikeluarkan</span>
                  </div>
                  <p className="text-lg font-semibold">{new Date(letter.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 text-center">
              <p className="text-text-muted text-sm">
                Informasi ini dihasilkan secara otomatis oleh Sistem SMART-RT sebagai bukti keaslian dokumen digital. 
                Segala bentuk pemalsuan dapat dikenakan sanksi sesuai ketentuan yang berlaku.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-text-muted text-xs">
          &copy; {new Date().getFullYear()} SMART-RT Digital Transformation Agency. Seluruh Hak Cipta Dilindungi.
        </div>
      </div>
    </div>
  );
};

export default VerifyLetter;
