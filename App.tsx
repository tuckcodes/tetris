
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { BOARD_WIDTH, TETROMINOS, randomTetromino } from './constants';
import { createBoard, checkCollision } from './services/gameHelpers';
import { Player, BoardType, TetrominoKey, BoardCell } from './types';
import Board from './components/Board';
import InfoDisplay from './components/InfoDisplay';
import StartButton from './components/StartButton';

// Custom hook for game interval
const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef<(() => void) | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

const App: React.FC = () => {
    const [player, setPlayer] = useState<Player>({
        pos: { x: 0, y: 0 },
        tetromino: TETROMINOS[0].shape,
        collided: false,
    });
    const [board, setBoard] = useState<BoardType>(createBoard());
    const [score, setScore] = useState(0);
    const [rows, setRows] = useState(0);
    const [level, setLevel] = useState(0);
    const [gameOver, setGameOver] = useState(true);
    const [dropTime, setDropTime] = useState<number | null>(null);

    const gameAreaRef = useRef<HTMLDivElement>(null);

    const LINE_POINTS = [40, 100, 300, 1200];

    const resetPlayer = useCallback(() => {
        const newTetromino = randomTetromino();
        setPlayer({
            pos: { x: BOARD_WIDTH / 2 - 1, y: 0 },
            tetromino: TETROMINOS[newTetromino].shape,
            collided: false,
        });
    }, []);

    const startGame = useCallback(() => {
        setBoard(createBoard());
        resetPlayer();
        setScore(0);
        setRows(0);
        setLevel(0);
        setGameOver(false);
        setDropTime(1000);
        if (gameAreaRef.current) gameAreaRef.current.focus();
    }, [resetPlayer]);

    const movePlayer = useCallback((dir: number) => {
        if (!checkCollision(player, board, { x: dir, y: 0 })) {
            setPlayer(prev => ({
                ...prev,
                pos: { x: (prev.pos.x += dir), y: prev.pos.y },
            }));
        }
    }, [board, player]);

    const playerRotate = useCallback((board: BoardType, dir: number) => {
        const clonedPlayer: Player = JSON.parse(JSON.stringify(player));
        clonedPlayer.tetromino = clonedPlayer.tetromino[0].map((_, colIndex) =>
            clonedPlayer.tetromino.map(row => row[colIndex])
        );

        if (dir > 0) {
            clonedPlayer.tetromino = clonedPlayer.tetromino.map(row => row.reverse());
        } else {
            clonedPlayer.tetromino.reverse();
        }

        const pos = clonedPlayer.pos.x;
        let offset = 1;
        while (checkCollision(clonedPlayer, board, { x: 0, y: 0 })) {
            clonedPlayer.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > clonedPlayer.tetromino[0].length) {
                clonedPlayer.pos.x = pos; // Revert
                return;
            }
        }
        setPlayer(clonedPlayer);
    }, [player]);

    const drop = useCallback(() => {
        if (rows > (level + 1) * 10) {
            setLevel(prev => prev + 1);
            setDropTime(1000 / (level + 1) + 200);
        }

        if (!checkCollision(player, board, { x: 0, y: 1 })) {
            setPlayer(prev => ({
                ...prev,
                pos: { x: prev.pos.x, y: prev.pos.y + 1 },
                collided: false,
            }));
        } else {
            if (player.pos.y < 1) {
                setGameOver(true);
                setDropTime(null);
                return;
            }
            setPlayer(prev => ({
                ...prev,
                collided: true,
            }));
        }
    }, [board, level, player, rows]);

    const dropPlayer = useCallback(() => {
        setDropTime(null);
        drop();
    }, [drop]);

    const keyUp = useCallback(({ keyCode }: { keyCode: number }) => {
        if (!gameOver) {
            if (keyCode === 40) { // Down arrow
                setDropTime(1000 / (level + 1) + 200);
            }
        }
    }, [gameOver, level]);

    const move = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!gameOver) {
            e.preventDefault();
            if (e.keyCode === 37) { // Left
                movePlayer(-1);
            } else if (e.keyCode === 39) { // Right
                movePlayer(1);
            } else if (e.keyCode === 40) { // Down
                dropPlayer();
            } else if (e.keyCode === 38) { // Up
                playerRotate(board, 1);
            }
        }
    }, [gameOver, movePlayer, dropPlayer, playerRotate, board]);

    useEffect(() => {
        if (player.collided) {
            const newBoard = (prevBoard: BoardType): BoardType => {
                const newB = prevBoard.map(row =>
                    row.map(cell => [...cell] as BoardCell)
                );

                player.tetromino.forEach((row, y) => {
                    row.forEach((value, x) => {
                        if (value !== 0) {
                            newB[y + player.pos.y][x + player.pos.x] = [
                                value,
                                'merged',
                            ];
                        }
                    });
                });

                // Sweep for lines
                const rowsToClear: number[] = [];
                for (let y = 0; y < newB.length; y++) {
                  if (newB[y].every(cell => cell[1] === 'merged')) {
                    rowsToClear.push(y);
                  }
                }
                
                if (rowsToClear.length > 0) {
                  setRows(prev => prev + rowsToClear.length);
                  setScore(prev => prev + LINE_POINTS[rowsToClear.length - 1] * (level + 1));
                  
                  // Create new board with cleared rows
                  const sweptBoard = newB.filter((_, index) => !rowsToClear.includes(index));
                  const newRows = Array.from({ length: rowsToClear.length }, (): BoardCell[] => 
                    Array.from({ length: BOARD_WIDTH }, (): BoardCell => [0, 'clear'])
                  );

                  return [...newRows, ...sweptBoard];
                }

                return newB;
            };
            setBoard(newBoard);
            resetPlayer();
            setDropTime(1000 / (level + 1) + 200);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [player.collided, resetPlayer, level]);

    useInterval(drop, dropTime);

    // Create a new board for rendering that includes the current player's tetromino
    const displayBoard = board.map(row => row.map(cell => [...cell] as BoardCell));

    if (!gameOver) {
      player.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const boardY = y + player.pos.y;
            const boardX = x + player.pos.x;
            if (
              boardY >= 0 &&
              boardY < board.length &&
              boardX >= 0 &&
              boardX < board[0].length
            ) {
              displayBoard[boardY][boardX] = [value, 'clear'];
            }
          }
        });
      });
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    React Tetris
                </h1>
                <div className="flex flex-col md:flex-row gap-8 justify-center">
                    <div
                        className="relative"
                        ref={gameAreaRef}
                        role="button"
                        tabIndex={0}
                        onKeyDown={move}
                        onKeyUp={keyUp}
                        style={{ outline: 'none' }}
                    >
                        <Board board={displayBoard} />
                        {gameOver && (
                            <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-75 flex flex-col justify-center items-center rounded-lg z-10">
                                <h2 className="text-4xl font-bold text-white mb-2">Game Over</h2>
                                <p className="text-slate-300 mb-6">Final Score: {score}</p>
                                <StartButton onClick={startGame} text="Play Again" />
                            </div>
                        )}
                    </div>
                    <aside className="w-full md:w-64 flex flex-col gap-4">
                        {gameOver ? (
                            <div className="bg-slate-800 p-6 rounded-lg text-center shadow-lg">
                                <h3 className="text-xl font-bold mb-4">Welcome!</h3>
                                <p className="text-slate-300 mb-6">Use the arrow keys to play.</p>
                                <StartButton onClick={startGame} text="Start Game" />
                            </div>
                        ) : (
                            <>
                                <InfoDisplay label="Score" value={score} />
                                <InfoDisplay label="Rows" value={rows} />
                                <InfoDisplay label="Level" value={level} />
                            </>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default App;
