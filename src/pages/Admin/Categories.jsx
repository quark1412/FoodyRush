import { useState, useEffect, useContext } from "react";
import { Table, Modal, Button } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

import Search from "../../components/Search";

import {
  createCategory,
  getAllCategories,
  updateCategory,
  updateStatusCategoryById,
} from "../../data/categories";
import toast from "react-hot-toast";
import { GENDER, ITEM_PER_PAGE } from "../../utils/Constants";
import Pagination from "../../components/Pagination";
import AuthContext from "../../context/AuthContext";
import Error from "../Error";
import Cookies from "js-cookie";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [category, setCategory] = useState("");
  const [categoryDetails, setCategoryDetails] = useState({});
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openArchiveModal, setOpenArchiveModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { auth, setHasError } = useContext(AuthContext);
  const permission = Cookies.get("permission") ?? null;

  function onCloseModal() {
    setOpenCreateModal(false);
  }

  const handleCreateCategory = async () => {
    try {
      await createCategory(category);
      fetchCategories();
      setCategory("");
      setOpenCreateModal(false);
      toast.success("Thêm danh mục sản phẩm thành công", { duration: 2000 });
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error(error.response.data.message, { duration: 2000 });
    }
  };

  const handleArchiveCategory = async (id, isActive) => {
    try {
      await updateStatusCategoryById(id);
      fetchCategories();
      if (isActive) {
        toast.success("Lưu trữ sản phẩm thành công", { duration: 2000 });
      } else {
        toast.success("Khôi phục sản phẩm thành công", { duration: 2000 });
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  async function fetchCategories() {
    try {
      const fetchedCategories = await getAllCategories();

      let filteredData =
        searchTerm !== ""
          ? fetchedCategories.filter((c) =>
              c.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : fetchedCategories;

      setCurrentPage(1);

      setCategories(filteredData);
    } catch (error) {}
  }

  const handleUpdateCategory = async () => {
    try {
      await updateCategory(
        categoryDetails._id,
        categoryDetails.name,
        categoryDetails.gender
      );
      toast.success("Chỉnh sửa danh mục thành công", { duration: 2000 });
      fetchCategories();
      setOpenUpdateModal(false);
    } catch (error) {
      toast.error(error.response.data.message, { duration: 2000 });
    }
  };

  const currentCategories = categories.slice(
    (currentPage - 1) * ITEM_PER_PAGE,
    currentPage * ITEM_PER_PAGE
  );

  useEffect(() => {
    fetchCategories();
  }, [searchTerm]);

  if (!permission || !permission.includes("CATEGORIES")) {
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
        <p className="font-extrabold text-xl">Danh mục</p>
        <div className="bg-white rounded-lg mt-10 p-6 shadow-md flex flex-col">
          <div className="overflow-x-auto">
            <div class="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center gap-x-3 pb-4">
              <Search
                placeholder={"Tên danh mục..."}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Table hoverable>
              <Table.Head className="normal-case text-base">
                <Table.HeadCell>Mã danh mục</Table.HeadCell>
                <Table.HeadCell>Tên danh mục</Table.HeadCell>
                <Table.HeadCell>Thao tác</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {currentCategories.map((category) => (
                  <Table.Row
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    key={category._id}
                  >
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {category._id}
                    </Table.Cell>
                    <Table.Cell>{category.name}</Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-row gap-x-3">
                        <button
                          className="font-medium hover:underline"
                          onClick={() => {
                            setCategoryDetails(category);
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
                          onClick={() => {
                            setCategoryDetails(category);
                            setOpenUpdateModal(true);
                          }}
                          className="font-medium text-blue-600 hover:underline"
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
                            <p className="text-blue-600">Sửa</p>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCategory(category);
                            setOpenArchiveModal(true);
                          }}
                          className="font-medium text-[#EF0606] hover:underline"
                        >
                          <div className="flex flex-row gap-x-1 items-center">
                            {category.isActive ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="#EF0606"
                                class="size-5"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M5.478 5.559A1.5 1.5 0 0 1 6.912 4.5H9A.75.75 0 0 0 9 3H6.912a3 3 0 0 0-2.868 2.118l-2.411 7.838a3 3 0 0 0-.133.882V18a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-4.162c0-.299-.045-.596-.133-.882l-2.412-7.838A3 3 0 0 0 17.088 3H15a.75.75 0 0 0 0 1.5h2.088a1.5 1.5 0 0 1 1.434 1.059l2.213 7.191H17.89a3 3 0 0 0-2.684 1.658l-.256.513a1.5 1.5 0 0 1-1.342.829h-3.218a1.5 1.5 0 0 1-1.342-.83l-.256-.512a3 3 0 0 0-2.684-1.658H3.265l2.213-7.191Z"
                                  clip-rule="evenodd"
                                />
                                <path
                                  fill-rule="evenodd"
                                  d="M12 2.25a.75.75 0 0 1 .75.75v6.44l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 1.06-1.06l1.72 1.72V3a.75.75 0 0 1 .75-.75Z"
                                  clip-rule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="#EF0606"
                                class="size-5"
                              >
                                <path d="M11.47 1.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1-1.06 1.06l-1.72-1.72V7.5h-1.5V4.06L9.53 5.78a.75.75 0 0 1-1.06-1.06l3-3ZM11.25 7.5V15a.75.75 0 0 0 1.5 0V7.5h3.75a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h3.75Z" />
                              </svg>
                            )}
                            <p className="text-[#EF0606]">
                              {category.isActive ? "Lưu trữ" : "Khôi phục"}
                            </p>
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
            {categories.length > 0 ? (
              <div className="font-semibold text-sm">
                Hiển thị {(currentPage - 1) * ITEM_PER_PAGE + 1} -{" "}
                {Math.min(currentPage * ITEM_PER_PAGE, categories.length)} của{" "}
                {categories.length} kết quả
              </div>
            ) : (
              <div className="font-semibold text-sm">
                Hiển thị 0 - 0 của 0 kết quả
              </div>
            )}
            {currentCategories.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(categories.length / ITEM_PER_PAGE)}
                onPageChange={setCurrentPage}
                svgClassName={"w-5 h-5"}
                textClassName={"text-sm px-3 py-2"}
              />
            )}
          </div>
        </div>
        <button
          className="px-6 py-2 rounded bg-[#a93f15] text-white font-extrabold mt-10"
          onClick={() => setOpenCreateModal(true)}
        >
          Thêm danh mục mới
        </button>
      </div>
      <Modal show={openCreateModal} size="lg" onClose={onCloseModal} popup>
        <Modal.Header />
        <Modal.Body className="px-10">
          <div className="space-y-4">
            <h3 className="text-xl text-center text-gray-900 dark:text-white font-manrope font-extrabold">
              Danh mục / Thêm mới
            </h3>
            <div className="flex flex-col gap-y-1">
              <p className="font-manrope text-sm font-semibold">
                Tên danh mục <b className="text-[#EF0606]">*</b>
              </p>
              <input
                id="category"
                value={category}
                className="w-full font-semibold font-manrope px-5 py-3 border border-[#808191] focus:outline-none rounded-lg bg-transparent text-[#0a0a0a] text-sm"
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
            <div className="w-full flex justify-center">
              <button
                className="px-6 py-2 rounded bg-[#a93f15] text-white font-extrabold mt-6 font-manrope"
                onClick={handleCreateCategory}
              >
                Thêm danh mục
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
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
              Danh mục / Chi tiết
            </h3>
            <div className="flex flex-col gap-y-1">
              <p className="font-manrope font-semibold text-sm">Tên danh mục</p>
              <input
                value={categoryDetails.name}
                className="w-full font-semibold font-manrope px-5 py-3 border border-[#808191] focus:outline-none rounded-lg bg-transparent text-[#808191] text-sm"
                disabled
              />
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={openUpdateModal}
        size="lg"
        onClose={() => setOpenUpdateModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body className="px-10">
          <div className="space-y-4">
            <h3 className="text-xl text-center text-gray-900 dark:text-white font-manrope font-extrabold">
              Danh mục / Chỉnh sửa
            </h3>
            <div className="flex flex-col gap-y-1">
              <p className="font-manrope font-semibold text-sm">Tên danh mục</p>
              <input
                value={categoryDetails.name}
                className="w-full px-5 font-semibold font-manrope py-3 border border-[#808191] focus:outline-none rounded-lg bg-transparent text-[#0a0a0a] text-sm"
                onChange={(e) =>
                  setCategoryDetails({
                    ...categoryDetails,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="w-full flex justify-center">
              <button
                className="px-6 py-2 rounded bg-[#0A0A0A] text-white font-extrabold mt-6 font-manrope"
                onClick={handleUpdateCategory}
              >
                Lưu thay đổi
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
                selectedCategory.isActive ? "lưu trữ" : "khôi phục"
              } danh mục không?`}
            </h3>
            <div className="flex justify-center gap-4 ">
              <Button color="gray" onClick={() => setOpenArchiveModal(false)}>
                Không
              </Button>
              <Button
                color="failure"
                onClick={() => {
                  handleArchiveCategory(
                    selectedCategory._id,
                    selectedCategory.isActive
                  );
                  setOpenArchiveModal(false);
                }}
              >
                <p className="text-white">{`${
                  selectedCategory.isActive ? "Lưu trữ" : "Khôi phục"
                }`}</p>
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
