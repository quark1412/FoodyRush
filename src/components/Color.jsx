function Color({ color, isSelected, onClick }) {
  return (
    <button
      className={`w-10 h-10 rounded-full flex items-center justify-center border-2
      ${
        isSelected ? `border-${color}` : "border-gray-300"
      } transition-all duration-200`}
      style={{
        borderColor: isSelected ? color : "#D9D9D9",
      }}
      onClick={onClick}
    >
      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
        <div
          className={`w-[30px] h-[30px] rounded-full`}
          style={{ backgroundColor: color }}
        ></div>
      </div>
    </button>
  );
}

export default Color;
