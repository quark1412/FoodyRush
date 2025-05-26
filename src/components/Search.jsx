export default function Search({ placeholder, onChange }) {
  return (
    <div className="px-4 py-1 bg-[#F9F9F9] rounded-lg flex flex-row items-center gap-x-3 w-fit">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
          stroke="black"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M21.0004 20.9999L16.6504 16.6499"
          stroke="black"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        className="w-40 font-semibold border-none outline-none bg-transparent text-gray-700 focus:ring-0 focus:outline-none placeholder:font-semibold text-sm"
        onChange={onChange}
      />
    </div>
  );
}
