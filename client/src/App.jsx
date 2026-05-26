import { useEffect, useState } from "react";
import socket from "./socket";
import Canvas from "./components/Canvas";
import Home from "./pages/Home";

function App() {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [players, setPlayers] = useState([]);
  const [inRoom, setInRoom] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    socket.on("room_created", (data) => {
      setRoomId(data.roomId);
      setPlayers(data.players);
      setInRoom(true);
    });

    socket.on("player_list", (players) => {
      setPlayers(players);
    });

    socket.on("error_message", (message) => {
      alert(message);
      setInRoom(false);
    });

    return () => {
      socket.off("room_created");
      socket.off("player_list");
      socket.off("error_message");
    };
  }, []);

  const handleCreateRoom = (playerName, settings) => {
    setName(playerName);
    socket.emit("create_room", {
      playerName,
      settings,
    });
  };

  const handleJoinRoom = (playerName, targetRoomId) => {
    setName(playerName);
    setRoomId(targetRoomId);
    socket.emit("join_room", {
      roomId: targetRoomId,
      playerName,
    });
    setInRoom(true);
  };

  const handleLeaveRoom = () => {
    socket.disconnect();
    socket.connect();
    setInRoom(false);
    setRoomId("");
    setPlayers([]);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inRoom) {
    return <Home onJoin={handleJoinRoom} onCreate={handleCreateRoom} />;
  }

  return (
    <div className="min-h-screen bg-[#111118] text-white flex flex-col font-sans">
      {/* Header bar */}
      <header className="bg-[#1a1a27] border-b border-white/[0.06] px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#6c63ff] rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">✏️</span>
          </div>
          <span className="text-white text-lg font-semibold tracking-tight">Skribbl</span>
        </div>

        {/* Room code and share button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-[#111118] px-3.5 py-1.5 rounded-xl border border-white/[0.08]">
            <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Room Code</span>
            <span className="text-sm font-mono font-bold text-[#6c63ff] tracking-widest select-all">{roomId}</span>
            <button
              onClick={copyRoomId}
              className="px-2 py-0.5 bg-[#6c63ff]/10 hover:bg-[#6c63ff]/20 text-[#9c96ff] rounded-md text-xs transition-colors flex items-center gap-1 font-medium cursor-pointer"
            >
              {copied ? (
                <span className="text-green-400">Copied!</span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={handleLeaveRoom}
            className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium transition-all cursor-pointer"
          >
            Leave
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-[#1a1a27]/60 border-r border-white/[0.06] p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Players</h2>
            <span className="bg-[#6c63ff]/10 text-[#9c96ff] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#6c63ff]/15">
              {players.length} online
            </span>
          </div>

          <div className="flex flex-col gap-2.5 overflow-y-auto">
            {players.map((player, idx) => (
              <div
                key={player.id || idx}
                className={`flex items-center gap-3 bg-[#111118]/60 p-3 rounded-xl border ${
                  player.id === socket.id ? "border-[#6c63ff]/30 bg-[#6c63ff]/5" : "border-white/[0.04]"
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                  style={{
                    background: ["#6c63ff", "#ff6b9d", "#ffd93d", "#6bcb77", "#ff4b4b", "#4bafff"][idx % 6],
                  }}
                >
                  {player.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {player.name}
                    {player.id === socket.id && (
                      <span className="text-[10px] text-white/40 ml-1.5 font-normal">(You)</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center Drawing Board */}
        <main className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
          <div className="bg-[#1a1a27] p-5 rounded-2xl border border-white/[0.07] shadow-2xl flex flex-col items-center gap-4">
            <div className="w-full flex justify-between items-center px-1">
              <span className="text-sm font-semibold text-white/70">Drawing Board</span>
              <span className="text-xs text-white/30">800x500</span>
            </div>
            <div className="rounded-xl overflow-hidden border-2 border-white/[0.06] shadow-inner bg-white">
              <Canvas />
            </div>
            <div className="flex items-center gap-2 text-white/30 text-xs mt-1">
              <span>✏️</span>
              <span>Click and drag inside the canvas to draw. Other players will see it in real-time.</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;