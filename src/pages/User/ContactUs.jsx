import Banner from "../../components/Banner";

function ContactUs() {
  return (
    <div>
      <Banner title="Liên hệ" route="Trang chủ / Liên hệ" />
      <div className="px-40 flex justify-center my-20 relative">
        <iframe
          src="https://maps.google.com/maps?q=10.8817848,106.7805564&z=15&output=embed"
          frameborder="0"
          className="border-none absolute w-full h-96"
        ></iframe>
        <div
          className="flex mt-[400px] gap-x-5 rounded-lg px-10 justify-between py-14 w-10/12 items-start relative z-10 bg-white"
          style={{
            boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div className="flex flex-col justify-center items-center">
            <div className="p-4 bg-[#ececec] rounded-lg flex justify-center items-center w-fit mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
            </div>
            <p className="font-medium text-2xl mb-5">Địa chỉ</p>
            <p className="mb-2">KTX Khu B</p>
            <p>Đại học Quốc gia TP.HCM</p>
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="p-4 bg-[#ececec] rounded-lg flex justify-center items-center w-fit mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                />
              </svg>
            </div>
            <p className="font-medium text-2xl mb-5">Số điện thoại</p>
            <p>Văn phòng: 0123456789</p>
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="p-4 bg-[#ececec] rounded-lg flex justify-center items-center w-fit mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.039a2.25 2.25 0 0 1 2.134 0l7.5 4.039a2.25 2.25 0 0 1 1.183 1.98V19.5Z"
                />
              </svg>
            </div>
            <p className="font-medium text-2xl mb-5">Email</p>
            <p>foodyrush@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
