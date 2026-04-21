import { ChangeEvent, KeyboardEvent, useState } from "react";

import { Player } from "../types";

import "./PlayerChooser.css";

interface PlayerChooserProps {
  addPlayer: (name: string) => void;
  players: Player[];
  playGame: () => void;
}

function PlayerChooser(props: PlayerChooserProps) {
  const { addPlayer: addPlayerByName, playGame, players } = props;
  const [name, setName] = useState("");

  function addPlayer() {
    addPlayerByName(name);
    setName("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      addPlayer();
    }
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
  }

  return (
    <div className="player-chooser">
      <h1>Players</h1>
      <div className="players-list">
        {players.map((player, i) => (
          <div key={i} className="player-card">{player.name}</div>
        ))}
      </div>
      <div className="input-section">
        <input
          value={name}
          onKeyDown={handleKeyDown}
          onChange={handleNameChange}
          autoFocus
          type="text"
          placeholder="Player Name"
        />
        <button className="add-player-button" onClick={addPlayer}>
          Add Player
        </button>
      </div>
      <button className="play-game-button" onClick={playGame}>
        Play Game
      </button>
    </div>
  );
}

export default PlayerChooser;
