
import React from 'react';
import { BoardType } from '../types';
import { Cell } from './Cell';

type Props = {
  board: BoardType;
};

const Board: React.FC<Props> = ({ board }) => {
  return (
    <div
      className="grid bg-slate-900"
      style={{
        gridTemplateColumns: `repeat(${board[0].length}, 1fr)`,
        gridTemplateRows: `repeat(${board.length}, 1fr)`,
        width: '100%',
        maxWidth: '25rem',
        maxHeight: '50rem',
        aspectRatio: `${board[0].length} / ${board.length}`,
        border: '4px solid #334155', // slate-700
        borderRadius: '8px',
      }}
    >
      {board.map((row, y) =>
        row.map((cell, x) => <Cell key={`${y}-${x}`} type={cell[0]} />)
      )}
    </div>
  );
};

export default Board;
