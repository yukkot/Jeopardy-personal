import { useEffect, useState, useRef } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Clue, GameRound } from "../types";
import "./JeopardyBoard.css";

interface JeopardyBoardProps {
  backToBoard: () => void;
  board: GameRound;
  categoryShown: () => void;
  categoriesShown: number;
  chooseClue: (categoryIndex: number, clueIndex: number) => void;
  currentCategory: number | null;
  currentClue: number | null;
  onSolutionToggle: (solutionVisible: boolean) => void;
}

function JeopardyBoard(props: JeopardyBoardProps) {
  const {
    backToBoard,
    board,
    categoryShown,
    categoriesShown,
    chooseClue,
    currentCategory,
    currentClue,
    onSolutionToggle,
  } = props;

  const [solution, setSolution] = useState(false);
  const clueDisplayRef = useRef<HTMLDivElement>(null);
  const persistentAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    document.addEventListener("keydown", clueKeyPress);
    return () => {
      document.removeEventListener("keydown", clueKeyPress);
    };
  });

  useEffect(() => {
    if (clueDisplayRef.current && currentCategory !== null && currentClue !== null && board[currentCategory]) {
      const clue = board[currentCategory].clues[currentClue];
      
      // SOLO reproducir audio HTML para valor 100
      if (clue.value === 100) {
        const audios = clueDisplayRef.current.querySelectorAll('audio');
        audios.forEach((audio) => {
          audio.style.display = 'audio';
          audio.volume = 0.3;
          audio.removeEventListener('volumechange', handleVolumeChange);
          audio.addEventListener('volumechange', handleVolumeChange);
        });
      } else {
        // Para otros valores, ocultar los audios HTML
        const audios = clueDisplayRef.current.querySelectorAll('audio');
        audios.forEach((audio) => {
          audio.pause();
          audio.style.display = 'none';
        });
      }

      // Controlar volumen de videos
      const videos = clueDisplayRef.current.querySelectorAll('video');
      videos.forEach((video) => {
        video.volume = 0.3;
        video.removeEventListener('volumechange', handleVolumeChange);
        video.addEventListener('volumechange', handleVolumeChange);
      });
    }

    // Controlar volumen del audio persistente
    if (persistentAudioRef.current) {
      persistentAudioRef.current.volume = 0.3;
      persistentAudioRef.current.removeEventListener('volumechange', handleVolumeChange);
      persistentAudioRef.current.addEventListener('volumechange', handleVolumeChange);
    }
  }, [solution, currentClue, currentCategory, board]);

  const handleVolumeChange = (e: Event) => {
    const element = e.target as HTMLMediaElement;
    if (element.volume > 0.3) {
      element.volume = 0.3;
    }
  };

  useEffect(() => {
    // Detener audio al cambiar de pista o volver al tablero
    if (currentClue === null || currentCategory === null) {
      if (persistentAudioRef.current) {
        persistentAudioRef.current.pause();
        persistentAudioRef.current.currentTime = 0;
      }
    } else if (currentCategory !== null && currentClue !== null && board[currentCategory]) {
      // Extraer URL del audio del clue usando regex
      const clue = board[currentCategory].clues[currentClue];
      
      // EXCLUIR valor 100
      if (clue && clue.clue && clue.value !== 100) {
        const audioRegex = /<source\s+src=["']([^"']+)["']\s+type=["']audio/;
        const match = clue.clue.match(audioRegex);
        if (match && match[1] && persistentAudioRef.current) {
          persistentAudioRef.current.src = match[1];
          persistentAudioRef.current.play();
        }
      } else if (persistentAudioRef.current) {
        // Si es valor 100, detener el audio
        persistentAudioRef.current.pause();
        persistentAudioRef.current.currentTime = 0;
      }
    }
  }, [currentClue, currentCategory, board]);

  function renderCategory(index: number) {
    const category = board[index];
    return (
      <div onClick={categoryShown} className="category-container">
        <TransitionGroup>
          <CSSTransition key={index} timeout={1000} classNames="categorybox">
            <div className="category-box">
              {category.html === true ? (
                <div
                  className="category"
                  dangerouslySetInnerHTML={{ __html: category.category }}
                />
              ) : (
                <div className="category">{category.category}</div>
              )}
            </div>
          </CSSTransition>
        </TransitionGroup>
      </div>
    );
  }

  function renderClue(categoryName: string, categoryHasHtml: boolean, clue: Clue, value: number) {
    return (
      <div
        onClick={solution ? returnToBoard : toggleSolution}
        className="clue"
      >
        <div className="clue-category-label">
          {categoryHasHtml ? (
            <span dangerouslySetInnerHTML={{ __html: categoryName }} />
          ) : (
            categoryName
          )}
          {" - $"}{clue.value}
        </div>
        <div ref={clueDisplayRef} className="clue-display">
          <br />
          {clue.html === true ? (
            <div
              dangerouslySetInnerHTML={{
                __html: solution ? clue.solution : clue.clue,
              }}
            />
          ) : solution ? (
            clue.solution
          ) : (
            clue.clue
          )}
        </div>
        <audio 
          ref={persistentAudioRef}
          controls 
          style={{ display: 'none' }}
        ></audio>
      </div>
    );
  }

  function clueKeyPress(event: KeyboardEvent) {
    // First check for categoriesShown
    if (
      categoriesShown < board.length &&
      currentCategory === null &&
      currentClue === null &&
      (event.key === " " || event.key === "Enter")
    ) {
      categoryShown();
    }

    if (currentCategory === null || currentClue === null) {
      return;
    }

    if (event.key === " " || event.key === "Enter") {
      toggleSolution();
    } else if (event.key === "Escape") {
      returnToBoard();
    }
  }

  function returnToBoard() {
    setSolution(false);
    onSolutionToggle(false);
    backToBoard();
  }

  function toggleSolution() {
    setSolution(!solution);
    onSolutionToggle(!solution);
  }

  // First check for if we need to present categories
  if (categoriesShown < board.length) {
    return renderCategory(categoriesShown);
  }

  // Check if there is a clue to present
  if (currentCategory !== null && currentClue !== null) {
    return renderClue(
      board[currentCategory].category,
      board[currentCategory].html === true,
      board[currentCategory].clues[currentClue],
      board[currentCategory].clues[currentClue].value
    );
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            {board.map((category, i) => (
              <td key={i} className="category-title">
                {category.html === true ? (
                  <div dangerouslySetInnerHTML={{ __html: category.category }} />
                ) : (
                  category.category
                )}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {board[0].clues.map((_, j) => {
            return (
              <tr key={j}>
                {board.map((category, i) => {
                  if (category.clues[j].chosen) {
                    return <td key={i} className="board-clue"></td>;
                  }
                  return (
                    <td
                      key={i}
                      onClick={() => chooseClue(i, j)}
                      className="board-clue"
                    >
                      ${category.clues[j].value}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default JeopardyBoard;
