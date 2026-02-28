'use client';

export default function Skeleton({ className = '', variant = 'text' }) {
  const variants = {
    text: 'h-4 rounded',
    circle: 'rounded-full',
    rectangular: 'rounded',
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 ${variants[variant]} ${className}`}
    />
  );
}

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-4">
    {/* Header */}
    <div className="flex space-x-4">
      {Array(columns).fill(0).map((_, i) => (
        <Skeleton key={`header-${i}`} className="h-8 flex-1" />
      ))}
    </div>
    
    {/* Rows */}
    {Array(rows).fill(0).map((_, i) => (
      <div key={`row-${i}`} className="flex space-x-4">
        {Array(columns).fill(0).map((_, j) => (
          <Skeleton key={`cell-${i}-${j}`} className="h-12 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonCard = () => (
  <div className="border rounded-lg p-4 space-y-3">
    <Skeleton className="h-6 w-2/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-4/5" />
    <div className="flex justify-between pt-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);