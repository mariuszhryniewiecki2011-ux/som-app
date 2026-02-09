import { useState, useEffect, useRef } from "react";

const SCREENS = { SPLASH: 0, ACTIVATE: 1, NICKNAME: 2, CHAT: 3, MENU: 4, FRAUD: 5 };

// Fraud database - common Indonesian scams
const FRAUD_DB = [
  { title: "Mama Minta Pulsa", desc: "SMS dari nomor tidak dikenal: 'Nak, tolong isi pulsa Mama.' Jangan transfer! Telepon langsung ke nomor Mama yang asli.", icon: "📱" },
  { title: "Pinjol Ilegal", desc: "Pinjaman online yang minta akses kontak & foto. Mereka akan teror semua kontakmu. Cek OJK sebelum pinjam!", icon: "🦈" },
  { title: "Loker Palsu", desc: "Lowongan kerja minta transfer uang untuk 'seragam' atau 'training'. Kerja yang bener TIDAK pernah minta uang di depan.", icon: "💼" },
  { title: "Undian Berhadiah", desc: "WhatsApp bilang kamu menang mobil/HP. Minta transfer pajak hadiah. PALSU. Hapus langsung.", icon: "🎰" },
  { title: "Investasi Bodong", desc: "Janji untung 10-50% per bulan? PASTI TIPU. Uang dari orang baru bayar orang lama. Kamu yang terakhir = rugi.", icon: "📈" },
  { title: "Penipuan COD", desc: "Paket COD yang tidak kamu pesan. Jangan bayar! Tolak paket, hubungi marketplace resmi.", icon: "📦" },
  { title: "Arisan Online", desc: "Arisan WhatsApp dengan orang tidak dikenal. Bandar kabur setelah kumpul uang. Arisan hanya dengan orang yang kamu kenal langsung.", icon: "💸" },
  { title: "Modus Salah Transfer", desc: "'Kak, saya salah transfer ke rekening kamu, tolong balikin.' Jangan transfer balik — ini modus. Lapor ke bank.", icon: "🏦" },
];

// Quick tips for daily survival
const TIPS = [
  "Gaji masuk? Langsung pisahkan: sewa, makan, transport. Sisanya baru boleh dipakai.",
  "Sebelum beli, tanya: 'Butuh atau mau?' Kalau cuma mau — tunggu 3 hari. Masih mau? Baru beli.",
  "Catat semua pengeluaran. Tulis di notes HP. Setiap malam review. Kamu akan kaget berapa yang habis.",
  "Jangan malu bawa bekal. Nasi dari rumah Rp 3.000. Nasi bungkus Rp 15.000. Sebulan hemat Rp 360.000.",
  "Cicilan motor terlalu berat? Hitung total: harga cash vs kredit. Biasanya 2x lipat. Pikir lagi.",
  "Darurat = hanya sakit, kecelakaan, kehilangan kerja. Bukan HP baru. Bukan baju lebaran.",
  "Punya utang? Bayar yang bunga tertinggi dulu. Pinjol > kartu kredit > teman > keluarga.",
];

// Simulated chat responses
const AI_RESPONSES = {
  greeting: "Hai {name}! Aku SOM, sahabatmu. Cerita aja, mau curhat soal apa hari ini?",
  money: "Gaji {name} berapa sebulan? Kita bikin rencana bareng. Nggak usah malu, di sini aman.",
  scam: "Wah, hati-hati! Coba ceritain lebih detail. Aku bantu cek apakah ini penipuan.",
  debt: "Utang memang berat. Tapi bisa diatur. Pertama: tulis semua utang, berapa, ke siapa, bunga berapa. Kita susun strategi bareng.",
  sad: "Aku dengar kamu. Hidup memang berat kadang. Tapi kamu sudah kuat sampai di sini. Mau cerita lebih?",
  default: "Aku ngerti. Cerita terus, aku dengerin. Kita cari jalan keluarnya bareng-bareng.",
};

function getResponse(text, name) {
  const lower = text.toLowerCase();
  let response;
  if (lower.includes("gaji") || lower.includes("uang") || lower.includes("bayar")) {
    response = AI_RESPONSES.money;
  } else if (lower.includes("tipu") || lower.includes("penipu") || lower.includes("scam") || lower.includes("transfer")) {
    response = AI_RESPONSES.scam;
  } else if (lower.includes("utang") || lower.includes("pinjam") || lower.includes("cicilan") || lower.includes("pinjol")) {
    response = AI_RESPONSES.debt;
  } else if (lower.includes("capek") || lower.includes("sedih") || lower.includes("lelah") || lower.includes("susah")) {
    response = AI_RESPONSES.sad;
  } else {
    response = AI_RESPONSES.default;
  }
  return response.replace("{name}", name);
}

// Color palette - warm, street, Indonesian
const C = {
  bg: "#0A1628",
  card: "#132238",
  cardLight: "#1A2D47",
  accent: "#00C853",
  accentDim: "#00963E",
  gold: "#FFB300",
  danger: "#FF5252",
  text: "#E8ECF0",
  textDim: "#8899AA",
  textDark: "#5A6A7A",
  white: "#FFFFFF",
  chatUser: "#1B5E20",
  chatBot: "#1A2D47",
  border: "#1E3550",
};

const styles = {
  app: { width: "100%", maxWidth: 420, margin: "0 auto", minHeight: "100vh", background: C.bg, fontFamily: "'Nunito', 'Segoe UI', sans-serif", color: C.text, position: "relative", overflow: "hidden" },
  
  // Splash
  splash: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", padding: 32, textAlign: "center", background: `linear-gradient(170deg, ${C.bg} 0%, #0D2137 50%, #0A1628 100%)` },
  splashIcon: { fontSize: 72, marginBottom: 16, filter: "drop-shadow(0 4px 20px rgba(0,200,83,0.3))" },
  splashTitle: { fontSize: 36, fontWeight: 900, color: C.accent, letterSpacing: -1, margin: 0, textShadow: "0 2px 20px rgba(0,200,83,0.25)" },
  splashSub: { fontSize: 15, color: C.textDim, marginTop: 8, lineHeight: 1.5, maxWidth: 280 },
  splashTagline: { fontSize: 13, color: C.gold, marginTop: 24, fontStyle: "italic", letterSpacing: 0.5 },
  
  // Button
  btn: { background: C.accent, color: "#000", border: "none", borderRadius: 14, padding: "16px 32px", fontSize: 16, fontWeight: 800, cursor: "pointer", width: "100%", maxWidth: 300, marginTop: 32, letterSpacing: 0.5, transition: "all 0.2s", boxShadow: "0 4px 20px rgba(0,200,83,0.3)" },
  btnOutline: { background: "transparent", color: C.accent, border: `2px solid ${C.accent}`, borderRadius: 14, padding: "14px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", maxWidth: 300, marginTop: 12, letterSpacing: 0.5 },
  btnDanger: { background: C.danger, color: C.white, border: "none", borderRadius: 14, padding: "14px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", marginTop: 12, boxShadow: "0 4px 16px rgba(255,82,82,0.3)" },
  btnGold: { background: C.gold, color: "#000", border: "none", borderRadius: 14, padding: "14px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(255,179,0,0.3)" },
  
  // Input
  input: { background: C.cardLight, color: C.text, border: `2px solid ${C.border}`, borderRadius: 14, padding: "16px 20px", fontSize: 16, width: "100%", boxSizing: "border-box", outline: "none", transition: "border 0.2s" },
  
  // Header
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: C.card, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 10 },
  headerTitle: { fontSize: 18, fontWeight: 800, color: C.accent, margin: 0, display: "flex", alignItems: "center", gap: 8 },
  headerBtn: { background: "none", border: "none", color: C.textDim, fontSize: 22, cursor: "pointer", padding: 8 },
  
  // Chat
  chatArea: { flex: 1, overflowY: "auto", padding: "16px 16px 100px", display: "flex", flexDirection: "column", gap: 10 },
  msgRow: (isUser) => ({ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }),
  msgBubble: (isUser) => ({ background: isUser ? C.chatUser : C.chatBot, color: C.text, padding: "12px 16px", borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px", maxWidth: "80%", fontSize: 14.5, lineHeight: 1.55, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", border: isUser ? "none" : `1px solid ${C.border}` }),
  msgTime: { fontSize: 11, color: C.textDark, marginTop: 4 },
  
  // Input bar
  inputBar: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 420, padding: "12px 16px 24px", background: `linear-gradient(transparent, ${C.bg} 20%)`, display: "flex", gap: 10, alignItems: "center", boxSizing: "border-box" },
  chatInput: { flex: 1, background: C.cardLight, color: C.text, border: `1.5px solid ${C.border}`, borderRadius: 24, padding: "14px 20px", fontSize: 15, outline: "none" },
  sendBtn: { background: C.accent, border: "none", borderRadius: "50%", width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,200,83,0.3)" },
  
  // Menu
  menuItem: { display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", background: C.card, borderRadius: 16, cursor: "pointer", border: `1px solid ${C.border}`, transition: "all 0.2s" },
  menuIcon: { fontSize: 28, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", background: C.cardLight, borderRadius: 14, flexShrink: 0 },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: 700, color: C.text, margin: 0 },
  menuDesc: { fontSize: 12.5, color: C.textDim, margin: "4px 0 0" },
  
  // Fraud cards
  fraudCard: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 12 },
  fraudIcon: { fontSize: 32, marginBottom: 8 },
  fraudTitle: { fontSize: 16, fontWeight: 800, color: C.danger, margin: "0 0 8px" },
  fraudDesc: { fontSize: 14, color: C.textDim, lineHeight: 1.55, margin: 0 },
  
  // Tip banner
  tipBanner: { background: `linear-gradient(135deg, ${C.cardLight}, ${C.card})`, border: `1px solid ${C.gold}33`, borderRadius: 16, padding: 16, margin: "0 16px 12px", display: "flex", gap: 12, alignItems: "flex-start" },
  tipIcon: { fontSize: 20, flexShrink: 0, marginTop: 2 },
  tipText: { fontSize: 13, color: C.gold, lineHeight: 1.5, margin: 0, fontStyle: "italic" },
  
  // Status bar
  statusBar: { padding: "6px 20px", background: C.accentDim + "22", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.accent },
  statusDot: { width: 6, height: 6, borderRadius: "50%", background: C.accent, animation: "pulse 2s infinite" },
  
  // Seller screen elements
  label: { fontSize: 13, fontWeight: 700, color: C.textDim, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" },
  otpDisplay: { fontSize: 36, fontWeight: 900, letterSpacing: 8, color: C.accent, textAlign: "center", padding: "20px 0", fontFamily: "monospace", textShadow: "0 2px 20px rgba(0,200,83,0.3)" },
  priceTag: { display: "inline-flex", alignItems: "baseline", gap: 4, background: C.accent + "15", padding: "8px 16px", borderRadius: 10, marginTop: 8 },
  priceAmount: { fontSize: 24, fontWeight: 900, color: C.accent },
  pricePeriod: { fontSize: 13, color: C.textDim },
};

// Pulse animation via style tag
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { margin: 0; background: ${C.bg}; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
    .fade-up { animation: fadeUp 0.4s ease-out forwards; }
    .slide-in { animation: slideIn 0.3s ease-out forwards; }
    input:focus { border-color: ${C.accent} !important; }
    button:active { transform: scale(0.97); }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
  `}</style>
);

// ====== SCREENS ======

function SplashScreen({ onStart }) {
  return (
    <div style={styles.splash}>
      <div style={styles.splashIcon}>🤝</div>
      <h1 style={styles.splashTitle}>SOM</h1>
      <p style={{ fontSize: 17, color: C.text, marginTop: 4, fontWeight: 700 }}>Sahabat Orang Miskin</p>
      <p style={styles.splashSub}>Teman pintar di sakumu. Bantu atur uang, hindari penipu, dan jalani hidup lebih baik.</p>
      <p style={styles.splashTagline}>💚 Karena semua orang berhak punya sahabat yang peduli</p>
      <button style={styles.btn} onClick={onStart}>Mulai Sekarang</button>
      <div style={{ ...styles.priceTag, marginTop: 24 }}>
        <span style={styles.priceAmount}>Rp 100.000</span>
        <span style={styles.pricePeriod}>/bulan</span>
      </div>
    </div>
  );
}

function ActivateScreen({ onActivate }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  
  const handleActivate = () => {
    if (otp.length === 6) {
      onActivate();
    } else {
      setError("Kode OTP harus 6 angka");
    }
  };
  
  return (
    <div style={{ padding: 32, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh" }}>
      <div className="fade-up">
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔑</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 8 }}>Aktivasi SOM</h2>
        <p style={{ fontSize: 14, color: C.textDim, marginBottom: 32, lineHeight: 1.5 }}>
          Masukkan kode 6 angka dari penjual SOM-mu
        </p>
        
        <div style={{ marginBottom: 24 }}>
          <p style={styles.label}>Kode Aktivasi</p>
          <input
            style={{ ...styles.input, fontSize: 24, textAlign: "center", letterSpacing: 8, fontWeight: 800, fontFamily: "monospace" }}
            type="tel"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={e => { setOtp(e.target.value.replace(/\D/g, "")); setError(""); }}
          />
          {error && <p style={{ color: C.danger, fontSize: 13, marginTop: 8 }}>{error}</p>}
        </div>
        
        <button style={styles.btn} onClick={handleActivate}>Aktifkan →</button>
        
        <div style={{ marginTop: 40, padding: 20, background: C.card, borderRadius: 16, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6 }}>
            <span style={{ color: C.gold }}>💡</span> Belum punya kode? Beli SOM di warung, counter HP, atau tanya teman yang jual SOM. Rp 100.000/bulan.
          </p>
        </div>
      </div>
    </div>
  );
}

function NicknameScreen({ onComplete }) {
  const [name, setName] = useState("");
  
  return (
    <div style={{ padding: 32, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh" }}>
      <div className="fade-up">
        <div style={{ fontSize: 48, marginBottom: 16 }}>👋</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 8 }}>Hai! Siapa nama panggilanmu?</h2>
        <p style={{ fontSize: 14, color: C.textDim, marginBottom: 32, lineHeight: 1.5 }}>
          Nama panggilan aja, nggak perlu KTP. Ini rahasiamu.
        </p>
        
        <div style={{ marginBottom: 24 }}>
          <p style={styles.label}>Nama Panggilan</p>
          <input
            style={styles.input}
            placeholder="contoh: Ayu, Budi, Mama Sri..."
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={20}
          />
        </div>
        
        <button 
          style={{ ...styles.btn, opacity: name.length < 2 ? 0.4 : 1 }} 
          onClick={() => name.length >= 2 && onComplete(name)}
          disabled={name.length < 2}
        >
          Ayo Mulai! 🤝
        </button>
        
        <p style={{ fontSize: 12, color: C.textDark, marginTop: 16, textAlign: "center" }}>
          🔒 SOM tidak menyimpan data pribadimu. Aman.
        </p>
      </div>
    </div>
  );
}

function ChatScreen({ name, onMenu, onFraud }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [tipIdx] = useState(Math.floor(Math.random() * TIPS.length));
  const [typing, setTyping] = useState(false);
  const chatRef = useRef(null);
  const inputRef = useRef(null);
  
  useEffect(() => {
    // Initial greeting
    const timer = setTimeout(() => {
      setMessages([{
        text: AI_RESPONSES.greeting.replace("{name}", name),
        isUser: false,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      }]);
    }, 600);
    return () => clearTimeout(timer);
  }, [name]);
  
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, typing]);
  
  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = {
      text: input.trim(),
      isUser: true,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };
    setMessages(prev => [...prev, userMsg]);
    const userText = input;
    setInput("");
    setTyping(true);
    
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, {
        text: getResponse(userText, name),
        isUser: false,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      }]);
    }, 800 + Math.random() * 800);
  };
  
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>
          <span>🤝</span> SOM
        </h1>
        <div style={{ display: "flex", gap: 4 }}>
          <button style={styles.headerBtn} onClick={onFraud} title="Cek Penipuan">🛡️</button>
          <button style={styles.headerBtn} onClick={onMenu} title="Menu">☰</button>
        </div>
      </div>
      
      {/* Status */}
      <div style={styles.statusBar}>
        <div style={styles.statusDot} />
        <span>SOM aktif — siap bantu kamu</span>
      </div>
      
      {/* Daily tip */}
      <div style={styles.tipBanner}>
        <span style={styles.tipIcon}>💡</span>
        <p style={styles.tipText}>{TIPS[tipIdx]}</p>
      </div>
      
      {/* Chat */}
      <div ref={chatRef} style={styles.chatArea}>
        {messages.map((msg, i) => (
          <div key={i} style={styles.msgRow(msg.isUser)} className="slide-in">
            <div>
              <div style={styles.msgBubble(msg.isUser)}>{msg.text}</div>
              <div style={{ ...styles.msgTime, textAlign: msg.isUser ? "right" : "left" }}>{msg.time}</div>
            </div>
          </div>
        ))}
        {typing && (
          <div style={styles.msgRow(false)}>
            <div style={{ ...styles.msgBubble(false), color: C.textDim }}>
              <span style={{ animation: "pulse 1s infinite" }}>SOM sedang mengetik...</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Input */}
      <div style={styles.inputBar}>
        <input
          ref={inputRef}
          style={styles.chatInput}
          placeholder="Cerita ke SOM..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button style={styles.sendBtn} onClick={sendMessage}>
          <span style={{ color: "#000", fontSize: 20 }}>↑</span>
        </button>
      </div>
    </div>
  );
}

function MenuScreen({ name, onBack, onFraud }) {
  const menuItems = [
    { icon: "💬", title: "Chat dengan SOM", desc: "Curhat, tanya, minta saran", action: onBack },
    { icon: "🛡️", title: "Jangan Kena Penipu!", desc: "Kenali modus penipuan terbaru", action: onFraud },
    { icon: "📊", title: "Hitung Uangku", desc: "Berapa masuk, berapa keluar", action: null },
    { icon: "🎓", title: "Belajar Pintar", desc: "Tips keuangan harian", action: null },
    { icon: "🆘", title: "Darurat", desc: "Nomor penting: polisi, RS, OJK", action: null },
    { icon: "👥", title: "Ajak Teman", desc: "Dapat komisi Rp 20.000/teman", action: null },
  ];
  
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={styles.header}>
        <button style={styles.headerBtn} onClick={onBack}>←</button>
        <h1 style={{ ...styles.headerTitle, fontSize: 16 }}>Menu</h1>
        <div style={{ width: 38 }} />
      </div>
      
      {/* Profile card */}
      <div style={{ padding: "24px 20px 16px", background: C.card, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.accent + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>{name}</p>
            <p style={{ fontSize: 13, color: C.accent, margin: "2px 0 0" }}>✓ SOM Aktif — 28 hari tersisa</p>
          </div>
        </div>
      </div>
      
      {/* Menu items */}
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", flex: 1 }}>
        {menuItems.map((item, i) => (
          <div key={i} style={styles.menuItem} className="fade-up" onClick={item.action || undefined}>
            <div style={styles.menuIcon}>{item.icon}</div>
            <div style={styles.menuText}>
              <p style={styles.menuTitle}>{item.title}</p>
              <p style={styles.menuDesc}>{item.desc}</p>
            </div>
            <span style={{ color: C.textDark, fontSize: 18 }}>›</span>
          </div>
        ))}
      </div>
      
      {/* Referral banner */}
      <div style={{ padding: "16px 20px 32px", background: C.card, borderTop: `1px solid ${C.border}` }}>
        <div style={{ background: `linear-gradient(135deg, ${C.gold}15, ${C.gold}05)`, border: `1px solid ${C.gold}33`, borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>💰</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: C.gold, margin: 0 }}>Jual SOM, Dapat Komisi!</p>
            <p style={{ fontSize: 12, color: C.textDim, margin: "4px 0 0" }}>Rp 20.000 per aktivasi. Jual ke teman, tetangga, rekan kerja.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FraudScreen({ onBack }) {
  const [selected, setSelected] = useState(null);
  
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={styles.header}>
        <button style={styles.headerBtn} onClick={onBack}>←</button>
        <h1 style={{ ...styles.headerTitle, fontSize: 16, color: C.danger }}>
          🛡️ Jangan Kena Penipu!
        </h1>
        <div style={{ width: 38 }} />
      </div>
      
      <div style={{ padding: "12px 16px 4px" }}>
        <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.5 }}>
          Kenali modus-modus penipuan yang sering terjadi. Kalau ragu, tanya SOM dulu sebelum transfer uang!
        </p>
      </div>
      
      <div style={{ padding: "8px 16px 32px", overflowY: "auto", flex: 1 }}>
        {FRAUD_DB.map((fraud, i) => (
          <div 
            key={i} 
            style={{ ...styles.fraudCard, cursor: "pointer", borderColor: selected === i ? C.danger : C.border }}
            onClick={() => setSelected(selected === i ? null : i)}
            className="fade-up"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={styles.fraudIcon}>{fraud.icon}</span>
              <p style={styles.fraudTitle}>{fraud.title}</p>
            </div>
            {selected === i && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                <p style={styles.fraudDesc}>{fraud.desc}</p>
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <button style={{ ...styles.btnDanger, marginTop: 0, padding: "10px 16px", fontSize: 13, flex: 1 }}>
                    🚨 Saya kena ini!
                  </button>
                  <button style={{ ...styles.btnOutline, marginTop: 0, padding: "10px 16px", fontSize: 13, flex: 1, borderColor: C.textDark, color: C.textDim }}>
                    Bagikan ⤴
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        
        <div style={{ padding: 20, background: C.card, borderRadius: 16, border: `1px solid ${C.accent}33`, marginTop: 8 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.accent, margin: "0 0 8px" }}>🔍 Cek Penipuan</p>
          <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.5, margin: 0 }}>
            Ragu sama tawaran atau transfer? Chat SOM dan ceritakan situasinya. SOM bantu kamu analisa apakah ini penipuan.
          </p>
        </div>
      </div>
    </div>
  );
}

// ====== MAIN APP ======

export default function SOM() {
  const [screen, setScreen] = useState(SCREENS.SPLASH);
  const [name, setName] = useState("");
  const [prevScreen, setPrevScreen] = useState(SCREENS.CHAT);
  
  const goTo = (s) => {
    setPrevScreen(screen);
    setScreen(s);
  };
  
  return (
    <div style={styles.app}>
      <GlobalStyles />
      {screen === SCREENS.SPLASH && (
        <SplashScreen onStart={() => goTo(SCREENS.ACTIVATE)} />
      )}
      {screen === SCREENS.ACTIVATE && (
        <ActivateScreen onActivate={() => goTo(SCREENS.NICKNAME)} />
      )}
      {screen === SCREENS.NICKNAME && (
        <NicknameScreen onComplete={(n) => { setName(n); goTo(SCREENS.CHAT); }} />
      )}
      {screen === SCREENS.CHAT && (
        <ChatScreen 
          name={name || "Kawan"} 
          onMenu={() => goTo(SCREENS.MENU)} 
          onFraud={() => goTo(SCREENS.FRAUD)}
        />
      )}
      {screen === SCREENS.MENU && (
        <MenuScreen 
          name={name || "Kawan"} 
          onBack={() => goTo(SCREENS.CHAT)} 
          onFraud={() => goTo(SCREENS.FRAUD)}
        />
      )}
      {screen === SCREENS.FRAUD && (
        <FraudScreen onBack={() => goTo(prevScreen === SCREENS.FRAUD ? SCREENS.CHAT : prevScreen)} />
      )}
    </div>
  );
}
