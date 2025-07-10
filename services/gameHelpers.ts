import { BOARD_WIDTH, BOARD_HEIGHT } from '../constants.ts';
import { BoardType, Player, BoardCell } from '../types.ts';

export const createBoard = (): BoardType =>
  Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, (): BoardCell => [0, 'clear'])
  );

export const checkCollision = (
  player: Player,
  board: BoardType,
  { x: moveX, y: moveY }: { x: number; y: number }
): boolean => {
  for (let y = 0; y < player.tetromino.length; y += 1) {
    for (let x = 0; x < player.tetromino[y].length; x += 1) {
      if (player.tetromino[y][x] !== 0) {
        if (
          !board[y + player.pos.y + moveY] ||
          !board[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
          board[y + player.pos.y + moveY][x + player.pos.x + moveX][1] === 'merged'
        ) {
          return true;
        }
      }
    }
  }
  return false;
};