import { useEffect, useState } from "react";

import FinalJeopardy from "./FinalJeopardy";
import GameLoader from "./GameLoader";
import JeopardyBoard from "./JeopardyBoard";
import PlayerChooser from "./PlayerChooser";
import Scoreboard from "./Scoreboard";
import {
  Game,
  GameData,
  GameRound,
  Player,
  RoundName,
  ROUND_SINGLE,
} from "../types";
import { logEvent, logEventWithLabel } from "../util/analytics";
import { preloadedGames } from "../util/preloaded_games";

import "./App.css";

function App() {
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [round, setRound] = useState<RoundName>(ROUND_SINGLE);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [numCategoriesShown, setNumCategoriesShown] = useState(0);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<
    number | null
  >(null);
  const [currentClueIndex, setCurrentClueIndex] = useState<number | null>(null);
  const [solutionVisible, setSolutionVisible] = useState(false);
  const [usedAnswerPlayers, setUsedAnswerPlayers] = useState<Set<number>>(new Set());

  // Specify a game in the query string as /?game=GAME_ID loads a pre-loaded game
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get("game");
    if (gameId === null) {
      return;
    }

    const preloadedGame: GameData | undefined = (preloadedGames as any)[gameId];
    if (preloadedGame === undefined) {
      return;
    }

    window.history.replaceState({}, document.title, "/");
    logEventWithLabel("Load Preloaded Game", gameId);
    updateGame(preloadedGame);
  }, []);

  function updateGame(data: GameData) {
    setPlayers(data.players || []);
    setRound(data.round || ROUND_SINGLE);
    setIsGameStarted(data.players !== undefined);
    setGame(data.game);
  }

  function addPlayer(name: string) {
    logEvent("Add Player");
    setPlayers([...players, { name, score: 0, correct: 0, incorrect: 0 }]);
  }

  function playGame() {
    logEvent("Play Game");
    setIsGameStarted(true);
  }

  function handleCategoryShown() {
    logEvent("Show Category");
    setNumCategoriesShown(numCategoriesShown + 1);
  }

  function chooseClue(categoryIndex: number, clueIndex: number) {
    logEvent("Show Clue");
    let newGame: Game = Object.assign({}, game);
    let newRound: GameRound = (newGame as any)[round];
    newRound[categoryIndex].clues[clueIndex].chosen = true;
    setGame(newGame);
    setCurrentCategoryIndex(categoryIndex);
    setCurrentClueIndex(clueIndex);
  }

  function updateScore(playerIndex: number, value: number, correct: boolean) {
    logEvent("Update Score");
    const newPlayers = [...players];
    players[playerIndex].score += value;
    if (correct) players[playerIndex].correct++;
    else players[playerIndex].incorrect++;
    setPlayers(newPlayers);
  }

  function returnToBoard() {
    logEvent("Back to Board");
    setCurrentClueIndex(null);
    setCurrentCategoryIndex(null);
    setSolutionVisible(false);
    setUsedAnswerPlayers(new Set());
  }

  function onSolutionToggle(visible: boolean) {
    setSolutionVisible(visible);
  }

  function proceedToFinal() {
    logEvent("Proceed to Final Jeopardy");
    setRound("final");
  }

  function finishGame() {
    logEvent("Finish Game");
    setRound("done");
  }

  if (game === null) {
    return (
      <div className="app">
        <GameLoader updateGame={updateGame} />
      </div>
    );
  }

  if (!isGameStarted) {
    return (
      <div className="app">
        <PlayerChooser
          players={players}
          addPlayer={addPlayer}
          playGame={playGame}
        />
      </div>
    );
  } else if (round === "single") {
    const board = game.single;
    if (board === undefined) {
      return <div>Error: Game board not found.</div>;
    }

    // See if we should be able to proceed to Final Jeopardy
    let allowProceedToFinal = true;
    board.forEach((category) => {
      category.clues.forEach((clue) => {
        if (clue.chosen === undefined) {
          allowProceedToFinal = false;
        }
      });
    });

    return (
      <div className="app">
        {currentCategoryIndex === null &&
          currentClueIndex === null &&
          allowProceedToFinal && (
            <div>
              <button onClick={proceedToFinal} className="proceed-to">
                Proceed to Final Jeopardy
              </button>
            </div>
          )}

        <JeopardyBoard
          board={board}
          backToBoard={returnToBoard}
          categoryShown={handleCategoryShown}
          chooseClue={chooseClue}
          categoriesShown={numCategoriesShown}
          currentCategory={currentCategoryIndex}
          currentClue={currentClueIndex}
          onSolutionToggle={onSolutionToggle}
        />
        <Scoreboard
          players={players}
          currentValue={
            currentCategoryIndex !== null && currentClueIndex !== null
              ? board[currentCategoryIndex].clues[currentClueIndex].value
              : null
          }
          updateScore={updateScore}
          wagering={
            currentCategoryIndex !== null &&
            currentClueIndex !== null &&
            board[currentCategoryIndex].clues[currentClueIndex].dailyDouble ===
              true
          }
          stats={false}
          solutionVisible={solutionVisible}
          usedAnswerPlayers={usedAnswerPlayers}
          setUsedAnswerPlayers={setUsedAnswerPlayers}
        />
      </div>
    );
  } else if (round === "final") {
    const final = game.final;
    return (
      <div>
        <FinalJeopardy final={final} onFinishGame={finishGame} />
        <Scoreboard
          players={players}
          currentValue={0}
          updateScore={updateScore}
          wagering={true}
          stats={false}
        />
      </div>
    );
  } else if (round === "done") {
    return (
      <div>
        <Scoreboard
          players={players}
          currentValue={null}
          updateScore={updateScore}
          wagering={false}
          stats={true}
        />
      </div>
    );
  } else {
    return <div>Error: Unknown game round.</div>;
  }
}

export default App;
