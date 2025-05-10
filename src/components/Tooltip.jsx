function Tooltip({ message, show }) {
  return (
    show && (
      <div className="relative">
        <div className="absolute bg-red-500 text-white text-sm p-2 rounded-lg shadow-lg -top-10 left-0">
          {message}
        </div>
      </div>
    )
  );
}

export default Tooltip;
