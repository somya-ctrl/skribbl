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
  const [messages, setMessages] = useState([]);
const [messageInput, setMessageInput] = useState("");
const [currentWord, setCurrentWord] =
  useState("");
  // NEW
  const [currentDrawer, setCurrentDrawer] =
    useState("");
    const [timeLeft, setTimeLeft] =
  useState(60);

  useEffect(() => {

    socket.on("room_created", (data) => {

      setRoomId(data.roomId);
      setPlayers(data.players);
      setCurrentDrawer(data.currentDrawer);
      setInRoom(true);

    });

    socket.on("player_list", (data) => {

      setPlayers(data.players);
      setCurrentDrawer(data.currentDrawer);

    });

    socket.on("error_message", (message) => {

      alert(message);
      setInRoom(false);

    });
    socket.on("chat_message", (message) => {

  setMessages((prev) => [
    ...prev,
    message,
  ]);
  
});
 socket.on("your_word", ({ word }) => {

  setCurrentWord(word);

});
socket.on(
  "timer_update",
  (time) => {

    setTimeLeft(time);

  }
);
    return () => {

      socket.off("room_created");
      socket.off("player_list");
      socket.off("error_message");
      socket.off("chat_message");
      socket.off("your_word");
      socket.off("timer_update");
    };

  }, []);

  const handleCreateRoom = (
    playerName,
    settings
  ) => {

    setName(playerName);

    socket.emit("create_room", {
      playerName,
      settings,
    });

  };

  const handleJoinRoom = (
    playerName,
    targetRoomId
  ) => {

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

    setCurrentDrawer("");

  };
  const sendMessage = () => {

  if (!messageInput.trim()) return;

  socket.emit("chat_message", {
    roomId,
    playerName: name,
    text: messageInput,
  });

  setMessageInput("");

};

  const copyRoomId = () => {

    navigator.clipboard.writeText(roomId);

    setCopied(true);

    setTimeout(() => setCopied(false), 2000);

  };

  if (!inRoom) {

    return (
      <Home
        onJoin={handleJoinRoom}
        onCreate={handleCreateRoom}
      />
    );

  }

  return (
    <div className="min-h-screen bg-[#111118] text-white flex flex-col font-sans">

      {/* HEADER */}
      <header className="bg-[#1a1a27] border-b border-white/[0.06] px-6 py-4 flex items-center justify-between shadow-md">

        <div className="flex items-center gap-2.5">

          <div className="w-8 h-8 bg-[#6c63ff] rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">
              ✏️
            </span>
          </div>

          <span className="text-white text-lg font-semibold tracking-tight">
            Skribbl
          </span>

        </div>

        {/* ROOM CODE */}
        <div className="flex items-center gap-3">

          <div className="flex items-center gap-2.5 bg-[#111118] px-3.5 py-1.5 rounded-xl border border-white/[0.08]">

            <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
              Room Code
            </span>

            <span className="text-sm font-mono font-bold text-[#6c63ff] tracking-widest select-all">
              {roomId}
            </span>

            <button
              onClick={copyRoomId}
              className="px-2 py-0.5 bg-[#6c63ff]/10 hover:bg-[#6c63ff]/20 text-[#9c96ff] rounded-md text-xs transition-colors flex items-center gap-1 font-medium cursor-pointer"
            >

              {copied ? (
                <span className="text-green-400">
                  Copied!
                </span>
              ) : (
                <span>Copy</span>
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

      {/* MAIN */}
      <div className="flex-1 flex overflow-hidden">

        {/* SIDEBAR */}
        <aside className="w-80 bg-[#1a1a27]/60 border-r border-white/[0.06] p-6 flex flex-col gap-5">

          <div className="flex items-center justify-between">

            <h2 className="text-[11px] font-bold text-white/30 uppercase tracking-widest">
              Players
            </h2>
                   <span className="bg-[#6c63ff]/10 text-[#9c96ff] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#6c63ff]/15">
              {players.length} online
            </span>

          </div>

          <div className="flex flex-col gap-2.5 overflow-y-auto">

             {[...players]
             .sort((a, b) => b.score - a.score)
            .map((player, idx) => (

              <div
                key={player.id || idx}
                className={`flex items-center gap-3 bg-[#111118]/60 p-3 rounded-xl border ${
                  player.id === socket.id
                    ? "border-[#6c63ff]/30 bg-[#6c63ff]/5"
                    : "border-white/[0.04]"
                }`}
              >

                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                  style={{
                    background: [
                      "#6c63ff",
                      "#ff6b9d",
                      "#ffd93d",
                      "#6bcb77",
                      "#ff4b4b",
                      "#4bafff",
                    ][idx % 6],
                  }}
                >

                  {player.name
                    .substring(0, 2)
                    .toUpperCase()}

                </div>

                <div className="flex-1 min-w-0">

                  <p className="text-sm font-medium text-white truncate">

                    {player.name}

                    {player.id === socket.id && (
                      <span className="text-[10px] text-white/40 ml-1.5 font-normal">
                        (You)
                      </span>
                    )}

                    {player.id === currentDrawer && (
                      <span className="ml-2 text-[10px] text-yellow-400">
                        ✏️ Drawing
                      </span>
                    )}

                  </p>
                  <p className="text-xs text-white/40 mt-1">
  Score: {player.score}
</p>
                </div>

              </div>

            ))}

          </div>
          {/* CHAT SECTION */}
<div className="mt-4 flex flex-col h-full">

  <h2 className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-3">
    Chat
  </h2>

  {/* MESSAGES */}
  <div className="flex-1 bg-[#111118]/60 rounded-xl border border-white/[0.05] p-3 overflow-y-auto flex flex-col gap-2 max-h-[250px]">

    {messages.map((msg, idx) => (

      <div
        key={idx}
        className="text-sm"
      >

        <span className="font-semibold text-[#6c63ff]">
          {msg.playerName}:
        </span>

        <span className="text-white/80 ml-2">
          {msg.text}
        </span>

      </div>

    ))}

  </div>

  {/* INPUT */}
  <div className="flex gap-2 mt-3">

    <input
      type="text"
      placeholder="Type a guess..."
      value={messageInput}
      onChange={(e) =>
        setMessageInput(e.target.value)
      }
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          sendMessage();
        }
      }}
      className="flex-1 bg-[#111118] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white outline-none"
    />

    <button
      onClick={sendMessage}
      className="px-4 py-2 bg-[#6c63ff] hover:bg-[#7b73ff] rounded-xl text-sm font-medium"
    >
      Send
    </button>

  </div>

</div>

        </aside>

        {/* DRAWING AREA */}
        <main className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">

          <div className="bg-[#1a1a27] p-5 rounded-2xl border border-white/[0.07] shadow-2xl flex flex-col items-center gap-4">

            <div className="w-full flex justify-between items-center px-1">

              <span className="text-sm font-semibold text-white/70">
                Drawing Board
              </span>

              <span className="text-xs text-white/30">
                900x500
              </span>

            </div>
            <div className="text-white text-lg font-bold">
  ⏳ {timeLeft}s
</div>
             {socket.id === currentDrawer && (
  <div className="text-lg font-bold text-yellow-400">
    Word: {currentWord}
  </div>
)}           
            {players.length < 2 && (

  <div className="w-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 px-4 py-3 rounded-xl text-sm font-medium text-center">

    Waiting for players...
    Need at least 2 players to start 🎮

  </div>

)}
            <div className="rounded-xl overflow-hidden border-2 border-white/[0.06] shadow-inner bg-white">

              <Canvas
                roomId={roomId}
                canDraw={
                  socket.id === currentDrawer
                }
              />

            </div>

            <div className="flex items-center gap-2 text-white/30 text-xs mt-1">

              <span>✏️</span>

              <span>
                Click and drag inside the canvas
                to draw. Other players will see
                it in real-time.
              </span>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default App;