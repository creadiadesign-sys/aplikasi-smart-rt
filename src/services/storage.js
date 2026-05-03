// Storage Service for Local Demo persistence
const STORAGE_KEYS = {
  TENANTS: 'smart_rt_tenants',
  ANNOUNCEMENTS: 'smart_rt_announcements',
  USERS: 'smart_rt_all_users',
  BILLING: 'smart_rt_billing',
  TICKETS: 'smart_rt_tickets',
  RESIDENTS: 'smart_rt_residents',
  FINANCE: 'smart_rt_finance',
  DUES_PAYMENTS: 'smart_rt_dues_payments',
  LETTERS: 'smart_rt_letters',
  REPORTS: 'smart_rt_reports',
  SETTINGS: 'smart_rt_settings',
  CURRENT_USER: 'smart_rt_current_session'
};

const getFromStorage = (key, defaultValue = []) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const saveToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const StorageService = {
  // ... existing methods ...
  // (I will replace the whole service to be safe, but focusing on the end)
  
  // Reports
  getReports: (tenantId) => {
    const all = getFromStorage(STORAGE_KEYS.REPORTS);
    return all.filter(r => r.tenant_id === tenantId);
  },
  addReport: (tenantId, report) => {
    const all = getFromStorage(STORAGE_KEYS.REPORTS);
    const newReport = { 
      ...report, 
      id: `REP-${Date.now()}`, 
      tenant_id: tenantId, 
      status: 'Pending',
      createdAt: new Date().toISOString() 
    };
    saveToStorage(STORAGE_KEYS.REPORTS, [newReport, ...all]);
    return newReport;
  },
  updateReportStatus: (id, status) => {
    const all = getFromStorage(STORAGE_KEYS.REPORTS);
    const updated = all.map(r => r.id === id ? { ...r, status } : r);
    saveToStorage(STORAGE_KEYS.REPORTS, updated);
  },
  // Tenants (Multi-tenant)
  getTenants: () => getFromStorage(STORAGE_KEYS.TENANTS),
  addTenant: (tenant) => {
    const tenants = getFromStorage(STORAGE_KEYS.TENANTS);
    const newTenant = { 
      ...tenant, 
      id: Date.now().toString(), 
      createdAt: new Date().toISOString() 
    };
    saveToStorage(STORAGE_KEYS.TENANTS, [newTenant, ...tenants]);
    
    // Create Billing for the tenant
    const billing = getFromStorage(STORAGE_KEYS.BILLING);
    const now = new Date();
    const dueDateStr = `${newTenant.billing_day || 1}/${now.getMonth() + 1}/${now.getFullYear()}`;
    const newBill = { 
      id: `BILL-${newTenant.id}`, 
      rt_id: newTenant.id, 
      rt_name: newTenant.name, 
      rt_number: newTenant.rt_number, 
      village: newTenant.village, 
      phone: newTenant.phone, 
      amount: 'Rp 250.000', 
      dueDate: dueDateStr, 
      status: 'Belum Bayar', 
      daysOverdue: 0 
    };
    saveToStorage(STORAGE_KEYS.BILLING, [newBill, ...billing]);
    return newTenant;
  },
  updateTenant: (id, data) => {
    const tenants = getFromStorage(STORAGE_KEYS.TENANTS);
    const updated = tenants.map(t => t.id === id ? { ...t, ...data } : t);
    saveToStorage(STORAGE_KEYS.TENANTS, updated);
    
    // Sync with Billing
    const billing = getFromStorage(STORAGE_KEYS.BILLING);
    const updatedBilling = billing.map(b => b.rt_id === id ? { 
      ...b, 
      phone: data.phone, 
      rt_name: data.name, 
      rt_number: data.rt_number,
      village: data.village 
    } : b);
    saveToStorage(STORAGE_KEYS.BILLING, updatedBilling);
  },
  deleteTenant: (id) => {
    const tenants = getFromStorage(STORAGE_KEYS.TENANTS);
    saveToStorage(STORAGE_KEYS.TENANTS, tenants.filter(t => t.id !== id));
    const billing = getFromStorage(STORAGE_KEYS.BILLING);
    saveToStorage(STORAGE_KEYS.BILLING, billing.filter(b => b.rt_id !== id));
  },

  // Residents (Multi-tenant)
  getResidents: (tenantId) => {
    const all = getFromStorage(STORAGE_KEYS.RESIDENTS);
    return all.filter(r => r.tenant_id === tenantId);
  },
  addResident: (tenantId, resident) => {
    const all = getFromStorage(STORAGE_KEYS.RESIDENTS);
    const newResident = { 
      ...resident, 
      id: `RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tenant_id: tenantId,
      createdAt: new Date().toISOString() 
    };
    saveToStorage(STORAGE_KEYS.RESIDENTS, [newResident, ...all]);
    return newResident;
  },
  updateResident: (id, data) => {
    const all = getFromStorage(STORAGE_KEYS.RESIDENTS);
    const updated = all.map(r => r.id === id ? { ...r, ...data } : r);
    saveToStorage(STORAGE_KEYS.RESIDENTS, updated);
  },
  deleteResident: (id) => {
    const all = getFromStorage(STORAGE_KEYS.RESIDENTS);
    saveToStorage(STORAGE_KEYS.RESIDENTS, all.filter(r => r.id !== id));
  },

  // Dues Payments
  getDuesPayments: (tenantId, month, year) => {
    const all = getFromStorage(STORAGE_KEYS.DUES_PAYMENTS);
    return all.filter(p => p.tenant_id === tenantId && p.month === month && p.year === year);
  },
  payDues: (tenantId, paymentData) => {
    const all = getFromStorage(STORAGE_KEYS.DUES_PAYMENTS);
    const newPayment = {
      ...paymentData,
      id: `DUE-${Date.now()}`,
      tenant_id: tenantId,
      createdAt: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.DUES_PAYMENTS, [newPayment, ...all]);
    
    // Also auto-add to Finance Kas Log
    const transactions = getFromStorage(STORAGE_KEYS.FINANCE);
    const newTx = {
      id: `TX-${Date.now()}`,
      tenant_id: tenantId,
      title: `Iuran Bulanan - ${paymentData.resident_name} (${paymentData.month}/${paymentData.year})`,
      amount: paymentData.amount,
      type: 'income',
      category: 'Iuran Warga',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.FINANCE, [newTx, ...transactions]);
    
    return newPayment;
  },

  // Finance
  getTransactions: (tenantId) => {
    const all = getFromStorage(STORAGE_KEYS.FINANCE);
    return all.filter(t => t.tenant_id === tenantId);
  },
  addTransaction: (tenantId, transaction) => {
    const all = getFromStorage(STORAGE_KEYS.FINANCE);
    const newTx = { ...transaction, id: `TX-${Date.now()}`, tenant_id: tenantId, createdAt: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.FINANCE, [newTx, ...all]);
    return newTx;
  },

  // Settings
  getSettings: (tenantId) => {
    const all = getFromStorage(STORAGE_KEYS.SETTINGS, {});
    if (!all[tenantId]) {
      all[tenantId] = {
        income_categories: ['Iuran Warga', 'Donasi', 'Pemasukan Lainnya'],
        expense_categories: ['Kebersihan', 'Keamanan', 'Perbaikan', 'Operasional', 'Sosial'],
        monthly_due_amount: 50000,
        emergency_contacts: [
          { name: 'Ketua RT', phone: '0812-3456-XXXX' },
          { name: 'Keamanan (Pos)', phone: '0811-1234-XXXX' },
          { name: 'Ambulans', phone: '118 / 119' }
        ]
      };
      saveToStorage(STORAGE_KEYS.SETTINGS, all);
    }
    return all[tenantId];
  },
  updateSettings: (tenantId, settings) => {
    const all = getFromStorage(STORAGE_KEYS.SETTINGS, {});
    all[tenantId] = { ...all[tenantId], ...settings };
    saveToStorage(STORAGE_KEYS.SETTINGS, all);
    return all[tenantId];
  },

  // Support Tickets
  getTickets: () => getFromStorage(STORAGE_KEYS.TICKETS),
  addTicket: (ticket) => {
    const tickets = getFromStorage(STORAGE_KEYS.TICKETS);
    const newTicket = { 
      ...ticket, 
      id: ticket.id || `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 
      status: ticket.status || 'Pending', 
      createdAt: ticket.createdAt || new Date().toISOString() 
    };
    saveToStorage(STORAGE_KEYS.TICKETS, [newTicket, ...tickets]);
    return newTicket;
  },
  updateTicketStatus: (id, status) => {
    const tickets = getFromStorage(STORAGE_KEYS.TICKETS);
    const updated = tickets.map(t => t.id === id ? { ...t, status } : t);
    saveToStorage(STORAGE_KEYS.TICKETS, updated);
  },
  addTicketReply: (ticketId, reply) => {
    const tickets = getFromStorage(STORAGE_KEYS.TICKETS);
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return { 
          ...t, 
          replies: [...(t.replies || []), { ...reply, id: Date.now(), createdAt: new Date().toISOString() }],
          status: t.status === 'Pending' ? 'In Progress' : t.status
        };
      }
      return t;
    });
    saveToStorage(STORAGE_KEYS.TICKETS, updated);
  },

  // Announcements
  getAnnouncements: (tenantId) => {
    const all = getFromStorage(STORAGE_KEYS.ANNOUNCEMENTS);
    return all.filter(a => a.tenant_id === tenantId || tenantId === 'GLOBAL_SYSTEM');
  },
  addAnnouncement: (announcement) => {
    const all = getFromStorage(STORAGE_KEYS.ANNOUNCEMENTS);
    const newAnn = { ...announcement, id: Date.now().toString(), createdAt: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, [newAnn, ...all]);
    return newAnn;
  },

  // Letters
  getLetters: (tenantId) => {
    const all = getFromStorage(STORAGE_KEYS.LETTERS);
    return all.filter(l => l.tenant_id === tenantId);
  },
  addLetterRequest: (tenantId, request) => {
    const all = getFromStorage(STORAGE_KEYS.LETTERS);
    const newReq = { ...request, id: `LET-${Date.now()}`, tenant_id: tenantId, createdAt: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.LETTERS, [newReq, ...all]);
    return newReq;
  },
  updateLetterStatus: (id, status, data = {}) => {
    const all = getFromStorage(STORAGE_KEYS.LETTERS);
    const updated = all.map(l => l.id === id ? { ...l, status, ...data } : l);
    saveToStorage(STORAGE_KEYS.LETTERS, updated);
  },

  // Billing
  getBilling: () => getFromStorage(STORAGE_KEYS.BILLING),
  payBill: (billId) => {
    const billing = getFromStorage(STORAGE_KEYS.BILLING);
    const updated = billing.map(b => b.id === billId ? { ...b, status: 'Lunas', payDate: new Date().toLocaleDateString('id-ID') } : b);
    saveToStorage(STORAGE_KEYS.BILLING, updated);
  },

  // Users & Roles
  getUsers: (tenantId) => {
    const all = getFromStorage(STORAGE_KEYS.USERS);
    if (tenantId === 'GLOBAL_SYSTEM') return all;
    return all.filter(u => u.tenant_id === tenantId);
  },
  updateUserRole: (uid, newRole) => {
    const all = getFromStorage(STORAGE_KEYS.USERS);
    const updated = all.map(u => u.uid === uid ? { ...u, role: newRole } : u);
    saveToStorage(STORAGE_KEYS.USERS, updated);
    
    // Also update session if it's the current user
    const session = getFromStorage(STORAGE_KEYS.CURRENT_USER, null);
    if (session && session.uid === uid) {
      saveToStorage(STORAGE_KEYS.CURRENT_USER, { ...session, role: newRole });
    }
  },

  // Session Management
  saveSession: (user) => saveToStorage(STORAGE_KEYS.CURRENT_USER, user),
  getSession: () => getFromStorage(STORAGE_KEYS.CURRENT_USER, null),
  clearSession: () => localStorage.removeItem(STORAGE_KEYS.CURRENT_USER),
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    window.location.reload();
  }
};
