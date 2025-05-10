import React from "react";

const SkeletonItem = () => {
  return (
    <div className="relative grid w-full max-w-64 flex-col overflow-hidden place-items-center rounded-lg border border-gray-100 bg-white shadow-md">
      <div className="mx-2 mt-3 flex h-50 overflow-hidden rounded-xl relative z-10 animate-pulse">
        <div className="bg-gray-300 h-60 w-56 rounded-lg"></div>
      </div>
      <div className="mt-2 px-4 pb-3 w-full z-10 animate-pulse">
        <div className="h-4 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 rounded mb-2"></div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonItem;
