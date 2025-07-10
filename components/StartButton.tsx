import React from 'react';

type Props = {
  onClick: () => void;
  text: string;
};

export const StartButton: React.FC<Props> = ({ onClick, text }) => (
  <button
    className="px-6 py-3 w-full text-lg font-bold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-200 ease-in-out transform hover:scale-105"
    onClick={onClick}
  >
    {text}
  </button>
);
