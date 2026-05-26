import { useEffect, useState } from "react";
import socket from "./socket";

function App() {

  const [name, setName] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [players, setPlayers] = useState([]);

  useEffect(() => {

    socket.on("room_created", (data) => {
      console.log(data);

      setCreatedRoomId(data.roomId);
      setPlayers(data.players);
    });

    socket.on("player_list", (players) => {
      setPlayers(players);
    });

    return () => {
      socket.off("room_created");
      socket.off("player_list");
    };

  }, []);

  const createRoom = () => {
    socket.emit("create_room", {
      playerName: name,
    });
  };

  const joinRoom = () => {
    socket.emit("join_room", {
      roomId: joinRoomId,
      playerName: name,
    });
  };

  return (
    <div>

      <h1>Skribbl</h1>

      <input
        placeholder="Enter Name"
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={createRoom}>
        Create Room
      </button>

      <input
        placeholder="Room ID"
        onChange={(e) => setJoinRoomId(e.target.value)}
      />

      <button onClick={joinRoom}>
        Join Room
      </button>
      <h3>Room Code: {createdRoomId}</h3>
      <h2>Players</h2>

      {players.map((player) => (
        <p key={player.id}>
          {player.name}
        </p>
      ))}

    </div>
  );
}

export default App;