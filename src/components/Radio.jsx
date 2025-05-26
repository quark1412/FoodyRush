import React from "react";

export default function Radio({ value, checked, onChange }) {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
        className="appearance-none w-5 h-5 border-2 border-[#a93f15] rounded-full
                   flex items-center justify-center
                   checked:bg-transparent checked:outline-none focus:outline-none checked:ring-0 focus:ring-0 checked:border-[#a93f15]
                   relative"
      />
      <span
        className={`absolute translate-x-1/3 w-3 h-3 bg-[#a93f15] rounded-full transition
                    ${checked ? "scale-100" : "scale-0"}`}
      ></span>
    </label>
  );
}
