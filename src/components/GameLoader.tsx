import React from "react";

import { GameData } from "../types";
import { logEventWithLabel } from "../util/analytics";
import { preloadedGames } from "../util/preloaded_games";

import "./GameLoader.css";

interface GameLoaderProps {
  updateGame: (game: GameData) => void;
}

function GameLoader(props: GameLoaderProps) {
  const { updateGame } = props;

  function loadPreloadedGame(gameId: string) {
    logEventWithLabel("Load Preloaded Game", gameId);
    const game = (preloadedGames as any)[gameId];
    if (game !== undefined) {
      updateGame(game);
    }
  }

  return (
    <div className="game-loader">
      <h1>Jeopardy Player</h1>
      <hr />
      <h2>Play a Preloaded Game</h2>
      <div className="preloaded-games">
        <button onClick={() => loadPreloadedGame("PokeTrivia")}>
          PokeTrivia
        </button>
      </div>
    </div>
  );
}

export default GameLoader;
