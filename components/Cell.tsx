
import React from 'react';
import { TETROMINOS } from '../constants';
import { TetrominoKey } from '../types';

type Props = {
  type: TetrominoKey;
};

const CellComponent: React.FC<Props> = ({ type }) => {
  const color = TETROMINOS[type].color;
  const borderClass = type === 0 
    ? 'border-slate-900/50' 
    : 'border-slate-500/30';
  
  return (
    <div className={`w-full aspect-square ${color} border ${borderClass}`}></div>
  );
};

export const Cell = React.memo(CellComponent);
