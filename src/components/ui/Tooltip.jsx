'use client';

import { useState } from 'react';

export default function Tooltip({ children, content, position = 'top' }) {
  const [show, setShow] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  const arrows = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-900',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-900',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-900',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-900',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      
      {show && (
        <div className={`absolute z-50 ${positions[position]}`}>
          <div className="relative">
            <div className="bg-gray-900 text-white text-sm rounded py-1 px-2 whitespace-nowrap">
              {content}
            </div>
            <div className={`absolute w-0 h-0 border-4 border-transparent ${arrows[position]}`} />
          </div>
        </div>
      )}
    </div>
  );
}