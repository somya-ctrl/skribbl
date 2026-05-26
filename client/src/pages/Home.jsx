import { useState } from "react";

const TABS = ["join", "create"];

export default function Home({ onJoin, onCreate }) {
  const [tab, setTab] = useState("join");
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [settings, setSettings] = useState({
    maxPlayers: 8, rounds: 3, drawTime: 80, wordCount: 3,
  });

  const handleJoin = () => {
    if (!name.trim() || !roomCode.trim()) return alert("Please fill all fields");
    onJoin(name, roomCode);
  };

  const handleCreate = () => {
    if (!name.trim()) return alert("Please enter your name");
    onCreate(name, settings);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111118] p-6">
      <div className="w-full max-w-sm bg-[#1a1a27] rounded-2xl border border-white/[0.07] p-9">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-1">
          <div className="w-10 h-10 bg-[#6c63ff] rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">✏️</span>
          </div>
          <span className="text-white text-2xl font-medium tracking-tight">Skribbl</span>
        </div>
        <p className="text-center text-white/30 text-xs tracking-widest mb-6">
          draw · guess · win
        </p>

        {/* Online players */}
        <div className="flex items-center justify-center mb-1">
          {["A","M","R","K"].map((l, i) => (
            <div key={l} className="w-7 h-7 rounded-full border-2 border-[#1a1a27] flex items-center justify-center text-[10px] font-medium text-white"
              style={{ background: ["#6c63ff","#ff6b9d","#ffd93d","#6bcb77"][i], marginLeft: i === 0 ? 0 : -6 }}>
              {l}
            </div>
          ))}
          <div className="w-7 h-7 rounded-full border-2 border-[#1a1a27] bg-white/10 flex items-center justify-center text-[9px] text-white/40"
            style={{ marginLeft: -6 }}>
            +8
          </div>
        </div>
        <p className="text-center text-white/25 text-xs mb-5">12 players online</p>

        {/* Tabs */}
        <div className="flex bg-[#111118] rounded-xl p-0.5 gap-0.5 mb-5">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-[10px] text-[13px] font-medium capitalize transition-all ${
                tab === t ? "bg-[#6c63ff] text-white" : "text-white/35 hover:text-white/60"
              }`}>
              {t === "join" ? "Join room" : "Create room"}
            </button>
          ))}
        </div>

        {/* Join Panel */}
        {tab === "join" && (
          <div className="flex flex-col gap-3.5">
            <Field label="Your name">
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Enter name..." maxLength={20} />
            </Field>
            <Field label="Room code">
              <input value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())}
                placeholder="A3X7F2" maxLength={6}
                className="text-center text-xl tracking-[10px] pl-6" />
            </Field>
            <SubmitBtn onClick={handleJoin}>Join room</SubmitBtn>
          </div>
        )}

        {/* Create Panel */}
        {tab === "create" && (
          <div className="flex flex-col gap-3.5">
            <Field label="Your name">
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Enter name..." maxLength={20} />
            </Field>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-white/20 text-[10px] uppercase tracking-widest">settings</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Max players", key: "maxPlayers", opts: [4,8,12,20] },
                { label: "Rounds",       key: "rounds",     opts: [2,3,4,5] },
                { label: "Draw time",    key: "drawTime",   opts: [30,60,80,120], suffix: "s" },
                { label: "Word choices", key: "wordCount",  opts: [2,3,4,5] },
              ].map(({ label, key, opts, suffix }) => (
                <div key={key}>
                  <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">
                    {label}
                  </label>
                  <select value={settings[key]}
                    onChange={e => setSettings({ ...settings, [key]: +e.target.value })}
                    className="w-full bg-[#111118] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-[13px] outline-none appearance-none cursor-pointer">
                    {opts.map(o => <option key={o} value={o}>{o}{suffix || ""}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <SubmitBtn onClick={handleCreate}>Create room</SubmitBtn>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="[&_input]:w-full [&_input]:bg-[#111118] [&_input]:border [&_input]:border-white/[0.08]
        [&_input]:rounded-xl [&_input]:px-3.5 [&_input]:py-2.5 [&_input]:text-white [&_input]:text-sm
        [&_input]:outline-none [&_input:focus]:border-[#6c63ff] [&_input]:transition-colors
        [&_input]:placeholder:text-white/20">
        {children}
      </div>
    </div>
  );
}

function SubmitBtn({ onClick, children }) {
  return (
    <button onClick={onClick}
      className="mt-1 w-full bg-[#6c63ff] hover:bg-[#5a52e0] active:scale-[0.98] text-white
        py-3 rounded-xl text-[15px] font-medium transition-all">
      {children}
    </button>
  );
}