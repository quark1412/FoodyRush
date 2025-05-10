import { useState, useEffect } from "react";

export default function ColorDropdown({ value, onChange, colors = [] }) {
  const COLORS = colors.length > 0 ? colors : ["red", "blue", "green"];
  const [selectedColor, setSelectedColor] = useState(value || COLORS[0]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSelectedColor(value);
  }, [value]);

  const handleSelect = (color) => {
    setSelectedColor(color);
    setOpen(false);
    onChange && onChange(color);
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full font-semibold font-manrope px-5 py-3 border border-[#808191] focus:outline-none rounded-lg bg-transparent text-[#0a0a0a] text-sm flex justify-between items-center"
      >
        <div className="flex items-center gap-2 justify-between">
          <span
            className={`h-4 w-4 rounded-full`}
            style={{ backgroundColor: selectedColor }}
          ></span>
          <span className="">{selectedColor || "Chọn màu sắc"}</span>
        </div>
        <svg
          className={`w-4 h-4 transform transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M19 9l-7 7-7-7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul className="absolute mt-1 z-10 w-full h-40 overflow-y-scroll bg-white border rounded-md shadow-md">
          {COLORS.map((color, index) => (
            <li
              key={index}
              onClick={() => handleSelect(color)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            >
              <span
                className={`h-4 w-4 rounded-full`}
                style={{ backgroundColor: color }}
              ></span>
              <span className="font-medium font-manrope text-sm">{color}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
