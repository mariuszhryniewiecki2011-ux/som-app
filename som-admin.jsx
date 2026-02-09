import { useState, useEffect } from "react";

// ============ DATA / STATE ============

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

const INITIAL_AGENTS = [
  { id: "AG001", name: "Kadek Wira", phone: "081234567890", ktp: "5171XXXX", area: "Denpasar", registered: "2026-02-09", sales: 12, balance: 0, codes: [] },
  { id: "AG002", name: "Putu Rai", phone: "087654321098", ktp: "5103XXXX", area: "Ubud", registered: "2026-02-10", sales: 8, balance: 0, codes: [] },
  { id: "AG003", name: "Wayan Sari", phone: "081345678901", ktp: "5108XXXX", area: "Kuta", registered: "2026-02-11", sales: 23, balance: 0, codes: [] },
];

const INITIAL_TRANSACTIONS = [
  { id: "TX001", agent: "AG001", type: "sale", amount: 100000, agentCut: 20000, ayuCut: 20000, cloudCut: 60000, date: "2026-02-09 14:30", user: "Budi", status: "settled" },
  { id: "TX002", agent: "AG003", type: "sale", amount: 100000, agentCut: 20000, ayuCut: 20000, cloudCut: 60000, date: "2026-02-09 15:10", user: "Sri", status: "settled" },
  { id: "TX003", agent: "AG001", type: "remit", amount: 80000, date: "2026-02-09 18:00", status: "received", note: "BCA transfer" },
  { id: "TX004", agent: "AG002", type: "sale", amount: 100000, agentCut: 20000, ayuCut: 20000, cloudCut: 60000, date: "2026-02-10 09:15", user: "Dewi", status: "pending" },
];

// ============ COLORS ============

const C = {
  bg: "#0A1628", card: "#132238", cardLight: "#1A2D47",
  accent: "#00C853", gold: "#FFB300", danger: "#FF5252",
  blue: "#448AFF", purple: "#AA00FF",
  text: "#E8ECF0", textDim: "#8899AA", textDark: "#5A6A7A",
  border: "#1E3550",
};

// ============ VIEWS ============

const VIEWS = {
  MASTER_DASH: "master_dash",
  AGENTS: "agents",
  ADD_AGENT: "add_agent",
  GENERATE: "generate",
  TRANSACTIONS: "transactions",
  AGENT_DASH: "agent_dash",
  AGENT_SELL: "agent_sell",
  PAYMENT_CHAIN: "payment_chain",
  REMIT: "remit",
};

// ============ COMPONENTS ============

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 20px", flex: 1, minWidth: 140 }}>
      <p style={{ fontSize: 12, color: C.textDim, margin: 0, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 900, color: color || C.accent, margin: "4px 0 0" }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: C.textDim, margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

function NavBtn({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: active ? C.accent + "22" : "transparent",
      border: active ? `1px solid ${C.accent}44` : `1px solid ${C.border}`,
      borderRadius: 12, padding: "12px 16px", cursor: "pointer",
      display: "flex", alignItems: "center", gap: 10, width: "100%",
      color: active ? C.accent : C.textDim, transition: "all 0.2s",
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: active ? 800 : 600 }}>{label}</span>
    </button>
  );
}

function Header({ title, subtitle, onBack }) {
  return (
    <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "none", border: "none", color: C.textDim, fontSize: 20, cursor: "pointer", padding: "4px 8px" }}>{"\u2190"}</button>
        )}
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: 0 }}>{title}</h1>
          {subtitle && <p style={{ fontSize: 13, color: C.textDim, margin: "2px 0 0" }}>{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function Badge({ text, color }) {
  return (
    <span style={{
      background: (color || C.accent) + "22",
      color: color || C.accent,
      padding: "3px 10px", borderRadius: 8,
      fontSize: 11, fontWeight: 800, textTransform: "uppercase",
    }}>{text}</span>
  );
}

// ============ PAYMENT CHAIN VISUAL ============

function PaymentChainView({ onBack }) {
  const nodes = [
    { label: "User", icon: "\u{1F464}", amount: "Rp 100.000", color: C.blue, desc: "Bayar ke Agen" },
    { label: "Agen", icon: "\u{1F6F5}", amount: "Rp 20.000", color: C.gold, desc: "Komisi agen (20%)" },
    { label: "Transfer BCA", icon: "\u{1F3E6}", amount: "Rp 80.000", color: C.textDim, desc: "Ke rekening Ayu" },
    { label: "Ayu (Master)", icon: "\u{1F451}", amount: "Rp 20.000", color: C.purple, desc: "Komisi master (20%)" },
    { label: "Cloud SNS", icon: "\u2601\uFE0F", amount: "Rp 60.000", color: C.accent, desc: "Revenue (60%)" },
  ];

  return (
    <div>
      <Header title="Payment Chain" subtitle="Alur uang per transaksi" onBack={onBack} />
      <div style={{ padding: 24 }}>
        {/* Flow diagram */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {nodes.map((node, i) => (
            <div key={i}>
              <div style={{
                background: C.card, border: `2px solid ${node.color}44`,
                borderRadius: 16, padding: "16px 20px",
                display: "flex", alignItems: "center", gap: 16,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: node.color + "22",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, flexShrink: 0,
                }}>{node.icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: 0 }}>{node.label}</p>
                  <p style={{ fontSize: 12, color: C.textDim, margin: "2px 0 0" }}>{node.desc}</p>
                </div>
                <p style={{ fontSize: 18, fontWeight: 900, color: node.color, margin: 0, whiteSpace: "nowrap" }}>{node.amount}</p>
              </div>
              {i < nodes.length - 1 && (
                <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
                  <div style={{ width: 2, height: 24, background: C.border }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Scale projections */}
        <div style={{ marginTop: 32 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: C.gold, marginBottom: 16 }}>{"\u{1F4CA}"} Proyeksi Skala</p>
          {[
            { users: "100", agent: "2jt", ayu: "2jt", cloud: "6jt" },
            { users: "1.000", agent: "20jt", ayu: "20jt", cloud: "60jt" },
            { users: "5.000", agent: "100jt", ayu: "100jt", cloud: "300jt" },
            { users: "10.000", agent: "200jt", ayu: "200jt", cloud: "600jt" },
          ].map((row, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
              background: i % 2 === 0 ? C.card : "transparent", borderRadius: 10,
              fontSize: 13,
            }}>
              <span style={{ color: C.text, fontWeight: 800, width: 70 }}>{row.users} user</span>
              <span style={{ color: C.gold, flex: 1, textAlign: "center" }}>{row.agent}</span>
              <span style={{ color: C.purple, flex: 1, textAlign: "center" }}>{row.ayu}</span>
              <span style={{ color: C.accent, flex: 1, textAlign: "center" }}>{row.cloud}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, padding: "8px 16px 0", fontSize: 11, color: C.textDark }}>
            <span style={{ width: 70 }}>/bulan</span>
            <span style={{ flex: 1, textAlign: "center" }}>Agen</span>
            <span style={{ flex: 1, textAlign: "center" }}>Ayu</span>
            <span style={{ flex: 1, textAlign: "center" }}>Cloud SNS</span>
          </div>
        </div>

        {/* Beer fund */}
        <div style={{
          marginTop: 24, padding: 16, background: C.gold + "15",
          border: `1px solid ${C.gold}33`, borderRadius: 16,
          textAlign: "center",
        }}>
          <p style={{ fontSize: 14, color: C.gold, margin: 0 }}>
            {"\u{1F37B}"} Bar fund at 5K users: Rp 100jt/bulan for Ayu. Considerable.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============ MASTER DASHBOARD (AYU) ============

function MasterDashboard({ agents, transactions, onNavigate }) {
  const totalSales = transactions.filter(t => t.type === "sale").length;
  const totalRevenue = totalSales * 100000;
  const ayuEarnings = totalSales * 20000;
  const pendingRemit = transactions.filter(t => t.type === "sale" && t.status === "pending").length * 80000;
  const activeUsers = totalSales; // simplified

  return (
    <div>
      <div style={{ padding: "20px 24px 12px", background: C.card, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: C.purple + "22", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 24,
          }}>{"\u{1F451}"}</div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: 0 }}>Dashboard Ayu</h1>
            <p style={{ fontSize: 13, color: C.purple, margin: 0 }}>Master Distributor {"\u2014"} Bali</p>
          </div>
        </div>
      </div>

      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <StatCard label="Total Sales" value={totalSales} color={C.accent} />
          <StatCard label="Agen Aktif" value={agents.length} color={C.blue} />
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <StatCard label="Pendapatan Ayu" value={`Rp ${(ayuEarnings/1000).toFixed(0)}rb`} color={C.purple} />
          <StatCard label="Belum Ditagih" value={`Rp ${(pendingRemit/1000).toFixed(0)}rb`} color={C.danger} />
        </div>

        {/* Quick actions */}
        <p style={{ fontSize: 14, fontWeight: 800, color: C.textDim, margin: "8px 0 0", textTransform: "uppercase", letterSpacing: 1 }}>Aksi Cepat</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <NavBtn icon={"\u{1F511}"} label="Generate Kode Aktivasi" onClick={() => onNavigate(VIEWS.GENERATE)} />
          <NavBtn icon={"\u{1F465}"} label="Kelola Agen" onClick={() => onNavigate(VIEWS.AGENTS)} />
          <NavBtn icon={"\u{1F4B3}"} label="Transaksi & Pembayaran" onClick={() => onNavigate(VIEWS.TRANSACTIONS)} />
          <NavBtn icon={"\u{1F517}"} label="Lihat Payment Chain" onClick={() => onNavigate(VIEWS.PAYMENT_CHAIN)} />
          <NavBtn icon={"\u{1F4B0}"} label="Kirim ke Cloud SNS" onClick={() => onNavigate(VIEWS.REMIT)} />
        </div>

        {/* Recent activity */}
        <p style={{ fontSize: 14, fontWeight: 800, color: C.textDim, margin: "8px 0 0", textTransform: "uppercase", letterSpacing: 1 }}>Aktivitas Terakhir</p>
        {transactions.slice(0, 3).map((tx, i) => (
          <div key={i} style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "12px 16px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 20 }}>{tx.type === "sale" ? "\u{1F4B5}" : "\u{1F3E6}"}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>
                {tx.type === "sale" ? `${tx.user} via ${agents.find(a => a.id === tx.agent)?.name || tx.agent}` : `Remit ${agents.find(a => a.id === tx.agent)?.name || tx.agent}`}
              </p>
              <p style={{ fontSize: 11, color: C.textDark, margin: "2px 0 0" }}>{tx.date}</p>
            </div>
            <Badge text={tx.status} color={tx.status === "settled" ? C.accent : tx.status === "pending" ? C.gold : C.blue} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ AGENT LIST ============

function AgentList({ agents, onBack, onAdd }) {
  return (
    <div>
      <Header title="Agen SOM" subtitle={`${agents.length} agen terdaftar`} onBack={onBack} />
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={onAdd} style={{
          background: C.accent, color: "#000", border: "none",
          borderRadius: 14, padding: "14px 20px", fontSize: 15,
          fontWeight: 800, cursor: "pointer", width: "100%",
          boxShadow: "0 4px 20px rgba(0,200,83,0.3)",
        }}>+ Daftar Agen Baru</button>

        {agents.map((agent, i) => (
          <div key={i} style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 16, padding: "16px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: C.blue + "22", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 18, color: C.blue, fontWeight: 900,
              }}>{agent.name.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: 0 }}>{agent.name}</p>
                <p style={{ fontSize: 12, color: C.textDim, margin: "2px 0 0" }}>{agent.area} {"\u2022"} {agent.phone}</p>
              </div>
              <Badge text={`${agent.sales} sales`} color={C.accent} />
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 12, color: C.textDim }}>
              <span>ID: {agent.id}</span>
              <span>{"\u2022"}</span>
              <span>KTP: {agent.ktp}</span>
              <span>{"\u2022"}</span>
              <span>Sejak: {agent.registered}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ ADD AGENT ============

function AddAgent({ onBack, onAdd }) {
  const [form, setForm] = useState({ name: "", phone: "", ktp: "", area: "" });
  const [photo, setPhoto] = useState(false);

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.ktp || !form.area) return;
    onAdd({
      id: `AG${String(Math.floor(Math.random() * 900) + 100)}`,
      ...form,
      registered: new Date().toISOString().split("T")[0],
      sales: 0, balance: 0, codes: [],
    });
  };

  const inputStyle = {
    background: C.cardLight, color: C.text,
    border: `2px solid ${C.border}`, borderRadius: 12,
    padding: "14px 16px", fontSize: 15, width: "100%",
    boxSizing: "border-box", outline: "none",
    fontFamily: "inherit",
  };

  return (
    <div>
      <Header title="Daftar Agen Baru" subtitle="KTP + Foto + Licence to Kill" onBack={onBack} />
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Nama Lengkap (KTP)</label>
          <input style={inputStyle} placeholder="Nama sesuai KTP" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>No. HP (WhatsApp)</label>
          <input style={inputStyle} placeholder="08xxxxxxxxxx" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>No. KTP</label>
          <input style={inputStyle} placeholder="Nomor KTP 16 digit" value={form.ktp} onChange={e => setForm({ ...form, ktp: e.target.value })} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Area Jualan</label>
          <input style={inputStyle} placeholder="Denpasar, Ubud, Kuta..." value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} />
        </div>

        {/* Photo capture */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Foto KTP + Selfie</label>
          <button onClick={() => setPhoto(true)} style={{
            background: photo ? C.accent + "22" : C.cardLight,
            border: `2px dashed ${photo ? C.accent : C.border}`,
            borderRadius: 12, padding: 24, width: "100%",
            cursor: "pointer", color: photo ? C.accent : C.textDim,
            fontSize: 14, fontWeight: 700,
          }}>
            {photo ? "\u2713 Foto terupload" : "\u{1F4F7} Ambil Foto KTP + Selfie"}
          </button>
        </div>

        <button onClick={handleSubmit} style={{
          background: (form.name && form.phone && form.ktp && form.area) ? C.accent : C.textDark,
          color: "#000", border: "none", borderRadius: 14,
          padding: "16px 20px", fontSize: 16, fontWeight: 800,
          cursor: "pointer", width: "100%", marginTop: 8,
          boxShadow: "0 4px 20px rgba(0,200,83,0.3)",
        }}>
          Daftarkan Agen {"\u{1F91D}"}
        </button>

        <div style={{ padding: 16, background: C.card, borderRadius: 12, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6, margin: 0 }}>
            <span style={{ color: C.gold }}>{"\u{1F4A1}"}</span> Agen mendapat Rp 20.000 per aktivasi. Tidak ada target minimal. Jual sebanyak-banyaknya!
          </p>
        </div>
      </div>
    </div>
  );
}

// ============ GENERATE CODES ============

function GenerateCodes({ agents, onBack }) {
  const [selectedAgent, setSelectedAgent] = useState("");
  const [count, setCount] = useState(5);
  const [codes, setCodes] = useState([]);
  const [generated, setGenerated] = useState(false);

  const generate = () => {
    const newCodes = Array.from({ length: count }, (_, i) => ({
      code: generateOTP(),
      agent: selectedAgent,
      created: new Date().toISOString(),
      status: "active",
    }));
    setCodes(newCodes);
    setGenerated(true);
  };

  return (
    <div>
      <Header title="Generate Kode" subtitle="Buat kode aktivasi untuk agen" onBack={onBack} />
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {!generated ? (
          <>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Pilih Agen</label>
              <select
                value={selectedAgent}
                onChange={e => setSelectedAgent(e.target.value)}
                style={{
                  background: C.cardLight, color: C.text,
                  border: `2px solid ${C.border}`, borderRadius: 12,
                  padding: "14px 16px", fontSize: 15, width: "100%",
                  boxSizing: "border-box", outline: "none",
                }}
              >
                <option value="">-- Pilih agen --</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.area})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Jumlah Kode</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[5, 10, 20, 50].map(n => (
                  <button key={n} onClick={() => setCount(n)} style={{
                    background: count === n ? C.accent + "22" : C.cardLight,
                    border: `2px solid ${count === n ? C.accent : C.border}`,
                    borderRadius: 10, padding: "12px 20px",
                    color: count === n ? C.accent : C.textDim,
                    fontSize: 16, fontWeight: 800, cursor: "pointer", flex: 1,
                  }}>{n}</button>
                ))}
              </div>
            </div>

            {/* Cost summary */}
            <div style={{ background: C.card, borderRadius: 16, padding: 20, border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 13, color: C.textDim, margin: "0 0 8px" }}>Ringkasan:</p>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 14, color: C.text }}>{count} kode {"\u00D7"} Rp 100.000</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.accent }}>Rp {(count * 100000).toLocaleString("id-ID")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: C.textDim }}>Komisi agen ({count} {"\u00D7"} Rp 20rb)</span>
                <span style={{ fontSize: 13, color: C.gold }}>Rp {(count * 20000).toLocaleString("id-ID")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: C.textDim }}>Masuk ke Ayu ({count} {"\u00D7"} Rp 20rb)</span>
                <span style={{ fontSize: 13, color: C.purple }}>Rp {(count * 20000).toLocaleString("id-ID")}</span>
              </div>
              <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: C.textDim }}>Ke Cloud SNS ({count} {"\u00D7"} Rp 60rb)</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.accent }}>Rp {(count * 60000).toLocaleString("id-ID")}</span>
              </div>
            </div>

            <button onClick={generate} disabled={!selectedAgent} style={{
              background: selectedAgent ? C.accent : C.textDark,
              color: "#000", border: "none", borderRadius: 14,
              padding: "16px 20px", fontSize: 16, fontWeight: 800,
              cursor: selectedAgent ? "pointer" : "default", width: "100%",
              boxShadow: selectedAgent ? "0 4px 20px rgba(0,200,83,0.3)" : "none",
            }}>Generate {count} Kode {"\u{1F511}"}</button>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <p style={{ fontSize: 48, margin: "0 0 8px" }}>{"\u2705"}</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: C.accent }}>
                {codes.length} Kode Berhasil Dibuat!
              </p>
              <p style={{ fontSize: 13, color: C.textDim }}>
                Untuk: {agents.find(a => a.id === selectedAgent)?.name}
              </p>
            </div>

            <div style={{ background: C.card, borderRadius: 16, padding: 16, border: `1px solid ${C.border}` }}>
              {codes.map((c, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0",
                  borderBottom: i < codes.length - 1 ? `1px solid ${C.border}` : "none",
                }}>
                  <span style={{
                    fontSize: 22, fontWeight: 900, fontFamily: "monospace",
                    color: C.accent, letterSpacing: 4,
                  }}>{c.code}</span>
                  <Badge text="Aktif" color={C.accent} />
                </div>
              ))}
            </div>

            <button onClick={() => {
              const text = codes.map(c => c.code).join("\n");
              if (navigator.clipboard) navigator.clipboard.writeText(text);
            }} style={{
              background: C.blue, color: C.text, border: "none",
              borderRadius: 14, padding: "14px 20px", fontSize: 15,
              fontWeight: 800, cursor: "pointer", width: "100%",
            }}>
              {"\u{1F4CB}"} Copy Semua Kode
            </button>

            <p style={{ fontSize: 12, color: C.textDim, textAlign: "center" }}>
              Kirim kode ke agen via WhatsApp. Agen berikan ke user saat aktivasi.
            </p>

            <button onClick={() => { setGenerated(false); setCodes([]); }} style={{
              background: "transparent", color: C.textDim,
              border: `1px solid ${C.border}`, borderRadius: 14,
              padding: "12px 20px", fontSize: 14, fontWeight: 700,
              cursor: "pointer", width: "100%",
            }}>Generate Lagi</button>
          </>
        )}
      </div>
    </div>
  );
}

// ============ TRANSACTIONS ============

function TransactionList({ transactions, agents, onBack }) {
  const sales = transactions.filter(t => t.type === "sale");
  const pending = sales.filter(t => t.status === "pending");

  return (
    <div>
      <Header title="Transaksi" subtitle={`${sales.length} penjualan, ${pending.length} belum ditagih`} onBack={onBack} />
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {transactions.map((tx, i) => (
          <div key={i} style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: "14px 18px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{tx.type === "sale" ? "\u{1F4B5}" : "\u{1F3E6}"}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>
                    {tx.type === "sale" ? `Aktivasi: ${tx.user}` : "Remit ke BCA"}
                  </p>
                  <p style={{ fontSize: 11, color: C.textDark, margin: "2px 0 0" }}>
                    {agents.find(a => a.id === tx.agent)?.name} {"\u2022"} {tx.date}
                  </p>
                </div>
              </div>
              <Badge text={tx.status} color={tx.status === "settled" ? C.accent : tx.status === "pending" ? C.gold : C.blue} />
            </div>
            {tx.type === "sale" && (
              <div style={{ display: "flex", gap: 12, fontSize: 12, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                <span style={{ color: C.gold }}>Agen: Rp {(tx.agentCut / 1000)}rb</span>
                <span style={{ color: C.purple }}>Ayu: Rp {(tx.ayuCut / 1000)}rb</span>
                <span style={{ color: C.accent }}>Cloud: Rp {(tx.cloudCut / 1000)}rb</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ REMIT TO CLOUD SNS ============

function RemitView({ transactions, onBack }) {
  const sales = transactions.filter(t => t.type === "sale");
  const totalCloud = sales.length * 60000;
  const remitted = transactions.filter(t => t.type === "remit").length * 60000;
  const outstanding = totalCloud - remitted;

  return (
    <div>
      <Header title="Kirim ke Cloud SNS" subtitle="Transfer bulanan ke Perth" onBack={onBack} />
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <StatCard label="Total Cloud SNS" value={`Rp ${(totalCloud/1000).toFixed(0)}rb`} color={C.accent} />
          <StatCard label="Outstanding" value={`Rp ${(outstanding/1000).toFixed(0)}rb`} color={C.danger} />
        </div>

        <div style={{ background: C.card, borderRadius: 16, padding: 20, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: "0 0 12px" }}>Transfer Details</p>
          <div style={{ fontSize: 13, color: C.textDim, lineHeight: 2 }}>
            <p style={{ margin: 0 }}><strong style={{ color: C.text }}>Bank:</strong> Wise / International Transfer</p>
            <p style={{ margin: 0 }}><strong style={{ color: C.text }}>Account:</strong> Cloud SNS Pty Ltd</p>
            <p style={{ margin: 0 }}><strong style={{ color: C.text }}>BSB:</strong> (provided separately)</p>
            <p style={{ margin: 0 }}><strong style={{ color: C.text }}>Ref:</strong> SOM-BALI-{new Date().toISOString().slice(0, 7)}</p>
          </div>
        </div>

        <button style={{
          background: outstanding > 0 ? C.accent : C.textDark,
          color: "#000", border: "none", borderRadius: 14,
          padding: "16px 20px", fontSize: 16, fontWeight: 800,
          cursor: "pointer", width: "100%",
          boxShadow: "0 4px 20px rgba(0,200,83,0.3)",
        }}>
          Tandai Sudah Transfer Rp {(outstanding / 1000).toFixed(0)}rb
        </button>
      </div>
    </div>
  );
}

// ============ MAIN APP ============

export default function SOMAdmin() {
  const [view, setView] = useState(VIEWS.MASTER_DASH);
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [mode, setMode] = useState("master"); // master or agent

  const addAgent = (agent) => {
    setAgents(prev => [...prev, agent]);
    setView(VIEWS.AGENTS);
  };

  return (
    <div style={{
      width: "100%", maxWidth: 480, margin: "0 auto",
      minHeight: "100vh", background: C.bg,
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      color: C.text,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; background: ${C.bg}; }
        select { appearance: none; }
        select option { background: ${C.cardLight}; color: ${C.text}; }
        input:focus, select:focus { border-color: ${C.accent} !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
      `}</style>

      {/* Mode toggle */}
      <div style={{
        display: "flex", padding: "12px 20px", gap: 8,
        background: C.card, borderBottom: `1px solid ${C.border}`,
        position: "sticky", top: 0, zIndex: 20,
      }}>
        <button onClick={() => { setMode("master"); setView(VIEWS.MASTER_DASH); }} style={{
          flex: 1, padding: "10px 0", borderRadius: 10,
          background: mode === "master" ? C.purple + "22" : "transparent",
          border: `1px solid ${mode === "master" ? C.purple + "44" : C.border}`,
          color: mode === "master" ? C.purple : C.textDim,
          fontSize: 13, fontWeight: 800, cursor: "pointer",
        }}>{"\u{1F451}"} Master (Ayu)</button>
        <button onClick={() => { setMode("agent"); setView(VIEWS.AGENT_DASH); }} style={{
          flex: 1, padding: "10px 0", borderRadius: 10,
          background: mode === "agent" ? C.blue + "22" : "transparent",
          border: `1px solid ${mode === "agent" ? C.blue + "44" : C.border}`,
          color: mode === "agent" ? C.blue : C.textDim,
          fontSize: 13, fontWeight: 800, cursor: "pointer",
        }}>{"\u{1F6F5}"} Agen View</button>
      </div>

      {/* Views */}
      {view === VIEWS.MASTER_DASH && <MasterDashboard agents={agents} transactions={transactions} onNavigate={setView} />}
      {view === VIEWS.AGENTS && <AgentList agents={agents} onBack={() => setView(VIEWS.MASTER_DASH)} onAdd={() => setView(VIEWS.ADD_AGENT)} />}
      {view === VIEWS.ADD_AGENT && <AddAgent onBack={() => setView(VIEWS.AGENTS)} onAdd={addAgent} />}
      {view === VIEWS.GENERATE && <GenerateCodes agents={agents} onBack={() => setView(VIEWS.MASTER_DASH)} />}
      {view === VIEWS.TRANSACTIONS && <TransactionList transactions={transactions} agents={agents} onBack={() => setView(VIEWS.MASTER_DASH)} />}
      {view === VIEWS.PAYMENT_CHAIN && <PaymentChainView onBack={() => setView(VIEWS.MASTER_DASH)} />}
      {view === VIEWS.REMIT && <RemitView transactions={transactions} onBack={() => setView(VIEWS.MASTER_DASH)} />}
      {view === VIEWS.AGENT_DASH && (
        <div>
          <Header title="Dashboard Agen" subtitle="Kadek Wira — Denpasar" />
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <StatCard label="Kode Tersedia" value="8" color={C.accent} />
              <StatCard label="Terjual" value="12" color={C.gold} />
            </div>
            <StatCard label="Komisi Bulan Ini" value="Rp 240rb" sub="12 × Rp 20.000" color={C.gold} />

            <button onClick={() => setView(VIEWS.AGENT_SELL)} style={{
              background: C.accent, color: "#000", border: "none",
              borderRadius: 14, padding: "16px 20px", fontSize: 16,
              fontWeight: 800, cursor: "pointer", width: "100%",
              boxShadow: "0 4px 20px rgba(0,200,83,0.3)",
            }}>Jual SOM Sekarang! {"\u{1F91D}"}</button>

            <div style={{ background: C.card, borderRadius: 16, padding: 20, border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: "0 0 8px" }}>Kode Aktif</p>
              {["847291", "593017", "261845", "739504", "182736"].map((code, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", padding: "8px 0",
                  borderBottom: i < 4 ? `1px solid ${C.border}` : "none",
                }}>
                  <span style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 800, color: C.accent, letterSpacing: 3 }}>{code}</span>
                  <Badge text="Aktif" color={C.accent} />
                </div>
              ))}
            </div>

            <div style={{ padding: 16, background: C.gold + "15", border: `1px solid ${C.gold}33`, borderRadius: 16 }}>
              <p style={{ fontSize: 13, color: C.gold, margin: 0, lineHeight: 1.5 }}>
                {"\u{1F4A1}"} Tips: Jualan di warung kopi, tempat nongkrong, dan pos ojol. Satu orang beli = Rp 20rb komisi langsung.
              </p>
            </div>
          </div>
        </div>
      )}
      {view === VIEWS.AGENT_SELL && (
        <div>
          <Header title="Jual SOM" subtitle="Tunjukkan ke pembeli" onBack={() => setView(VIEWS.AGENT_DASH)} />
          <div style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div style={{ fontSize: 64, marginBottom: 8 }}>{"\u{1F91D}"}</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: C.accent, textAlign: "center" }}>SOM</h2>
            <p style={{ fontSize: 15, color: C.textDim, textAlign: "center", maxWidth: 280 }}>
              Teman pintar di HP kamu. Bantu atur uang & hindari penipu.
            </p>
            <div style={{
              background: C.card, borderRadius: 20, padding: 24,
              border: `2px solid ${C.accent}44`, width: "100%", textAlign: "center",
            }}>
              <p style={{ fontSize: 13, color: C.textDim, margin: "0 0 8px" }}>Kode Aktivasi:</p>
              <p style={{
                fontSize: 42, fontWeight: 900, fontFamily: "monospace",
                color: C.accent, letterSpacing: 8, margin: "0 0 8px",
                textShadow: "0 2px 20px rgba(0,200,83,0.3)",
              }}>847291</p>
              <p style={{ fontSize: 13, color: C.textDim }}>Buka di HP: <strong style={{ color: C.accent }}>som-app.vercel.app</strong></p>
            </div>
            <div style={{
              display: "inline-flex", alignItems: "baseline", gap: 4,
              background: C.accent + "15", padding: "12px 24px", borderRadius: 14,
            }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: C.accent }}>Rp 100.000</span>
              <span style={{ fontSize: 15, color: C.textDim }}>/bulan</span>
            </div>
            <button style={{
              background: C.accent, color: "#000", border: "none",
              borderRadius: 14, padding: "16px 32px", fontSize: 16,
              fontWeight: 800, cursor: "pointer", width: "100%",
              boxShadow: "0 4px 20px rgba(0,200,83,0.3)",
            }}>
              {"\u2705"} Kode Terjual — Tandai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
