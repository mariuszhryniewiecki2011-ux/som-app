import { useState, useEffect, useRef } from "react";
import Head from "next/head";

const SCREENS = { SPLASH: 0, ACTIVATE: 1, NICKNAME: 2, CHAT: 3, MENU: 4, FRAUD: 5 };

const FRAUD_DB = [
  { title: "Mama Minta Pulsa", desc: "SMS dari nomor tidak dikenal: 'Nak, tolong isi pulsa Mama.' Jangan transfer! Telepon langsung ke nomor Mama yang asli.", icon: "\u{1F4F1}" },
  { title: "Pinjol Ilegal", desc: "Pinjaman online yang minta akses kontak & foto. Mereka akan teror semua kontakmu. Cek OJK sebelum pinjam!", icon: "\u{1F988}" },
  { title: "Loker Palsu", desc: "Lowongan kerja minta transfer uang untuk 'seragam' atau 'training'. Kerja yang bener TIDAK pernah minta uang di depan.", icon: "\u{1F4BC}" },
  { title: "Undian Berhadiah", desc: "WhatsApp bilang kamu menang mobil/HP. Minta transfer pajak hadiah. PALSU. Hapus langsung.", icon: "\u{1F3B0}" },
  { title: "Investasi Bodong", desc: "Janji untung 10-50% per bulan? PASTI TIPU. Uang dari orang baru bayar orang lama. Kamu yang terakhir = rugi.", icon: "\u{1F4C8}" },
  { title: "Penipuan COD", desc: "Paket COD yang tidak kamu pesan. Jangan bayar! Tolak paket, hubungi marketplace resmi.", icon: "\u{1F4E6}" },
  { title: "Arisan Online", desc: "Arisan WhatsApp dengan orang tidak dikenal. Bandar kabur setelah kumpul uang. Arisan hanya dengan orang yang kamu kenal langsung.", icon: "\u{1F4B8}" },
  { title: "Modus Salah Transfer", desc: "'Kak, saya salah transfer ke rekening kamu, tolong balikin.' Jangan transfer balik \u2014 ini modus. Lapor ke bank.", icon: "\u{1F3E6}" },
];

const TIPS = [
  "Gaji masuk? Langsung pisahkan: sewa, makan, transport. Sisanya baru boleh dipakai.",
  "Sebelum beli, tanya: 'Butuh atau mau?' Kalau cuma mau \u2014 tunggu 3 hari.",
  "Catat semua pengeluaran. Tulis di notes HP. Setiap malam review.",
  "Jangan malu bawa bekal. Nasi dari rumah Rp 3.000. Nasi bungkus Rp 15.000. Sebulan hemat Rp 360.000.",
  "Cicilan motor terlalu berat? Hitung total: harga cash vs kredit. Biasanya 2x lipat.",
  "Darurat = hanya sakit, kecelakaan, kehilangan kerja. Bukan HP baru.",
  "Punya utang? Bayar yang bunga tertinggi dulu. Pinjol > kartu kredit > teman > keluarga.",
  "Minum air putih, bukan beli minuman kemasan. Hemat Rp 5.000-10.000/hari.",
];

const AI_RESPONSES = {
  greeting: "Hai {name}! Aku SOM, sahabatmu. Cerita aja, mau curhat soal apa hari ini?",
  money: "Gaji {name} berapa sebulan? Kita bikin rencana bareng. Nggak usah malu, di sini aman.",
  scam: "Wah, hati-hati! Coba ceritain lebih detail. Aku bantu cek apakah ini penipuan.",
  debt: "Utang memang berat. Tapi bisa diatur. Pertama: tulis semua utang, berapa, ke siapa, bunga berapa. Kita susun strategi bareng.",
  sad: "Aku dengar kamu, {name}. Hidup memang berat kadang. Tapi kamu sudah kuat sampai di sini. Mau cerita lebih?",
  hungry: "{name}, kalau lagi nggak punya uang makan \u2014 jangan malu minta tolong tetangga atau teman dekat. Itu bukan memalukan, itu manusiawi. Besok kita atur biar nggak kejadian lagi.",
  drink: "Minum biar lupa masalah? Itu cuma pinjam ketenangan, {name}. Besok masalahnya masih ada, ditambah badan sakit. Ayo kita cari jalan keluar yang beneran.",
  pawn: "Gadai motor? Pikir dulu: tanpa motor, gimana kerja? Gimana cari uang? Motor itu alat cari nafkah, bukan jaminan utang. Cari cara lain dulu.",
  default: "Aku ngerti, {name}. Cerita terus, aku dengerin. Kita cari jalan keluarnya bareng-bareng.",
};

function getResponse(text, name) {
  const lower = text.toLowerCase();
  let response;
  if (lower.includes("gadai") || lower.includes("jual motor")) {
    response = AI_RESPONSES.pawn;
  } else if (lower.includes("lapar") || lower.includes("makan") || lower.includes("laper")) {
    response = AI_RESPONSES.hungry;
  } else if (lower.includes("minum") || lower.includes("bir") || lower.includes("alkohol")) {
    response = AI_RESPONSES.drink;
  } else if (lower.includes("gaji") || lower.includes("uang") || lower.includes("bayar")) {
    response = AI_RESPONSES.money;
  } else if (lower.includes("tipu") || lower.includes("penipu") || lower.includes("scam") || lower.includes("transfer")) {
    response = AI_RESPONSES.scam;
  } else if (lower.includes("utang") || lower.includes("pinjam") || lower.includes("cicilan") || lower.includes("pinjol") || lower.includes("tagih")) {
    response = AI_RESPONSES.debt;
  } else if (lower.includes("capek") || lower.includes("sedih") || lower.includes("lelah") || lower.includes("susah") || lower.includes("nangis")) {
    response = AI_RESPONSES.sad;
  } else {
    response = AI_RESPONSES.default;
  }
  return response.replace(/\{name\}/g, name);
}

const C = {
  bg: "#0A1628", card: "#132238", cardLight: "#1A2D47",
  accent: "#00C853", accentDim: "#00963E", gold: "#FFB300",
  danger: "#FF5252", text: "#E8ECF0", textDim: "#8899AA",
  textDark: "#5A6A7A", white: "#FFFFFF",
  chatUser: "#1B5E20", chatBot: "#1A2D47", border: "#1E3550",
};

function SplashScreen({ onStart }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", padding: 32, textAlign: "center", background: `linear-gradient(170deg, ${C.bg} 0%, #0D2137 50%, #0A1628 100%)` }}>
      <div style={{ fontSize: 72, marginBottom: 16, filter: "drop-shadow(0 4px 20px rgba(0,200,83,0.3))" }}>{"\u{1F91D}"}</div>
      <h1 style={{ fontSize: 36, fontWeight: 900, color: C.accent, letterSpacing: -1, margin: 0, textShadow: "0 2px 20px rgba(0,200,83,0.25)" }}>SOM</h1>
      <p style={{ fontSize: 17, color: C.text, marginTop: 4, fontWeight: 700 }}>Sahabat Orang Miskin</p>
      <p style={{ fontSize: 15, color: C.textDim, marginTop: 8, lineHeight: 1.5, maxWidth: 280 }}>Teman pintar di sakumu. Bantu atur uang, hindari penipu, dan jalani hidup lebih baik.</p>
      <p style={{ fontSize: 13, color: C.gold, marginTop: 24, fontStyle: "italic", letterSpacing: 0.5 }}>{"\u{1F49A}"} Karena semua orang berhak punya sahabat yang peduli</p>
      <button onClick={onStart} style={{ background: C.accent, color: "#000", border: "none", borderRadius: 14, padding: "16px 32px", fontSize: 16, fontWeight: 800, cursor: "pointer", width: "100%", maxWidth: 300, marginTop: 32, letterSpacing: 0.5, boxShadow: "0 4px 20px rgba(0,200,83,0.3)" }}>Mulai Sekarang</button>
      <div style={{ display: "inline-flex", alignItems: "baseline", gap: 4, background: C.accent + "15", padding: "8px 16px", borderRadius: 10, marginTop: 24 }}>
        <span style={{ fontSize: 24, fontWeight: 900, color: C.accent }}>Rp 100.000</span>
        <span style={{ fontSize: 13, color: C.textDim }}>/bulan</span>
      </div>
    </div>
  );
}

function ActivateScreen({ onActivate }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const handleActivate = () => {
    if (otp.length === 6) onActivate();
    else setError("Kode OTP harus 6 angka");
  };
  return (
    <div style={{ padding: 32, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u{1F511}"}</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 8 }}>Aktivasi SOM</h2>
      <p style={{ fontSize: 14, color: C.textDim, marginBottom: 32, lineHeight: 1.5 }}>Masukkan kode 6 angka dari penjual SOM-mu</p>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.textDim, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Kode Aktivasi</p>
        <input
          style={{ background: C.cardLight, color: C.text, border: `2px solid ${error ? C.danger : C.border}`, borderRadius: 14, padding: "16px 20px", fontSize: 24, width: "100%", boxSizing: "border-box", outline: "none", textAlign: "center", letterSpacing: 8, fontWeight: 800, fontFamily: "monospace" }}
          type="tel" maxLength={6} placeholder="000000" value={otp}
          onFocus={e => e.target.style.borderColor = C.accent}
          onBlur={e => e.target.style.borderColor = error ? C.danger : C.border}
          onChange={e => { setOtp(e.target.value.replace(/\D/g, "")); setError(""); }}
        />
        {error && <p style={{ color: C.danger, fontSize: 13, marginTop: 8 }}>{error}</p>}
      </div>
      <button onClick={handleActivate} style={{ background: C.accent, color: "#000", border: "none", borderRadius: 14, padding: "16px 32px", fontSize: 16, fontWeight: 800, cursor: "pointer", width: "100%", maxWidth: 300, boxShadow: "0 4px 20px rgba(0,200,83,0.3)" }}>Aktifkan {"\u2192"}</button>
      <div style={{ marginTop: 40, padding: 20, background: C.card, borderRadius: 16, border: `1px solid ${C.border}` }}>
        <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6 }}>
          <span style={{ color: C.gold }}>{"\u{1F4A1}"}</span> Belum punya kode? Beli SOM di warung, counter HP, atau tanya teman yang jual SOM. Rp 100.000/bulan.
        </p>
      </div>
      <p style={{ fontSize: 12, color: C.textDark, marginTop: 16, textAlign: "center" }}>Demo: masukkan 6 angka apapun</p>
    </div>
  );
}

function NicknameScreen({ onComplete }) {
  const [name, setName] = useState("");
  return (
    <div style={{ padding: 32, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u{1F44B}"}</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 8 }}>Hai! Siapa nama panggilanmu?</h2>
      <p style={{ fontSize: 14, color: C.textDim, marginBottom: 32, lineHeight: 1.5 }}>Nama panggilan aja, nggak perlu KTP. Ini rahasiamu.</p>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.textDim, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Nama Panggilan</p>
        <input
          style={{ background: C.cardLight, color: C.text, border: `2px solid ${C.border}`, borderRadius: 14, padding: "16px 20px", fontSize: 16, width: "100%", boxSizing: "border-box", outline: "none" }}
          placeholder="contoh: Ayu, Budi, Mama Sri..."
          value={name} onChange={e => setName(e.target.value)} maxLength={20}
          onFocus={e => e.target.style.borderColor = C.accent}
          onBlur={e => e.target.style.borderColor = C.border}
        />
      </div>
      <button onClick={() => name.length >= 2 && onComplete(name)}
        style={{ background: C.accent, color: "#000", border: "none", borderRadius: 14, padding: "16px 32px", fontSize: 16, fontWeight: 800, cursor: "pointer", width: "100%", maxWidth: 300, boxShadow: "0 4px 20px rgba(0,200,83,0.3)", opacity: name.length < 2 ? 0.4 : 1 }}>
        Ayo Mulai! {"\u{1F91D}"}
      </button>
      <p style={{ fontSize: 12, color: C.textDark, marginTop: 16, textAlign: "center" }}>{"\u{1F512}"} SOM tidak menyimpan data pribadimu. Aman.</p>
    </div>
  );
}

function ChatScreen({ name, onMenu, onFraud }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [tipIdx] = useState(Math.floor(Math.random() * TIPS.length));
  const [typing, setTyping] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setMessages([{ text: AI_RESPONSES.greeting.replace(/\{name\}/g, name), isUser: false, time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) }]);
    }, 600);
    return () => clearTimeout(t);
  }, [name]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, typing]);

  const send = () => {
    if (!input.trim()) return;
    const t = input.trim();
    setMessages(prev => [...prev, { text: t, isUser: true, time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) }]);
    setInput(""); setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { text: getResponse(t, name), isUser: false, time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) }]);
    }, 800 + Math.random() * 800);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: C.card, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 10 }}>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: C.accent, margin: 0, display: "flex", alignItems: "center", gap: 8 }}><span>{"\u{1F91D}"}</span> SOM</h1>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={onFraud} style={{ background: "none", border: "none", color: C.textDim, fontSize: 22, cursor: "pointer", padding: 8 }}>{"\u{1F6E1}\uFE0F"}</button>
          <button onClick={onMenu} style={{ background: "none", border: "none", color: C.textDim, fontSize: 22, cursor: "pointer", padding: 8 }}>{"\u2630"}</button>
        </div>
      </div>
      <div style={{ padding: "6px 20px", background: C.accentDim + "22", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.accent }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, animation: "pulse 2s infinite" }} />
        <span>SOM aktif {"\u2014"} siap bantu {name}</span>
      </div>
      <div style={{ background: `linear-gradient(135deg, ${C.cardLight}, ${C.card})`, border: `1px solid ${C.gold}33`, borderRadius: 16, padding: 16, margin: "8px 16px 8px", display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{"\u{1F4A1}"}</span>
        <p style={{ fontSize: 13, color: C.gold, lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>{TIPS[tipIdx]}</p>
      </div>
      <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "12px 16px 110px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.isUser ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
            <div>
              <div style={{ background: msg.isUser ? C.chatUser : C.chatBot, color: C.text, padding: "12px 16px", borderRadius: msg.isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px", maxWidth: "80%", fontSize: 14.5, lineHeight: 1.55, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", border: msg.isUser ? "none" : `1px solid ${C.border}` }}>{msg.text}</div>
              <div style={{ fontSize: 11, color: C.textDark, marginTop: 4, textAlign: msg.isUser ? "right" : "left" }}>{msg.time}</div>
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ background: C.chatBot, color: C.textDim, padding: "12px 16px", borderRadius: "18px 18px 18px 4px", border: `1px solid ${C.border}`, fontSize: 14 }}>
              <span style={{ animation: "pulse 1s infinite" }}>SOM sedang mengetik...</span>
            </div>
          </div>
        )}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 420, padding: "12px 16px 24px", background: `linear-gradient(transparent, ${C.bg} 20%)`, display: "flex", gap: 10, alignItems: "center", boxSizing: "border-box" }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Cerita ke SOM..."
          style={{ flex: 1, background: C.cardLight, color: C.text, border: `1.5px solid ${C.border}`, borderRadius: 24, padding: "14px 20px", fontSize: 15, outline: "none" }}
        />
        <button onClick={send} style={{ background: C.accent, border: "none", borderRadius: "50%", width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,200,83,0.3)" }}>
          <span style={{ color: "#000", fontSize: 20 }}>{"\u2191"}</span>
        </button>
      </div>
    </div>
  );
}

function MenuScreen({ name, onBack, onFraud }) {
  const items = [
    { icon: "\u{1F4AC}", title: "Chat dengan SOM", desc: "Curhat, tanya, minta saran", action: onBack },
    { icon: "\u{1F6E1}\uFE0F", title: "Jangan Kena Penipu!", desc: "Kenali modus penipuan terbaru", action: onFraud },
    { icon: "\u{1F4CA}", title: "Hitung Uangku", desc: "Berapa masuk, berapa keluar", action: null },
    { icon: "\u{1F393}", title: "Belajar Pintar", desc: "Tips keuangan harian", action: null },
    { icon: "\u{1F198}", title: "Darurat", desc: "Nomor penting: polisi, RS, OJK", action: null },
    { icon: "\u{1F465}", title: "Ajak Teman", desc: "Dapat komisi Rp 20.000/teman", action: null },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: C.card, borderBottom: `1px solid ${C.border}` }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.textDim, fontSize: 22, cursor: "pointer", padding: 8 }}>{"\u2190"}</button>
        <h1 style={{ fontSize: 16, fontWeight: 800, color: C.accent, margin: 0 }}>Menu</h1>
        <div style={{ width: 38 }} />
      </div>
      <div style={{ padding: "24px 20px 16px", background: C.card, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.accent + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: C.accent, fontWeight: 900 }}>{name.charAt(0).toUpperCase()}</div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>{name}</p>
            <p style={{ fontSize: 13, color: C.accent, margin: "2px 0 0" }}>{"\u2713"} SOM Aktif {"\u2014"} 28 hari tersisa</p>
          </div>
        </div>
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", flex: 1 }}>
        {items.map((item, i) => (
          <div key={i} onClick={item.action || undefined} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", background: C.card, borderRadius: 16, cursor: item.action ? "pointer" : "default", border: `1px solid ${C.border}`, opacity: item.action ? 1 : 0.5 }}>
            <div style={{ fontSize: 28, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", background: C.cardLight, borderRadius: 14, flexShrink: 0 }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>{item.title}</p>
              <p style={{ fontSize: 12.5, color: C.textDim, margin: "4px 0 0" }}>{item.desc}</p>
            </div>
            <span style={{ color: C.textDark, fontSize: 18 }}>{"\u203A"}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "16px 20px 32px", background: C.card, borderTop: `1px solid ${C.border}` }}>
        <div style={{ background: `linear-gradient(135deg, ${C.gold}15, ${C.gold}05)`, border: `1px solid ${C.gold}33`, borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>{"\u{1F4B0}"}</span>
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: C.card, borderBottom: `1px solid ${C.border}` }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.textDim, fontSize: 22, cursor: "pointer", padding: 8 }}>{"\u2190"}</button>
        <h1 style={{ fontSize: 16, fontWeight: 800, color: C.danger, margin: 0 }}>{"\u{1F6E1}\uFE0F"} Jangan Kena Penipu!</h1>
        <div style={{ width: 38 }} />
      </div>
      <div style={{ padding: "12px 16px 4px" }}>
        <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.5 }}>Kenali modus-modus penipuan. Kalau ragu, tanya SOM dulu sebelum transfer uang!</p>
      </div>
      <div style={{ padding: "8px 16px 32px", overflowY: "auto", flex: 1 }}>
        {FRAUD_DB.map((f, i) => (
          <div key={i} onClick={() => setSelected(selected === i ? null : i)}
            style={{ background: C.card, border: `1px solid ${selected === i ? C.danger : C.border}`, borderRadius: 16, padding: 20, marginBottom: 12, cursor: "pointer", transition: "border 0.2s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 32 }}>{f.icon}</span>
              <p style={{ fontSize: 16, fontWeight: 800, color: C.danger, margin: 0 }}>{f.title}</p>
            </div>
            {selected === i && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                <p style={{ fontSize: 14, color: C.textDim, lineHeight: 1.55, margin: 0 }}>{f.desc}</p>
              </div>
            )}
          </div>
        ))}
        <div style={{ padding: 20, background: C.card, borderRadius: 16, border: `1px solid ${C.accent}33`, marginTop: 8 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.accent, margin: "0 0 8px" }}>{"\u{1F50D}"} Cek Penipuan</p>
          <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.5, margin: 0 }}>Ragu sama tawaran? Chat SOM dan ceritakan situasinya. SOM bantu analisa apakah ini penipuan.</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState(SCREENS.SPLASH);
  const [name, setName] = useState("");
  const [prev, setPrev] = useState(SCREENS.CHAT);
  const go = (s) => { setPrev(screen); setScreen(s); };

  return (
    <>
      <Head>
        <title>SOM - Sahabat Orang Miskin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0A1628" />
        <meta name="description" content="Teman pintar di sakumu. Bantu atur uang, hindari penipu." />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>
      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; background: ${C.bg}; font-family: 'Nunito', sans-serif; -webkit-tap-highlight-color: transparent; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
        input { font-family: 'Nunito', sans-serif; }
      `}</style>
      <div style={{ width: "100%", maxWidth: 420, margin: "0 auto", minHeight: "100vh", background: C.bg, fontFamily: "'Nunito', sans-serif", color: C.text, position: "relative", overflow: "hidden" }}>
        {screen === SCREENS.SPLASH && <SplashScreen onStart={() => go(SCREENS.ACTIVATE)} />}
        {screen === SCREENS.ACTIVATE && <ActivateScreen onActivate={() => go(SCREENS.NICKNAME)} />}
        {screen === SCREENS.NICKNAME && <NicknameScreen onComplete={(n) => { setName(n); go(SCREENS.CHAT); }} />}
        {screen === SCREENS.CHAT && <ChatScreen name={name || "Kawan"} onMenu={() => go(SCREENS.MENU)} onFraud={() => go(SCREENS.FRAUD)} />}
        {screen === SCREENS.MENU && <MenuScreen name={name || "Kawan"} onBack={() => go(SCREENS.CHAT)} onFraud={() => go(SCREENS.FRAUD)} />}
        {screen === SCREENS.FRAUD && <FraudScreen onBack={() => go(prev === SCREENS.FRAUD ? SCREENS.CHAT : prev)} />}
      </div>
    </>
  );
}
