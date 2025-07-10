import React from 'react';
import { BoardType } from '../types.ts';
import { Cell } from './Cell.tsx';

type Props = {
  board: BoardType;
};

export const Board: React.FC<Props> = ({ board }) => (
  <div
    className="grid gap-px bg-slate-900 border-4 border-slate-700 rounded-lg shadow-lg"
    style={{
      gridTemplateColumns: `repeat(${board[0].length}, 1fr)`,
      gridTemplateRows: `repeat(${board.length}, 1fr)`,
      width: 'min(90vw, 300px)',
      aspectRatio: `${board[0].length} / ${board.length}`
    }}
  >
    {board.map((row, y) =>
      row.map((cell, x) => <Cell key={`${y}-${x}`} type={cell[0]} />)
    )}
  </div>
);
