import React from "react";
import Spinner from "./Spinner";

function LoadingOverlay({ content }) {
  return (
    <div className="absolute justify-center w-full h-full flex flex-col gap-y-5 items-center left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-sm">
      <Spinner />
      <p className="text-2xl font-bold">{content}</p>
    </div>
  );
}

export default LoadingOverlay;
