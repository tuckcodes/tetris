
export type PieceKey = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';
export type TetrominoKey = 0 | PieceKey;

export type BoardCell = [TetrominoKey, 'clear' | 'merged'];

export type BoardType = BoardCell[][];

export type TetrominoShape = (PieceKey | 0)[][];

export type Player = {
  pos: { x: number; y: number };
  tetromino: TetrominoShape;
  collided: boolean;
};
