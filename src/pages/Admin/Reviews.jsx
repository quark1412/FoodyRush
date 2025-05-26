import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { Table, Modal, Button } from "flowbite-react";
import Search from "../../components/Search";

import {
  createReviewResponse,
  getAllReviews,
  hideReview,
  unhideReview,
} from "../../data/reviews";
import { getProductById } from "../../data/products";
import { getUserById } from "../../data/users";

import Rating from "../../components/Rating";
import toast from "react-hot-toast";
import {
  ITEM_PER_PAGE,
  REVIEW_RATING,
  REVIEW_STATUS,
  REVIEW_TYPE,
} from "../../utils/Constants";
import Pagination from "../../components/Pagination";
import Error from "../Error";
import AuthContext from "../../context/AuthContext";
import Cookies from "js-cookie";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openReplyModal, setOpenReplyModal] = useState(false);
  const [openArchiveModal, setOpenArchiveModal] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [reviewDetails, setReviewDetails] = useState({});
  const [feedback, setFeedback] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(REVIEW_STATUS.ALL);
  const [selectedRating, setSelectedRating] = useState("All");
  const [selectedReview, setSelectedReview] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { auth, setHasError } = useContext(AuthContext);
  const permission = Cookies.get("permission") ?? null;

  const fetchData = async () => {
    try {
      const fetchedReviews = await getAllReviews(
        selectedStatus !== "All" ? selectedStatus : undefined,
        selectedRating !== "All" ? selectedRating : undefined
      );

      const data = await Promise.all(
        fetchedReviews.map(async (review) => {
          const product = await getProductById(review.productId);
          const user = await getUserById(review.userId);
          return {
            ...review,
            status:
              review.status === REVIEW_STATUS.REPLIED
                ? REVIEW_STATUS.REPLIED
                : REVIEW_STATUS.NOT_REPLIED,
            productName: product.name,
            fullName: user?.fullName,
          };
        })
      );

      const filteredData =
        searchTerm !== ""
          ? data.filter((review) =>
              review.productName
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            )
          : data;
      setCurrentPage(1);
      setReviews(filteredData);
    } catch (error) {
      console.error(error);
    }
  };

  const currentReviews = reviews.slice(
    (currentPage - 1) * ITEM_PER_PAGE,
    currentPage * ITEM_PER_PAGE
  );

  useEffect(() => {
    fetchData();
  }, [selectedStatus, selectedRating, searchTerm]);

  const handleReplyReview = async () => {
    try {
      await createReviewResponse(reviewDetails._id, feedback);
      await fetchData();
      setFeedback("");
      setOpenReplyModal(false);
      toast.success("Phản hồi đánh giá thành công", { duration: 2000 });
    } catch (error) {
      toast.error(error.response.data.message, { duration: 2000 });
    }
  };

  const handleReviewAppearance = async (reviewId, isActive) => {
    try {
      if (isActive) {
        await hideReview(reviewId);
      } else {
        await unhideReview(reviewId);
      }
      fetchData();
      if (isActive) {
        toast.success("Ẩn đánh giá thành công", { duration: 2000 });
      } else {
        toast.success("Hiện đánh giá thành công", { duration: 2000 });
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case REVIEW_STATUS.REPLIED:
        return "bg-green-100 text-green-600";
      case REVIEW_STATUS.NOT_REPLIED:
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getTypeClass = (type) => {
    switch (type) {
      case REVIEW_TYPE.POSITIVE:
        return "bg-green-100 text-green-600";
      case REVIEW_TYPE.NEGATIVE:
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (!permission || !permission.includes("REVIEWS")) {
    setHasError(true);
    return (
      <Error
        errorCode={403}
        title={"Forbidden"}
        content={"Bạn không có quyền truy cập trang này."}
      />
    );
  }

  return (
    <>
      <div className="p-10 w-full">
        <p className="font-extrabold text-xl">Đánh giá</p>
        <div className="bg-white rounded-lg mt-10 p-6 shadow-md flex flex-col">
          <div className="overflow-x-auto">
            <div class="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center gap-x-3 pb-4">
              <Search
                placeholder={"Tên sản phẩm..."}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-fit h-fit font-semibold font-manrope px-5 py-3 border-none focus:ring-0 focus:outline-none rounded-lg bg-[#F8F8F8] text-[#0a0a0a] text-sm"
                required
              >
                <option
                  value={"All"}
                  className="font-medium font-manrope text-sm"
                >
                  Tất cả
                </option>
                <option
                  value={REVIEW_STATUS.NOT_REPLIED}
                  className="font-medium font-manrope text-sm"
                >
                  {REVIEW_STATUS.NOT_REPLIED}
                </option>
                <option
                  value={REVIEW_STATUS.REPLIED}
                  className="font-medium font-manrope text-sm"
                >
                  {REVIEW_STATUS.REPLIED}
                </option>
              </select>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="w-fit h-fit font-semibold font-manrope px-5 py-3 border-none focus:ring-0 focus:outline-none rounded-lg bg-[#F8F8F8] text-[#0a0a0a] text-sm"
                required
              >
                <option
                  value={"All"}
                  className="font-medium font-manrope text-sm"
                >
                  Tất cả
                </option>
                {REVIEW_RATING.map((item) => (
                  <option
                    key={item.key}
                    value={item.value}
                    className="font-medium font-manrope text-sm"
                  >
                    {item.key}
                  </option>
                ))}
              </select>
            </div>
            <Table hoverable className="overflow-scroll">
              <Table.Head className="normal-case text-base">
                <Table.HeadCell>Mã đánh giá</Table.HeadCell>
                <Table.HeadCell>Tên sản phẩm</Table.HeadCell>
                <Table.HeadCell>Tên khách hàng</Table.HeadCell>
                <Table.HeadCell>Số sao</Table.HeadCell>
                <Table.HeadCell className="truncate">Bình luận</Table.HeadCell>
                <Table.HeadCell>Loại</Table.HeadCell>
                <Table.HeadCell>Trạng thái</Table.HeadCell>
                <Table.HeadCell>Thao tác</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {currentReviews.map((review) => (
                  <Table.Row
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    key={review._id}
                  >
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white max-w-40 truncate overflow-hidden text-ellipsis">
                      {review._id}
                    </Table.Cell>
                    <Table.Cell>{review?.productName}</Table.Cell>
                    <Table.Cell>{review?.fullName}</Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-row gap-x-1 items-center">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 40 40"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M20.0001 28.7833L26.9168 32.9667C28.1835 33.7333 29.7335 32.6 29.4001 31.1666L27.5668 23.3L33.6835 18C34.8001 17.0333 34.2001 15.2 32.7335 15.0833L24.6835 14.4L21.5335 6.96665C20.9668 5.61665 19.0335 5.61665 18.4668 6.96665L15.3168 14.3833L7.26679 15.0666C5.80012 15.1833 5.20012 17.0166 6.31679 17.9833L12.4335 23.2833L10.6001 31.15C10.2668 32.5833 11.8168 33.7167 13.0835 32.95L20.0001 28.7833Z"
                            fill="#FFE066"
                          />
                        </svg>
                        <p className="font-medium">{review?.rating}</p>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="truncate whitespace-nowrap overflow-hidden text-ellipsis max-w-40">
                      {review?.content}
                    </Table.Cell>
                    <Table.Cell>
                      <div
                        className={`px-3 py-1 rounded-lg text-center font-semibold ${getTypeClass(
                          review?.type
                        )}`}
                      >
                        {review?.type}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div
                        className={`px-3 py-1 rounded-lg text-center font-semibold ${getStatusClass(
                          review?.status
                        )}`}
                      >
                        {review?.status}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-row gap-x-3">
                        <button
                          className="font-medium hover:underline"
                          onClick={() => {
                            setReviewDetails(review);
                            setOpenDetailModal(true);
                          }}
                        >
                          <div className="flex flex-row gap-x-1 items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              class="size-5"
                            >
                              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                              <path
                                fill-rule="evenodd"
                                d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z"
                                clip-rule="evenodd"
                              />
                            </svg>
                            <p className="text-[#0A0A0A]">Xem</p>
                          </div>
                        </button>
                        <button
                          className="font-medium hover:underline"
                          onClick={() => {
                            setSelectedReview(review);
                            setOpenArchiveModal(true);
                          }}
                        >
                          <div className="flex flex-row gap-x-1 items-center">
                            {review.isActive ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="#EF0606"
                                class="size-4"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
                                  clip-rule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="#EF0606"
                                class="size-4"
                              >
                                <path d="M18 1.5c2.9 0 5.25 2.35 5.25 5.25v3.75a.75.75 0 0 1-1.5 0V6.75a3.75 3.75 0 1 0-7.5 0v3a3 3 0 0 1 3 3v6.75a3 3 0 0 1-3 3H3.75a3 3 0 0 1-3-3v-6.75a3 3 0 0 1 3-3h9v-3c0-2.9 2.35-5.25 5.25-5.25Z" />
                              </svg>
                            )}
                            <p className="text-[#EF0606]">
                              {review.isActive ? "Ẩn" : "Hiện"}
                            </p>
                          </div>
                        </button>
                        <button
                          className="font-medium text-blue-600 hover:underline"
                          onClick={() => {
                            setReviewDetails(review);
                            setOpenReplyModal(true);
                          }}
                        >
                          <div className="flex flex-row gap-x-1 items-center">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M14.4873 1.5127C14.1591 1.18458 13.7141 1.00024 13.25 1.00024C12.7859 1.00024 12.3408 1.18458 12.0127 1.5127L11.2413 2.28404L13.716 4.7587L14.4873 3.98737C14.8154 3.65919 14.9998 3.21412 14.9998 2.75004C14.9998 2.28596 14.8154 1.84088 14.4873 1.5127ZM13.0087 5.46604L10.534 2.99137L4.93399 8.59137C4.52255 9.0026 4.2201 9.50989 4.05399 10.0674L3.52065 11.8574C3.4949 11.9437 3.49298 12.0355 3.5151 12.1229C3.53721 12.2102 3.58253 12.29 3.64626 12.3538C3.71 12.4175 3.78978 12.4628 3.87716 12.4849C3.96454 12.507 4.05627 12.5051 4.14265 12.4794L5.93265 11.946C6.49014 11.7799 6.99743 11.4775 7.40865 11.066L13.0087 5.46604Z"
                                fill="#475BE8"
                              />
                              <path
                                d="M3.5 3.5C2.96957 3.5 2.46086 3.71071 2.08579 4.08579C1.71071 4.46086 1.5 4.96957 1.5 5.5V12.5C1.5 13.0304 1.71071 13.5391 2.08579 13.9142C2.46086 14.2893 2.96957 14.5 3.5 14.5H10.5C11.0304 14.5 11.5391 14.2893 11.9142 13.9142C12.2893 13.5391 12.5 13.0304 12.5 12.5V9C12.5 8.86739 12.4473 8.74022 12.3536 8.64645C12.2598 8.55268 12.1326 8.5 12 8.5C11.8674 8.5 11.7402 8.55268 11.6464 8.64645C11.5527 8.74022 11.5 8.86739 11.5 9V12.5C11.5 12.7652 11.3946 13.0196 11.2071 13.2071C11.0196 13.3946 10.7652 13.5 10.5 13.5H3.5C3.23478 13.5 2.98043 13.3946 2.79289 13.2071C2.60536 13.0196 2.5 12.7652 2.5 12.5V5.5C2.5 5.23478 2.60536 4.98043 2.79289 4.79289C2.98043 4.60536 3.23478 4.5 3.5 4.5H7C7.13261 4.5 7.25979 4.44732 7.35355 4.35355C7.44732 4.25979 7.5 4.13261 7.5 4C7.5 3.86739 7.44732 3.74021 7.35355 3.64645C7.25979 3.55268 7.13261 3.5 7 3.5H3.5Z"
                                fill="#475BE8"
                              />
                            </svg>
                            <p className="text-blue-600">Phản hồi</p>
                          </div>
                        </button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
          <div className="flex justify-between items-center mt-5">
            {reviews.length > 0 ? (
              <div className="font-semibold text-sm">
                Hiển thị {(currentPage - 1) * ITEM_PER_PAGE + 1} -{" "}
                {Math.min(currentPage * ITEM_PER_PAGE, reviews.length)} của{" "}
                {reviews.length} kết quả
              </div>
            ) : (
              <div className="font-semibold text-sm">
                Hiển thị 0 - 0 của 0 kết quả
              </div>
            )}
            {currentReviews.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(reviews.length / ITEM_PER_PAGE)}
                onPageChange={setCurrentPage}
                svgClassName={"w-5 h-5"}
                textClassName={"text-sm px-3 py-2"}
              />
            )}
          </div>
        </div>
      </div>
      <Modal
        show={openDetailModal}
        size="lg"
        onClose={() => {
          setOpenDetailModal(false);
        }}
        popup
      >
        <Modal.Header />
        <Modal.Body className="px-10 pb-10">
          <div className="space-y-4">
            <h3 className="text-xl text-center text-gray-900 dark:text-white font-manrope font-extrabold">
              Đánh giá / Chi tiết
            </h3>
            <div className="flex flex-col gap-y-1">
              <p className="font-manrope font-semibold text-sm">Tên sản phẩm</p>
              <input
                value={reviewDetails.productName}
                className="w-full font-semibold font-manrope px-5 py-3 border border-[#808191] focus:outline-none rounded-lg bg-transparent text-[#808191] text-sm"
                disabled
              />
            </div>
            <div className="flex flex-col gap-y-1">
              <p className="font-manrope font-semibold text-sm">
                Tên khách hàng
              </p>
              <input
                value={reviewDetails.fullName}
                className="w-full font-semibold font-manrope px-5 py-3 border border-[#808191] focus:outline-none rounded-lg bg-transparent text-[#808191] text-sm"
                disabled
              />
            </div>
            <div className="flex gap-x-2 items-center">
              <p className="font-manrope font-semibold text-sm">Số sao</p>
              <Rating percentage={(reviewDetails.rating / 5) * 100} />
              <p className="font-manrope font-semibold text-sm">
                {reviewDetails.rating?.toFixed(1)}
              </p>
            </div>
            <div className="flex flex-col gap-y-1">
              <p className="font-manrope font-semibold text-sm">Bình luận</p>
              <textarea
                value={reviewDetails.content}
                rows={5}
                className="w-full resize-none font-semibold font-manrope px-5 py-3 border border-[#808191] focus:outline-none rounded-lg bg-transparent text-[#808191] text-sm"
                disabled
              />
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={openReplyModal}
        size="lg"
        onClose={() => {
          setFeedback("");
          setOpenReplyModal(false);
        }}
        popup
      >
        <Modal.Header />
        <Modal.Body className="px-10">
          <div className="space-y-4">
            <h3 className="text-xl text-center text-gray-900 dark:text-white font-manrope font-extrabold">
              Đánh giá / Phản hồi
            </h3>
            <div className="flex flex-col gap-y-1">
              <p className="font-manrope font-semibold">
                Phản hồi của người bán <b className="text-[#EF0606]">*</b>
              </p>
              <textarea
                rows={5}
                id="color"
                value={feedback}
                className="w-full resize-none font-semibold font-manrope px-5 py-3 border border-[#808191] focus:outline-none rounded-lg bg-transparent text-[#0a0a0a] text-sm"
                onChange={(e) => setFeedback(e.target.value)}
                required
              />
            </div>
            <div className="w-full flex justify-center">
              <button
                className="px-6 py-2 rounded bg-[#0A0A0A] text-white font-extrabold mt-6 font-manrope"
                onClick={handleReplyReview}
              >
                Phản hồi
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={openArchiveModal}
        size="md"
        onClose={() => setOpenArchiveModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              {`Bạn có chắc chắn muốn ${
                selectedReview.isActive ? "ẩn" : "hiện"
              } đánh giá không?`}
            </h3>
            <div className="flex justify-center gap-4 ">
              <Button color="gray" onClick={() => setOpenArchiveModal(false)}>
                Không
              </Button>
              <Button
                color="failure"
                onClick={() => {
                  handleReviewAppearance(
                    selectedReview._id,
                    selectedReview.isActive
                  );
                  setOpenArchiveModal(false);
                }}
              >
                <p className="text-white">{`${
                  selectedReview.isActive ? "Ẩn" : "Hiện"
                }`}</p>
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
