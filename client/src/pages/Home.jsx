import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");

  const handleJoinRoom = () => {
    if (!name || !roomId) {
      alert("Please fill all fields");
      return;
    }

    console.log(name, roomId);

    // socket emit or navigate later
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="bg-zinc-800 p-8 rounded-2xl shadow-xl w-[350px]">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Skribbl Game
        </h1>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter your name"
            className="p-3 rounded-lg bg-zinc-700 text-white outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Enter room ID"
            className="p-3 rounded-lg bg-zinc-700 text-white outline-none"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />

          <button
            onClick={handleJoinRoom}
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}