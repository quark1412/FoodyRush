import React, { useState } from "react";

const Size = ({ size, isSelected, onClick }) => {
  return (
    <button
      className={`inline-block px-4 py-2 border rounded-md 
                        ${
                          isSelected
                            ? "bg-[#a93f15] text-white border-[#a93f15]"
                            : "bg-white text-[#a93f15] border-[#a93f15]"
                        } 
                        cursor-pointer transition-all duration-300`}
      onClick={onClick}
    >
      {size}
    </button>
  );
};

export default Size;
