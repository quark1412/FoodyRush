function Banner({ title, route }) {
  return (
    <div className="bg-[#f5f5f5] w-full h-[150px] flex flex-col justify-center items-center relative z-10 overflow-hidden">
      <img
        src={require("../assets/images/background_pattern.png")}
        alt=""
        className="absolute w-[20%] min-w-[150px] max-w-[200px] bottom-[-10%] left-[10%] z-0"
      />
      <img
        src={require("../assets/images/background_pattern.png")}
        alt=""
        className="absolute w-[20%] min-w-[150px] max-w-[200px] top-[-10%] right-[10%] z-0"
      />
      <div className="flex flex-col gap-y-3 justify-center items-center">
        <div className="font-bold text-[28px]">{title}</div>
        <div className="text-[#636363]">{route}</div>
      </div>
    </div>
  );
}

export default Banner;
