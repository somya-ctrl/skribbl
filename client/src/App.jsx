import { useEffect, useRef, useState } from "react";
import socket from "./socket";
import Canvas from "./components/Canvas";
import Home from "./pages/Home";

function App() {

  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [players, setPlayers] = useState([]);
  const [inRoom, setInRoom] = useState(false);
  const [copied, setCopied] = useState(false);

  const [messages, setMessages] =
    useState([]);

  const [messageInput, setMessageInput] =
    useState("");

  const [currentWord, setCurrentWord] =
    useState("");

  const [currentDrawer, setCurrentDrawer] =
    useState("");

  const [timeLeft, setTimeLeft] =
    useState(0);

  const [wordChoices, setWordChoices] =
    useState([]);

  const [winner, setWinner] =
    useState("");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  // NEW: mobile chat state
  const [mobileChatOpen, setMobileChatOpen] =
    useState(false);

  const messagesEndRef = useRef(null);
  const mobileMessagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    if (mobileMessagesEndRef.current) {
      mobileMessagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {

    socket.on("room_created", (data) => {

      setRoomId(data.roomId);

      setPlayers(data.players);

      setCurrentDrawer(
        data.currentDrawer
      );

      setInRoom(true);

    });

    socket.on("player_list", (data) => {

      setPlayers(data.players);

      setCurrentDrawer(
        data.currentDrawer
      );

    });

    socket.on(
      "error_message",
      (message) => {

        alert(message);

        setInRoom(false);

      }
    );

    socket.on(
      "chat_message",
      (message) => {

        setMessages((prev) => [
          ...prev,
          message,
        ]);

        // WINNER
        if (
          message.text.includes(
            "wins the game"
          )
        ) {

          setWinner(message.text);

        }

      }
    );

    socket.on(
      "your_word",
      ({ word }) => {

        setCurrentWord(word);

      }
    );

    socket.on(
      "word_choices",
      ({ words }) => {

        setWordChoices(words);

      }
    );

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

      socket.off("word_choices");

      socket.off("timer_update");

    };

  }, []);

  // CREATE ROOM
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

  // JOIN ROOM
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

  // LEAVE ROOM
  const handleLeaveRoom = () => {

    socket.disconnect();

    socket.connect();

    setInRoom(false);

    setRoomId("");

    setPlayers([]);

    setCurrentDrawer("");

    setMessages([]);

    setCurrentWord("");

    setWordChoices([]);

    setWinner("");

    setTimeLeft(0);

    setSidebarOpen(false);

    setMobileChatOpen(false);

  };

  // SEND MESSAGE
  const sendMessage = () => {

    if (!messageInput.trim()) return;

    socket.emit("chat_message", {
      roomId,
      playerName: name,
      text: messageInput,
    });

    setMessageInput("");

  };

  // COPY ROOM ID
  const copyRoomId = () => {

    navigator.clipboard.writeText(
      roomId
    );

    setCopied(true);

    setTimeout(() => {

      setCopied(false);

    }, 2000);

  };

  // HOME
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
      <header className="bg-[#1a1a27] border-b border-white/[0.06] px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-md flex-wrap gap-2">

        <div className="flex items-center gap-2.5">

          <div className="w-8 h-8 bg-[#6c63ff] rounded-lg flex items-center justify-center shrink-0">

            <span className="text-white text-sm">
              ✏️
            </span>

          </div>

          <span className="text-white text-lg font-semibold tracking-tight">
            Skribbl
          </span>

        </div>

        {/* ROOM CODE */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">

          <div className="flex items-center gap-2 sm:gap-2.5 bg-[#111118] px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-white/[0.08]">

            <span className="hidden sm:block text-[10px] text-white/30 uppercase tracking-wider font-semibold">
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
                <span>
                  Copy
                </span>
              )}

            </button>

          </div>

          {/* MOBILE SIDEBAR TOGGLE */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="sm:hidden px-3 py-1.5 bg-[#6c63ff]/10 hover:bg-[#6c63ff]/20 text-[#9c96ff] border border-[#6c63ff]/20 rounded-xl text-sm font-medium transition-all"
          >
            👥 {players.length}
          </button>

          <button
            onClick={handleLeaveRoom}
            className="px-3 sm:px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium transition-all cursor-pointer"
          >
            Leave
          </button>

        </div>

      </header>

      {/* MAIN */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* MOBILE OVERLAY */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-20 sm:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside className={`
          fixed sm:relative top-0 left-0 h-full z-30 sm:z-auto
          w-72 sm:w-80
          bg-[#1a1a27] sm:bg-[#1a1a27]/60
          border-r border-white/[0.06]
          p-4 sm:p-6
          flex flex-col gap-4 sm:gap-5
          transition-transform duration-300
          overflow-y-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
        `}>

          {/* MOBILE CLOSE BUTTON */}
          <div className="flex items-center justify-between sm:hidden mb-1">
            <span className="text-white/50 text-xs uppercase tracking-widest font-bold">Panel</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white/40 hover:text-white text-xl leading-none"
            >
              ✕
            </button>
          </div>

          {/* PLAYERS */}
          <div className="flex items-center justify-between">

            <h2 className="text-[11px] font-bold text-white/30 uppercase tracking-widest">
              Players
            </h2>

            <span className="bg-[#6c63ff]/10 text-[#9c96ff] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#6c63ff]/15">
              {players.length} online
            </span>

          </div>

          {/* PLAYER LIST */}
          <div className="flex flex-col gap-2.5 overflow-y-auto max-h-48 sm:max-h-none">

            {[...players]
              .sort(
                (a, b) =>
                  b.score - a.score
              )
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
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0"
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

                      {player.id === currentDrawer && (
                        <span className="mr-1">
                          👑
                        </span>
                      )}

                      {player.name}

                      {player.id === socket.id && (
                        <span className="text-[10px] text-white/40 ml-1.5 font-normal">
                          (You)
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

          {/* CHAT — hidden on mobile (handled by bottom bar instead) */}
          <div className="mt-2 sm:mt-4 hidden sm:flex flex-col flex-1 min-h-0">

            <h2 className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-3">
              Chat
            </h2>

            {/* MESSAGES */}
            <div className="flex-1 bg-[#111118]/60 rounded-xl border border-white/[0.05] p-3 overflow-y-auto flex flex-col gap-2 min-h-[140px] max-h-[200px] sm:max-h-[250px]">

              {messages.map((msg, idx) => (

                <div
                  key={idx}
                  className="text-sm"
                >

                  <span className="font-semibold text-[#6c63ff]">
                    {msg.playerName}:
                  </span>

                  <span className="text-white/80 ml-2 break-words">
                    {msg.text}
                  </span>

                </div>

              ))}

              <div ref={messagesEndRef} />

            </div>

            {/* INPUT */}
            <div className="flex gap-2 mt-3">

              <input
                type="text"
                placeholder={
                  socket.id === currentDrawer
                    ? "You are drawing..."
                    : "Type a guess..."
                }
                value={messageInput}
                disabled={
                  socket.id === currentDrawer
                }
                onChange={(e) =>
                  setMessageInput(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {

                  if (e.key === "Enter") {

                    sendMessage();

                  }

                }}
                className={`flex-1 min-w-0 border border-white/[0.08] rounded-xl px-3 py-2 text-sm outline-none ${
                  socket.id ===
                  currentDrawer
                    ? "bg-[#222] text-white/40 cursor-not-allowed"
                    : "bg-[#111118] text-white"
                }`}
              />

              <button
                onClick={sendMessage}
                disabled={
                  socket.id === currentDrawer
                }
                className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 ${
                  socket.id ===
                  currentDrawer
                    ? "bg-[#444] text-white/40 cursor-not-allowed"
                    : "bg-[#6c63ff] hover:bg-[#7b73ff] cursor-pointer"
                }`}
              >
                Send
              </button>

            </div>

          </div>

        </aside>

        {/* MAIN BOARD */}
        {/* pb-36 on mobile so content isn't hidden behind the fixed bottom chat bar */}
        <main className="flex-1 flex flex-col items-center justify-start sm:justify-center p-3 sm:p-8 overflow-y-auto pb-36 sm:pb-8">

          <div className="bg-[#1a1a27] p-3 sm:p-5 rounded-2xl border border-white/[0.07] shadow-2xl flex flex-col items-center gap-3 sm:gap-4 w-full max-w-[960px]">

            {/* TOP */}
            <div className="w-full flex justify-between items-center px-1 flex-wrap gap-2">

              <div className="flex flex-col">

                <span className="text-sm font-semibold text-white/70">
                  Drawing Board
                </span>

                <div className="flex gap-2 sm:gap-3 mt-1 flex-wrap">

                  {[...players]
                    .sort(
                      (a, b) =>
                        b.score - a.score
                    )
                    .slice(0, 3)
                    .map((player) => (

                      <div
                        key={player.id}
                        className="text-xs bg-[#111118] px-2 py-1 rounded-lg border border-white/[0.06]"
                      >

                        {player.id === currentDrawer &&
                          "👑 "}

                        {player.name}:{" "}

                        <span className="text-yellow-400">
                          {player.score}
                        </span>

                      </div>

                    ))}

                </div>

              </div>

              <span className="text-xs text-white/30">
                900x500
              </span>

            </div>

            {/* TIMER */}
            <div className="text-white text-lg font-bold">

              {players.length < 2
                ? "Waiting..."
                : `⏳ ${timeLeft}s`}

            </div>

            {/* WORD CHOICES */}
            {socket.id === currentDrawer &&
              wordChoices.length > 0 && (

                <div className="flex gap-2 sm:gap-3 flex-wrap justify-center">

                  {wordChoices.map((word) => (

                    <button
                      key={word}
                      onClick={() => {

                        socket.emit(
                          "select_word",
                          {
                            roomId,
                            word,
                          }
                        );

                        setCurrentWord(
                          word
                        );

                        setWordChoices([]);

                      }}
                      className="px-3 sm:px-4 py-2 bg-[#6c63ff] hover:bg-[#7b73ff] rounded-xl text-sm sm:text-base cursor-pointer"
                    >

                      {word}

                    </button>

                  ))}

                </div>

              )}

            {/* CURRENT WORD */}
            {socket.id === currentDrawer &&
              currentWord &&
              wordChoices.length === 0 && (

                <div className="text-xl sm:text-2xl font-bold text-yellow-400">
                  Word: {currentWord}
                </div>

              )}

            {/* WINNER SCREEN */}
            {winner && (

              <div className="w-full bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 sm:p-6 flex flex-col items-center gap-3 sm:gap-4">

                <div className="text-4xl sm:text-5xl">
                  🏆
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 text-center">

                  {winner}

                </h2>

                <button
                  onClick={() => {

                    setWinner("");

                    socket.emit(
                      "play_again",
                      { roomId }
                    );

                  }}
                  className="px-5 py-2 bg-[#6c63ff] hover:bg-[#7b73ff] rounded-xl font-medium cursor-pointer"
                >

                  Play Again

                </button>

              </div>

            )}

            {/* WAITING */}
            {players.length < 2 && (

              <div className="w-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 px-4 py-3 rounded-xl text-sm font-medium text-center">

                Waiting for players...
                Need at least 2 players
                to start 🎮

              </div>

            )}

            {/* CANVAS — horizontal scroll on mobile */}
            <div className="w-full overflow-x-auto">

              <div className="rounded-xl overflow-hidden border-2 border-white/[0.06] shadow-inner bg-white inline-block min-w-full sm:min-w-0">

                <Canvas
                  roomId={roomId}
                  canDraw={
                    socket.id === currentDrawer
                  }
                />

              </div>

            </div>

            {/* HELP */}
            <div className="flex items-center gap-2 text-white/30 text-xs mt-1 text-center">

              <span>✏️</span>

              <span>
                Click/tap and drag inside
                the canvas to draw.
                Other players will see
                it in real-time.
              </span>

            </div>

          </div>

        </main>

      </div>

      {/* =============================================
          MOBILE BOTTOM CHAT BAR — sm:hidden only
      ============================================= */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1a1a27] border-t border-white/[0.08] shadow-2xl">

        {/* TOGGLE TAB */}
        <button
          onClick={() => setMobileChatOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white/90 transition-colors"
        >

          <div className="flex items-center gap-2">
            <span>💬</span>
            <span>Chat</span>
            {messages.length > 0 && (
              <span className="bg-[#6c63ff] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {messages.length}
              </span>
            )}
          </div>

          <span className="text-white/30 text-xs">
            {mobileChatOpen ? "▼" : "▲"}
          </span>

        </button>

        {/* EXPANDABLE MESSAGES */}
        {mobileChatOpen && (
          <div className="px-3 pb-1 max-h-40 overflow-y-auto flex flex-col gap-1.5 border-t border-white/[0.05]">

            {messages.length === 0 ? (
              <p className="text-white/25 text-xs text-center py-3">No messages yet</p>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className="text-sm py-0.5">
                  <span className="font-semibold text-[#6c63ff]">{msg.playerName}:</span>
                  <span className="text-white/80 ml-2 break-words">{msg.text}</span>
                </div>
              ))
            )}

            <div ref={mobileMessagesEndRef} />

          </div>
        )}

        {/* ALWAYS-VISIBLE INPUT ROW */}
        <div className="flex gap-2 px-3 pb-3 pt-1">

          <input
            type="text"
            placeholder={
              socket.id === currentDrawer
                ? "You are drawing..."
                : "Type a guess..."
            }
            value={messageInput}
            disabled={socket.id === currentDrawer}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            className={`flex-1 min-w-0 border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm outline-none ${
              socket.id === currentDrawer
                ? "bg-[#222] text-white/40 cursor-not-allowed"
                : "bg-[#111118] text-white"
            }`}
          />

          <button
            onClick={sendMessage}
            disabled={socket.id === currentDrawer}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 ${
              socket.id === currentDrawer
                ? "bg-[#444] text-white/40 cursor-not-allowed"
                : "bg-[#6c63ff] hover:bg-[#7b73ff] cursor-pointer"
            }`}
          >
            Send
          </button>

        </div>

      </div>

    </div>

  );

}

export default App;