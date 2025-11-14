"use client";

import { useState, useEffect } from "react";
import { useHapticFeedback } from "@/lib/hooks";

const ACCENT = "var(--accent)";

type Game = "menu" | "snake" | "memory" | "tictactoe";
type Direction = "up" | "down" | "left" | "right";
type Position = { x: number; y: number };

const GAMES_LIST = [
  { id: "snake", name: "Snake", icon: "🐍", desc: "Classic snake game" },
  { id: "memory", name: "Memory Match", icon: "🎴", desc: "Match the pairs" },
  { id: "tictactoe", name: "Tic-Tac-Toe", icon: "⭕", desc: "Beat the AI" },
];

export default function BlackberryGamesContent() {
  const triggerHaptic = useHapticFeedback();
  const [currentGame, setCurrentGame] = useState<Game>("menu");

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="font-mono text-2xl uppercase text-white">
          <span style={{ color: ACCENT }}>/</span> GAMES
        </h1>
        {currentGame !== "menu" && (
          <button
            onClick={() => {
              triggerHaptic(10);
              setCurrentGame("menu");
            }}
            className="px-2 py-1 text-xs font-semibold text-white/70 hover:text-[var(--accent)]"
          >
            ← Menu
          </button>
        )}
      </div>

      {currentGame === "menu" ? (
        <GameMenu onSelectGame={(game) => setCurrentGame(game as Game)} />
      ) : currentGame === "snake" ? (
        <SnakeGame />
      ) : currentGame === "memory" ? (
        <MemoryGame />
      ) : currentGame === "tictactoe" ? (
        <TicTacToeGame />
      ) : null}
    </div>
  );
}

function GameMenu({ onSelectGame }: { onSelectGame: (game: string) => void }) {
  const triggerHaptic = useHapticFeedback();

  return (
    <div className="space-y-2">
      {GAMES_LIST.map((game) => (
        <button
          key={game.id}
          onClick={() => {
            triggerHaptic(10);
            onSelectGame(game.id);
          }}
          className="flex w-full items-center gap-3 border border-white/10 bg-black/30 p-3 text-left hover:border-[var(--accent)]/50"
        >
          <div className="text-3xl">{game.icon}</div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">{game.name}</div>
            <div className="text-xs text-white/50">{game.desc}</div>
          </div>
          <div className="text-xl text-white/30">→</div>
        </button>
      ))}
      <div className="mt-4 text-center text-xs text-white/40">
        Classic BB games · More coming soon
      </div>
    </div>
  );
}

// Snake Game
function SnakeGame() {
  const triggerHaptic = useHapticFeedback();
  const GRID_SIZE = 15;
  const INITIAL_SPEED = 150;

  const [snake, setSnake] = useState<Position[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Position>({ x: 10, y: 10 });
  const [direction, setDirection] = useState<Direction>("right");
  const [nextDirection, setNextDirection] = useState<Direction>("right");
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const generateFood = (snakeBody: Position[]) => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snakeBody.some((s) => s.x === newFood.x && s.y === newFood.y));
    return newFood;
  };

  const resetGame = () => {
    const initialSnake = [{ x: 7, y: 7 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection("right");
    setNextDirection("right");
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  };

  useEffect(() => {
    if (gameOver || isPaused) return;

    const interval = setInterval(() => {
      setDirection(nextDirection);

      setSnake((prevSnake) => {
        const head = prevSnake[0];
        let newHead: Position;

        switch (nextDirection) {
          case "up":
            newHead = { x: head.x, y: head.y - 1 };
            break;
          case "down":
            newHead = { x: head.x, y: head.y + 1 };
            break;
          case "left":
            newHead = { x: head.x - 1, y: head.y };
            break;
          case "right":
            newHead = { x: head.x + 1, y: head.y };
            break;
        }

        // Check wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, INITIAL_SPEED);

    return () => clearInterval(interval);
  }, [nextDirection, food, gameOver, isPaused]);

  const handleKeyPress = (dir: Direction) => {
    if (gameOver) return;

    const opposites: Record<Direction, Direction> = {
      up: "down",
      down: "up",
      left: "right",
      right: "left",
    };

    if (opposites[dir] !== direction) {
      setNextDirection(dir);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between border border-white/10 bg-black/30 p-2 text-xs text-white">
        <div>
          Score: <span className="text-[var(--accent)]">{score}</span>
        </div>
        <button
          onClick={() => {
            triggerHaptic(10);
            setIsPaused(!isPaused);
          }}
          className="px-2 py-1 text-white/70 hover:text-[var(--accent)]"
        >
          {isPaused ? "▶ Resume" : "⏸ Pause"}
        </button>
      </div>

      <div
        className="relative mx-auto border border-white/10 bg-black/50"
        style={{
          width: GRID_SIZE * 16,
          height: GRID_SIZE * 16,
        }}
      >
        {/* Grid */}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isSnake = snake.some((s) => s.x === x && s.y === y);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isFood = food.x === x && food.y === y;

          return (
            <div
              key={i}
              className="absolute border border-white/5"
              style={{
                left: x * 16,
                top: y * 16,
                width: 16,
                height: 16,
                backgroundColor: isHead
                  ? "var(--accent)"
                  : isSnake
                    ? "#FFC266"
                    : isFood
                      ? "#FF4444"
                      : "transparent",
              }}
            />
          );
        })}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <div className="mb-2 text-lg font-semibold text-white">Game Over!</div>
              <div className="mb-3 text-sm text-[var(--accent)]">Score: {score}</div>
              <button
                onClick={() => {
                  triggerHaptic(15);
                  resetGame();
                }}
                className="border-2 border-[var(--accent)] bg-[var(--accent)]/10 px-4 py-2 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-3">
        <div className="grid grid-cols-3 gap-1">
          <div />
          <button
            onClick={() => {
              triggerHaptic(10);
              handleKeyPress("up");
            }}
            className="border border-white/10 bg-black/30 py-2 text-white hover:border-[var(--accent)]/50"
          >
            ↑
          </button>
          <div />
          <button
            onClick={() => {
              triggerHaptic(10);
              handleKeyPress("left");
            }}
            className="border border-white/10 bg-black/30 py-2 text-white hover:border-[var(--accent)]/50"
          >
            ←
          </button>
          <button
            onClick={() => {
              triggerHaptic(10);
              handleKeyPress("down");
            }}
            className="border border-white/10 bg-black/30 py-2 text-white hover:border-[var(--accent)]/50"
          >
            ↓
          </button>
          <button
            onClick={() => {
              triggerHaptic(10);
              handleKeyPress("right");
            }}
            className="border border-white/10 bg-black/30 py-2 text-white hover:border-[var(--accent)]/50"
          >
            →
          </button>
        </div>
      </div>

      <div className="mt-3 text-center text-xs text-white/40">
        Use arrow buttons to control the snake
      </div>
    </div>
  );
}

// Memory Match Game
function MemoryGame() {
  const triggerHaptic = useHapticFeedback();
  const SYMBOLS = ["🎨", "🎭", "🎪", "🎸", "🎺", "🎹", "🎬", "🎮"];
  const [cards, setCards] = useState<{ id: number; symbol: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const gameSymbols = SYMBOLS.slice(0, 6);
    const doubled = [...gameSymbols, ...gameSymbols];
    const shuffled = doubled.sort(() => Math.random() - 0.5);
    setCards(shuffled.map((symbol, id) => ({ id, symbol, flipped: false, matched: false })));
    setFlippedIndices([]);
    setMoves(0);
    setCompleted(false);
  };

  const handleCardClick = (index: number) => {
    if (flippedIndices.length >= 2 || cards[index].flipped || cards[index].matched) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;
      if (newCards[first].symbol === newCards[second].symbol) {
        newCards[first].matched = true;
        newCards[second].matched = true;
        setCards(newCards);
        setFlippedIndices([]);

        if (newCards.every((c) => c.matched)) {
          setCompleted(true);
        }
      } else {
        setTimeout(() => {
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards(newCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between border border-white/10 bg-black/30 p-2 text-xs text-white">
        <div>
          Moves: <span className="text-[var(--accent)]">{moves}</span>
        </div>
        <button onClick={() => {
          triggerHaptic(10);
          initGame();
        }} className="px-2 py-1 text-white/70 hover:text-[var(--accent)]">
          ↻ Reset
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => {
              triggerHaptic(10);
              handleCardClick(index);
            }}
            className={`aspect-square border text-2xl transition-colors ${
              card.matched
                ? "border-[var(--accent)] bg-[var(--accent)]/20"
                : card.flipped
                  ? "border-white/30 bg-black/50"
                  : "border-white/10 bg-black/30 hover:border-white/30"
            }`}
            disabled={card.matched || card.flipped}
          >
            {card.flipped || card.matched ? card.symbol : "?"}
          </button>
        ))}
      </div>

      {completed && (
        <div className="mt-3 border border-[var(--accent)] bg-[var(--accent)]/10 p-3 text-center">
          <div className="mb-2 text-sm font-semibold text-white">🎉 Completed!</div>
          <div className="mb-2 text-xs text-[var(--accent)]">Moves: {moves}</div>
          <button
            onClick={() => {
              triggerHaptic(15);
              initGame();
            }}
            className="border-2 border-[var(--accent)] bg-black/50 px-3 py-1 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black"
          >
            Play Again
          </button>
        </div>
      )}

      <div className="mt-3 text-center text-xs text-white/40">Match all the pairs in fewest moves</div>
    </div>
  );
}

// Tic-Tac-Toe Game
function TicTacToeGame() {
  const triggerHaptic = useHapticFeedback();
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  const checkWinner = (squares: (string | null)[]): { winner: string | null; line: number[] | null } => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }

    if (squares.every((s) => s !== null)) {
      return { winner: "draw", line: null };
    }

    return { winner: null, line: null };
  };

  const getAIMove = (squares: (string | null)[]): number => {
    const available = squares.map((s, i) => (s === null ? i : null)).filter((i) => i !== null) as number[];
    return available[Math.floor(Math.random() * available.length)];
  };

  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      const timer = setTimeout(() => {
        const move = getAIMove(board);
        if (move !== undefined) {
          const newBoard = [...board];
          newBoard[move] = "O";
          setBoard(newBoard);
          const result = checkWinner(newBoard);
          if (result.winner) {
            setWinner(result.winner);
            setWinningLine(result.line);
          }
          setIsPlayerTurn(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, winner, board]);

  const handleClick = (index: number) => {
    if (board[index] || winner || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningLine(result.line);
    } else {
      setIsPlayerTurn(false);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
    setWinningLine(null);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between border border-white/10 bg-black/30 p-2 text-xs text-white">
        <div>
          {winner ? (
            winner === "draw" ? (
              <span className="text-white/70">Draw!</span>
            ) : winner === "X" ? (
              <span className="text-[var(--accent)]">You Win!</span>
            ) : (
              <span className="text-red-400">AI Wins!</span>
            )
          ) : isPlayerTurn ? (
            <span>Your Turn (X)</span>
          ) : (
            <span className="text-white/50">AI Thinking...</span>
          )}
        </div>
        <button onClick={() => {
          triggerHaptic(10);
          resetGame();
        }} className="px-2 py-1 text-white/70 hover:text-[var(--accent)]">
          ↻ Reset
        </button>
      </div>

      <div className="mx-auto grid w-fit grid-cols-3 gap-2">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => {
              triggerHaptic(10);
              handleClick(index);
            }}
            className={`flex h-16 w-16 items-center justify-center border text-2xl font-bold ${
              winningLine?.includes(index)
                ? "border-[var(--accent)] bg-[var(--accent)]/20"
                : "border-white/10 bg-black/30 hover:border-white/30"
            } ${cell === "X" ? "text-[var(--accent)]" : "text-white"}`}
            disabled={!!cell || !!winner || !isPlayerTurn}
          >
            {cell}
          </button>
        ))}
      </div>

      {winner && (
        <div className="mt-3 text-center">
          <button
            onClick={() => {
              triggerHaptic(15);
              resetGame();
            }}
            className="border-2 border-[var(--accent)] bg-[var(--accent)]/10 px-4 py-2 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black"
          >
            Play Again
          </button>
        </div>
      )}

      <div className="mt-3 text-center text-xs text-white/40">Play against the AI · You are X</div>
    </div>
  );
}
