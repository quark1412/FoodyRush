import { useState, useEffect, useRef } from "react";
import instance from "../services/axiosConfig";
import ProductItem from "./ProductItem";
import { ORDER_STATUS } from "../utils/Constants";
import OrderStatus from "./OrderStatus";
import { formatDate, getTime } from "../utils/format";
import { useNavigate } from "react-router-dom";

const status = [
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18.6673 2.66699H8.00065C7.29341 2.66699 6.61513 2.94794 6.11503 3.44804C5.61494 3.94814 5.33398 4.62641 5.33398 5.33366V26.667C5.33398 27.3742 5.61494 28.0525 6.11503 28.5526C6.61513 29.0527 7.29341 29.3337 8.00065 29.3337H24.0006C24.7079 29.3337 25.3862 29.0527 25.8863 28.5526C26.3864 28.0525 26.6673 27.3742 26.6673 26.667V10.667L18.6673 2.66699Z"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M18.666 2.66699V10.667H26.666"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M21.3327 17.333H10.666"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M21.3327 22.667H10.666"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M13.3327 12H11.9993H10.666"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
    status: ORDER_STATUS.PENDING,
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21.333 5.33301H23.9997C24.7069 5.33301 25.3852 5.61396 25.8853 6.11406C26.3854 6.61415 26.6663 7.29243 26.6663 7.99967V26.6663C26.6663 27.3736 26.3854 28.0519 25.8853 28.552C25.3852 29.0521 24.7069 29.333 23.9997 29.333H7.99967C7.29243 29.333 6.61415 29.0521 6.11406 28.552C5.61396 28.0519 5.33301 27.3736 5.33301 26.6663V7.99967C5.33301 7.29243 5.61396 6.61415 6.11406 6.11406C6.61415 5.61396 7.29243 5.33301 7.99967 5.33301H10.6663"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M20.0003 2.66699H12.0003C11.2639 2.66699 10.667 3.26395 10.667 4.00033V6.66699C10.667 7.40337 11.2639 8.00033 12.0003 8.00033H20.0003C20.7367 8.00033 21.3337 7.40337 21.3337 6.66699V4.00033C21.3337 3.26395 20.7367 2.66699 20.0003 2.66699Z"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M20 16L14.5 21.5L12 19"
          stroke="#0A0A0A"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
    status: ORDER_STATUS.ACCEPTED,
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M28.2809 21.1868C27.4326 23.1927 26.1059 24.9604 24.4167 26.3352C22.7275 27.71 20.7272 28.65 18.5908 29.0731C16.4543 29.4963 14.2468 29.3896 12.1611 28.7625C10.0754 28.1354 8.17503 27.0069 6.62622 25.4756C5.07741 23.9444 3.92728 22.0571 3.27638 19.9787C2.62547 17.9003 2.49361 15.6941 2.89233 13.5529C3.29104 11.4118 4.20819 9.40094 5.56359 7.69614C6.91899 5.99135 8.67137 4.64453 10.6675 3.77344"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M29.3333 16.0003C29.3333 14.2494 28.9885 12.5156 28.3184 10.8979C27.6483 9.2802 26.6662 7.81035 25.4281 6.57223C24.19 5.33412 22.7201 4.35199 21.1024 3.68193C19.4848 3.01187 17.751 2.66699 16 2.66699V16.0003H29.3333Z"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
    status: ORDER_STATUS.PROCESSING,
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21.333 4H1.33301V21.3333H21.333V4Z"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M21.333 10.667H26.6663L30.6663 14.667V21.3337H21.333V10.667Z"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M7.33333 27.9997C9.17428 27.9997 10.6667 26.5073 10.6667 24.6663C10.6667 22.8254 9.17428 21.333 7.33333 21.333C5.49238 21.333 4 22.8254 4 24.6663C4 26.5073 5.49238 27.9997 7.33333 27.9997Z"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M24.6663 27.9997C26.5073 27.9997 27.9997 26.5073 27.9997 24.6663C27.9997 22.8254 26.5073 21.333 24.6663 21.333C22.8254 21.333 21.333 22.8254 21.333 24.6663C21.333 26.5073 22.8254 27.9997 24.6663 27.9997Z"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
    status: ORDER_STATUS.IN_DELIVERY,
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22 12.5333L10 5.61328"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M28 21.3329V10.6662C27.9995 10.1986 27.8761 9.73929 27.6421 9.33443C27.408 8.92956 27.0717 8.59336 26.6667 8.35954L17.3333 3.02621C16.9279 2.79216 16.4681 2.66895 16 2.66895C15.5319 2.66895 15.0721 2.79216 14.6667 3.02621L5.33333 8.35954C4.92835 8.59336 4.59197 8.92956 4.35795 9.33443C4.12392 9.73929 4.00048 10.1986 4 10.6662V21.3329C4.00048 21.8005 4.12392 22.2598 4.35795 22.6647C4.59197 23.0695 4.92835 23.4057 5.33333 23.6395L14.6667 28.9729C15.0721 29.2069 15.5319 29.3301 16 29.3301C16.4681 29.3301 16.9279 29.2069 17.3333 28.9729L26.6667 23.6395C27.0717 23.4057 27.408 23.0695 27.6421 22.6647C27.8761 22.2598 27.9995 21.8005 28 21.3329Z"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M4.35938 9.28027L15.9994 16.0136L27.6394 9.28027"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M16 29.44V16"
          stroke="#0A0A0A"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
    status: ORDER_STATUS.SHIPPED,
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M56.35 52.8L51.025 47.5L56.35 42.2L52.8 38.65L47.5 43.975L42.2 38.65L38.65 42.2L43.975 47.5L38.65 52.8L42.2 56.35L47.5 51.025L52.8 56.35M15 5C13.6739 5 12.4021 5.52678 11.4645 6.46447C10.5268 7.40215 10 8.67392 10 10V50C10 52.775 12.225 55 15 55H34.525C33.625 53.45 33 51.75 32.7 50H15V10H32.5V22.5H45V32.7C45.825 32.575 46.675 32.5 47.5 32.5C48.35 32.5 49.175 32.575 50 32.7V20L35 5M20 30V35H40V30M20 40V45H32.5V40H20Z"
          fill="black"
        />
      </svg>
    ),
    status: ORDER_STATUS.CANCELLED_BY_EMPLOYEE,
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M56.35 52.8L51.025 47.5L56.35 42.2L52.8 38.65L47.5 43.975L42.2 38.65L38.65 42.2L43.975 47.5L38.65 52.8L42.2 56.35L47.5 51.025L52.8 56.35M15 5C13.6739 5 12.4021 5.52678 11.4645 6.46447C10.5268 7.40215 10 8.67392 10 10V50C10 52.775 12.225 55 15 55H34.525C33.625 53.45 33 51.75 32.7 50H15V10H32.5V22.5H45V32.7C45.825 32.575 46.675 32.5 47.5 32.5C48.35 32.5 49.175 32.575 50 32.7V20L35 5M20 30V35H40V30M20 40V45H32.5V40H20Z"
          fill="black"
        />
      </svg>
    ),
    status: ORDER_STATUS.CANCELLED_BY_YOU,
  },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Xin chào, tôi là trợ lí ảo FoodyBot. Tôi có thể giúp gì cho bạn?",
    },
  ]);
  const [content, setContent] = useState("");
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const getStatusObjectByStatus = (statusValue) => {
    return status.find((item) => item.status === statusValue);
  };

  const handleSend = async () => {
    if (content.trim() === "") return;

    const userMessage = { sender: "user", text: content };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setContent("");

    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    try {
      const response = await instance.post(
        "/chatbot",
        { message: content },
        { requiresAuth: false }
      );
      console.log(response.data);
      const type = response.data.type;
      const botMessage = {
        sender: "bot",
        text:
          response.data.message === "" && response.data.data
            ? "Xin lỗi, tôi không thể xử lý yêu cầu của bạn. Vui lòng thử lại."
            : response.data.message,
        results: response.data.data
          ? type === "Product"
            ? response.data.data
            : {
                orderTracking: response.data.data.deliveryInfo,
                orderDetail: response.data.data.orderItems,
                orderId: response.data.data._id,
              }
          : null,
        type: response.data.type,
        textEnd: response.data.messageEnd,
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);

      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.log(error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: "bot",
          text: "Xin lỗi, tôi không thể xử lý yêu cầu của bạn. Vui lòng thử lại.",
        },
      ]);

      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleTrackOrder = (orderId, trackingData, orderDetail) => {
    navigate(`/trackOrder/${orderId}`, {
      state: { trackingData: trackingData, orderDetail: orderDetail },
    });
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div>
      <button
        onClick={toggleChat}
        style={{
          boxShadow: "0px 0px 15px rgba(255, 255, 255, 0.5)",
        }}
        className="fixed bottom-5 z-20 right-5 bg-[#FF7E4C] text-white p-2 rounded-full shadow-lg transition-transform transform hover:scale-105"
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 61 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.3826 73.6156L9.44141 38.0393C9.44141 38.0393 12.4061 41.9917 18.8296 42.2388C25.2531 42.4858 35.1599 32.1306 40.0766 34.0863L34.1472 73.6156H14.3826Z"
            fill="#A93F15"
          />
          <path
            d="M48.4551 27.9204L40.7959 78.3208L40.541 79.9995H7.72656L7.48535 78.3013L0.320312 27.9019L0 25.647H33.5322C33.9331 27.0977 34.5992 28.4331 35.4756 29.6001H4.55469L11.1572 76.0474H37.1426L43.4834 34.3208L46.7402 35.1118L47.5557 31.7515L44.0049 30.8882L44.2012 29.6001H40.5049C39.0185 28.6718 37.847 27.2929 37.1787 25.647H48.7998L48.4551 27.9204Z"
            fill="white"
          />
          <path
            d="M42.794 2.72135L41.0723 17.6217C40.9317 18.8385 41.8023 19.9406 43.0186 20.0856C44.2406 20.2311 45.3485 19.3559 45.4903 18.1335L47.2168 3.24869L51.6885 3.78287L49.9668 18.651C49.8259 19.868 50.6966 20.9698 51.9131 21.1149C53.1351 21.2605 54.2429 20.3861 54.3848 19.1637L56.1065 4.31022L54.1612 4.07682L56.1055 4.30924H56.1065V4.31119L58.4424 4.58756L60.4864 4.8317L58.2774 23.3424C57.6147 28.8973 52.5744 32.8635 47.0196 32.2008L45.0576 31.9665C39.5027 31.3038 35.5366 26.2636 36.1993 20.7087L38.4073 2.19791L42.794 2.72135ZM58.6094 1.98111C59.839 2.12773 60.7074 3.25717 60.5332 4.48307L60.4834 4.82975L58.4424 4.58756L56.1065 4.30924L56.1592 3.8942C56.3121 2.69188 57.4059 1.83774 58.6094 1.98111ZM49.7237 0.998692L49.7715 1.00455C50.9677 1.14719 51.833 2.21614 51.7227 3.41568L51.6895 3.7819L54.1612 4.07682L51.6885 3.78287H51.6895L47.2178 3.24869L47.251 2.95377C47.3913 1.72976 48.5003 0.852817 49.7237 0.998692ZM47.2168 3.24869L42.794 2.72135L42.795 2.7194L47.2168 3.24869ZM40.8848 0.0162705C42.0759 0.15849 42.9356 1.22537 42.8223 2.41959L42.794 2.7194L38.4063 2.19596L38.4209 2.02701C38.5249 0.780191 39.6424 -0.131875 40.8848 0.0162705Z"
            fill="white"
          />
          <path
            d="M38.8408 78.0239L46.4996 27.624"
            stroke="white"
            stroke-width="3.95293"
          />
          <circle cx="20.3124" cy="49.8973" r="2.71764" fill="white" />
          <circle cx="26.7362" cy="59.2856" r="1.72941" fill="white" />
          <circle cx="24.0185" cy="67.4384" r="0.988233" fill="white" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-5 w-80 bg-white shadow-lg rounded-lg flex flex-col z-20">
          <div className="flex justify-between items-center p-2 border-b border-gray-200">
            <div className="flex gap-x-1 items-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 37 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.62973 44.1691L5.66504 22.8233C5.66504 22.8233 7.44385 25.1948 11.2979 25.343C15.152 25.4913 21.0961 19.2782 24.0461 20.4516L20.4885 44.1691H8.62973Z"
                  fill="#A93F15"
                />
                <path
                  d="M29.0723 16.7518L24.4775 46.992L24.3242 47.9998H4.63574L4.49121 46.9803L0.192383 16.741L0 15.3885H20.1201C20.3607 16.2587 20.7604 17.0596 21.2861 17.7596H2.73242L6.69434 45.6278H22.2861L26.0898 20.5916L28.0439 21.0672L28.5342 19.0506L26.4023 18.5321L26.5205 17.7596H24.3066C23.4137 17.2028 22.7091 16.3767 22.3076 15.3885H29.2803L29.0723 16.7518Z"
                  fill="#0A0A0A"
                />
                <path
                  d="M25.6762 1.63281L24.6439 10.5732C24.5598 11.3031 25.0814 11.9637 25.8109 12.0508C26.5442 12.1382 27.2092 11.6134 27.2943 10.8799L28.3295 1.94922L31.0131 2.26855L29.9809 11.1904C29.8963 11.9206 30.418 12.5819 31.1479 12.6689C31.8812 12.7564 32.5462 12.2316 32.6313 11.498L33.6635 2.58594L34.977 2.74121L36.2914 2.89844L34.9662 14.0049C34.5686 17.3378 31.5443 19.7179 28.2113 19.3203L27.0346 19.1797C23.7017 18.7821 21.3216 15.7577 21.7191 12.4248L23.0443 1.31836L25.6762 1.63281ZM35.1654 1.18848C35.9032 1.27645 36.4243 1.95387 36.3197 2.68945L36.2904 2.89746L33.6635 2.58496L33.6947 2.33594C33.7865 1.61452 34.4433 1.10241 35.1654 1.18848ZM29.8344 0.598632L29.8627 0.601562C30.5804 0.687143 31.0998 1.3291 31.0336 2.04883L31.0131 2.26855L28.3305 1.94922L28.351 1.77148C28.4351 1.03708 29.1004 0.511107 29.8344 0.598632ZM28.3305 1.94824L28.3295 1.94922L25.6762 1.63281L25.6771 1.63184L28.3305 1.94824ZM24.5307 0.00976525C25.2454 0.0950276 25.7617 0.734625 25.6938 1.45117L25.6762 1.63184L23.0443 1.31738L23.0521 1.21582C23.1145 0.467717 23.7852 -0.0791227 24.5307 0.00976525Z"
                  fill="#0A0A0A"
                />
                <path
                  d="M23.3047 46.8142L27.9 16.5743"
                  stroke="#0A0A0A"
                  stroke-width="2.37175"
                />
                <circle cx="12.1872" cy="29.9383" r="1.63058" fill="white" />
                <circle cx="16.0415" cy="35.5713" r="1.03764" fill="white" />
                <circle cx="14.4113" cy="40.4629" r="0.592938" fill="white" />
              </svg>
              <p className="text-sm">Chatbot</p>
            </div>
            <button
              onClick={toggleChat}
              className="text-sm text-gray-500 hover:text-gray-800 p-2 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="size-6"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div className="h-[440px] overflow-y-auto px-2 pt-2 shadow-inner flex flex-col">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 ${
                  msg.sender === "user" ? "text-right" : "text-left"
                }`}
              >
                {msg.sender === "bot" && (
                  <div className="mb-2 flex gap-x-1 items-center">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 37 48"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.62973 44.1691L5.66504 22.8233C5.66504 22.8233 7.44385 25.1948 11.2979 25.343C15.152 25.4913 21.0961 19.2782 24.0461 20.4516L20.4885 44.1691H8.62973Z"
                        fill="#A93F15"
                      />
                      <path
                        d="M29.0723 16.7518L24.4775 46.992L24.3242 47.9998H4.63574L4.49121 46.9803L0.192383 16.741L0 15.3885H20.1201C20.3607 16.2587 20.7604 17.0596 21.2861 17.7596H2.73242L6.69434 45.6278H22.2861L26.0898 20.5916L28.0439 21.0672L28.5342 19.0506L26.4023 18.5321L26.5205 17.7596H24.3066C23.4137 17.2028 22.7091 16.3767 22.3076 15.3885H29.2803L29.0723 16.7518Z"
                        fill="#0A0A0A"
                      />
                      <path
                        d="M25.6762 1.63281L24.6439 10.5732C24.5598 11.3031 25.0814 11.9637 25.8109 12.0508C26.5442 12.1382 27.2092 11.6134 27.2943 10.8799L28.3295 1.94922L31.0131 2.26855L29.9809 11.1904C29.8963 11.9206 30.418 12.5819 31.1479 12.6689C31.8812 12.7564 32.5462 12.2316 32.6313 11.498L33.6635 2.58594L34.977 2.74121L36.2914 2.89844L34.9662 14.0049C34.5686 17.3378 31.5443 19.7179 28.2113 19.3203L27.0346 19.1797C23.7017 18.7821 21.3216 15.7577 21.7191 12.4248L23.0443 1.31836L25.6762 1.63281ZM35.1654 1.18848C35.9032 1.27645 36.4243 1.95387 36.3197 2.68945L36.2904 2.89746L33.6635 2.58496L33.6947 2.33594C33.7865 1.61452 34.4433 1.10241 35.1654 1.18848ZM29.8344 0.598632L29.8627 0.601562C30.5804 0.687143 31.0998 1.3291 31.0336 2.04883L31.0131 2.26855L28.3305 1.94922L28.351 1.77148C28.4351 1.03708 29.1004 0.511107 29.8344 0.598632ZM28.3305 1.94824L28.3295 1.94922L25.6762 1.63281L25.6771 1.63184L28.3305 1.94824ZM24.5307 0.00976525C25.2454 0.0950276 25.7617 0.734625 25.6938 1.45117L25.6762 1.63184L23.0443 1.31738L23.0521 1.21582C23.1145 0.467717 23.7852 -0.0791227 24.5307 0.00976525Z"
                        fill="#0A0A0A"
                      />
                      <path
                        d="M23.3047 46.8142L27.9 16.5743"
                        stroke="#0A0A0A"
                        stroke-width="2.37175"
                      />
                      <circle
                        cx="12.1872"
                        cy="29.9383"
                        r="1.63058"
                        fill="white"
                      />
                      <circle
                        cx="16.0415"
                        cy="35.5713"
                        r="1.03764"
                        fill="white"
                      />
                      <circle
                        cx="14.4113"
                        cy="40.4629"
                        r="0.592938"
                        fill="white"
                      />
                    </svg>
                    <p className="text-sm">FoodyBot</p>
                  </div>
                )}
                {msg.text && (
                  <p
                    className={`inline-block p-2 rounded-lg text-sm ${
                      msg.sender === "user"
                        ? "bg-[#a93f15] text-white"
                        : "bg-gray-200 text-black ml-8 w-5/6"
                    } `}
                  >
                    {msg.text}
                  </p>
                )}
                {msg.sender === "bot" &&
                  msg.results &&
                  msg.type === "Product" && (
                    <div className="mt-3 ml-8 overflow-x-scroll thin-scrollbar">
                      <div className="flex space-x-4 min-w-max pb-2">
                        {msg.results.map((result) => (
                          <ProductItem
                            key={result._id}
                            productName={result.name}
                            rating={result.rating}
                            image={
                              result.images.length > 0
                                ? result.images[0].url
                                : ""
                            }
                            category={result.category}
                            price={result.price}
                            id={result._id}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                {msg.sender === "bot" && msg.results && (
                  <>
                    {msg.type === "OrderTracking" &&
                      (() => {
                        const tracking = msg.results.orderTracking;
                        const details = msg.results.orderDetail;
                        const item = tracking[tracking.length - 1];

                        return (
                          <div className="flex flex-col justify-center gap-y-3">
                            <div className="mt-3 flex flex-col gap-y-3">
                              <OrderStatus
                                key={item._id}
                                icon={getStatusObjectByStatus(item.status).icon}
                                status={item.status}
                                index={0}
                                orderStatus={
                                  tracking[tracking.length - 1].status
                                }
                                date={formatDate(item.deliveryDate)}
                                time={getTime(item.deliveryDate)}
                                address={item.deliveryAddress}
                                isEnd={item === tracking[tracking.length - 1]}
                              />
                            </div>
                            <button
                              className="px-6 py-2 rounded-lg bg-[#a93f15] text-sm w-fit self-center text-white"
                              onClick={() =>
                                handleTrackOrder(
                                  msg.results.orderId,
                                  tracking,
                                  details
                                )
                              }
                            >
                              Xem chi tiết
                            </button>
                          </div>
                        );
                      })()}
                  </>
                )}
                {msg.textEnd && (
                  <p
                    className={`inline-block p-2 rounded-lg mt-3 text-sm ${
                      msg.sender === "user"
                        ? "bg-[#a93f15] text-white"
                        : "bg-gray-200 text-black ml-8 w-5/6"
                    } `}
                  >
                    {msg.textEnd}
                  </p>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex pb-4 border-t pt-2 pr-2">
            <input
              type="text"
              value={content}
              ref={inputRef}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-grow text-sm p-2 border-none focus:outline-none focus:ring-0"
              placeholder="Nhập tin nhắn..."
            />
            <button
              onClick={handleSend}
              className="bg-[#a93f15] text-white p-2 rounded-full hover:bg-[#FF7E4C] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="#fff"
                class="size-5"
              >
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
