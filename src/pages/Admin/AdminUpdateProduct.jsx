import { useState, useEffect, useContext } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { FileInput, Label } from "flowbite-react";

import { getAllCategories, getCategoryById } from "../../data/categories";
import {
  createProductVariant,
  deleteProductVariant,
  updateProductVariant,
  getProductVariantsByProductId,
} from "../../data/productVariant";
import {
  createProduct,
  createProductImages,
  deleteProductImageById,
  getProductById,
  updateProduct,
} from "../../data/products";
import { getAllImagesByProductId } from "../../data/productImages";
import toast from "react-hot-toast";
import { formatURL } from "../../utils/format";
import Error from "../Error";
import AuthContext from "../../context/AuthContext";
import Cookies from "js-cookie";
import ColorDropdown from "../../components/ColorDropdown";
import { COLORS } from "../../utils/Constants";

export default function UpdateProduct() {
  const navigate = useNavigate();
  const { auth, setHasError } = useContext(AuthContext);
  const permission = Cookies.get("permission") ?? null;

  const { id } = useParams();
  const [category, setCategory] = useState([]);
  const [productName, setProductName] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [sizes, setSizes] = useState([]);
  const [currentPhotos, setCurrentPhotos] = useState({});
  const [variants, setVariants] = useState([{ size: "", quantity: "" }]);

  const handleAddVariant = () => {
    setVariants([...variants, { size: "", quantity: "" }]);
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    const updatedPhotos = files.map((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      return new Promise((resolve) => {
        reader.onloadend = () =>
          resolve({ imagePath: reader.result, imageFile: file });
      });
    });

    Promise.all(updatedPhotos).then((results) => {
      setPhotos((prevPhotos) => [...prevPhotos, ...results]);
    });
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const handleRemoveVariant = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const product = await getProductById(id);
        setProductName(product.name);
        setPrice(product.price);
        setDescription(product.description);

        if (product.categoryId) {
          const fetchedCategory = await getCategoryById(product.categoryId);
          setCategoryId(product.categoryId);
          setCategory(fetchedCategory.name);
        }

        const fetchedImages = product.images;
        setPhotos(fetchedImages);
        setCurrentPhotos(fetchedImages);
      } catch (error) {}
    };

    const fetchVariants = async () => {
      try {
        const fetchedVariants = await getProductVariantsByProductId(id);
        const variantsData = await Promise.all(
          fetchedVariants.map(async (variant) => {
            const size = variant.size;
            return { size, quantity: variant.stock };
          })
        );
        setVariants(variantsData);
      } catch (error) {}
    };

    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getAllCategories();
        setCategories(fetchedCategories);
      } catch (error) {}
    };

    fetchProduct();
    fetchVariants();
    fetchCategories();
  }, [id]);

  const handleCategoryChange = async (selectedCategory) => {
    setCategoryId(selectedCategory);
  };

  const handleUpdateProduct = async () => {
    try {
      await updateProduct(id, productName, description, categoryId, price);

      const existingImages = currentPhotos;
      console.log(existingImages);

      const existingImagesMap = existingImages.reduce((map, image) => {
        map[image.publicId] = image;
        return map;
      }, {});

      const newImages = [];
      await Promise.all(
        photos.map(async (photo) => {
          const existingImage = existingImagesMap[photo.publicId];

          if (!existingImage) {
            newImages.push(photo);
          }
        })
      );

      if (newImages.length > 0) {
        await createProductImages(id, newImages);
      }

      const imagesToDelete = existingImages.filter(
        (existing) =>
          !photos.some((photo) => photo.publicId === existing.publicId)
      );
      console.log(imagesToDelete);

      await Promise.all(
        imagesToDelete.map((image) =>
          deleteProductImageById(id, image.publicId)
        )
      );

      const existingVariants = await getProductVariantsByProductId(id);

      const existingVariantsMap = existingVariants.reduce((map, variant) => {
        map[`${variant.size}`] = variant;
        return map;
      }, {});

      await Promise.all(
        variants.map(async (variant) => {
          const key = `${variant.size}`;
          const existingVariant = existingVariantsMap[key];
          console.log(existingVariant);

          if (existingVariant) {
            const hasChanged =
              existingVariant.quantity !== variant.stock ||
              existingVariant.size !== variant.size;

            if (hasChanged) {
              await updateProductVariant(
                existingVariant._id,
                existingVariant.productId,
                variant.size,
                variant.quantity
              );
            }
          } else {
            await createProductVariant(id, variant.size, variant.quantity);
          }
        })
      );

      const variantIdsToDelete = existingVariants
        .filter(
          (existing) =>
            !variants.some((variant) => existing.size === variant.size)
        )
        .map((existing) => existing._id);

      await Promise.all(
        variantIdsToDelete.map((variantId) => deleteProductVariant(variantId))
      );

      toast.success("Chỉnh sửa sản phẩm thành công", { duration: 2000 });
      navigate("/admin/products");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message, { duration: 2000 });
    }
  };

  if (!permission || !permission.includes("PRODUCTS")) {
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
    <div className="p-10 w-full">
      <p className="font-extrabold text-xl">Sản phẩm / Chỉnh sửa</p>
      <div className="bg-white rounded-lg mt-10 p-6 shadow-md flex flex-col gap-y-5">
        <p className="font-extrabold text-base">Chỉnh sửa sản phẩm</p>
        <div className="flex flex-row gap-x-10 px-10 justify-between ">
          {photos && photos.length === 0 && (
            <FileInput
              id="dropzone-file"
              className="hidden"
              onChange={handlePhotoChange}
              multiple
            />
          )}
          <div
            className={`flex h-fit flex-[1] p-5 overflow-scroll max-h-80 flex-row flex-wrap items-center rounded-lg border-2 border-dashed border-gray-300 ${
              photos && photos.length === 0
                ? "cursor-pointer hover:bg-gray-50 justify-center"
                : ""
            }`}
          >
            <Label
              htmlFor="dropzone-file"
              className={`${
                photos && photos.length === 0 ? "cursor-pointer" : ""
              }`}
            >
              {photos && photos.length === 0 && (
                <div className="flex flex-col items-center justify-center">
                  <svg
                    width="60"
                    height="60"
                    viewBox="0 0 60 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M37.5 20H37.525M31.25 52.5H15C13.0109 52.5 11.1032 51.7098 9.6967 50.3033C8.29018 48.8968 7.5 46.9891 7.5 45V15C7.5 13.0109 8.29018 11.1032 9.6967 9.6967C11.1032 8.29018 13.0109 7.5 15 7.5H45C46.9891 7.5 48.8968 8.29018 50.3033 9.6967C51.7098 11.1032 52.5 13.0109 52.5 15V31.25"
                      stroke="black"
                      stroke-width="5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M7.5 40L20 27.5C22.32 25.2675 25.18 25.2675 27.5 27.5L37.5 37.5"
                      stroke="black"
                      stroke-width="5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M35 35L37.5 32.5C39.175 30.89 41.125 30.44 42.955 31.15M40 47.5H55M47.5 40V55"
                      stroke="black"
                      stroke-width="5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500 font-semibold">
                    Tải ảnh
                  </p>
                </div>
              )}
            </Label>
            <div className="flex gap-2 flex-wrap items-center">
              {photos &&
                photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo.url ?? photo.imagePath}
                    alt={`Uploaded ${index}`}
                    className="object-cover w-24 rounded-lg cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto(index);
                    }}
                  />
                ))}
              {photos && photos.length > 0 && (
                <Label
                  htmlFor="dropzone-file-more"
                  className="flex w-fit h-fit flex-[1] p-5 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:bg-gray-50 "
                >
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 9V15M15 12H9M21 12C21 13.1819 20.7672 14.3522 20.3149 15.4442C19.8626 16.5361 19.1997 17.5282 18.364 18.364C17.5282 19.1997 16.5361 19.8626 15.4442 20.3149C14.3522 20.7672 13.1819 21 12 21C10.8181 21 9.64778 20.7672 8.55585 20.3149C7.46392 19.8626 6.47177 19.1997 5.63604 18.364C4.80031 17.5282 4.13738 16.5361 3.68508 15.4442C3.23279 14.3522 3 13.1819 3 12C3 9.61305 3.94821 7.32387 5.63604 5.63604C7.32387 3.94821 9.61305 3 12 3C14.3869 3 16.6761 3.94821 18.364 5.63604C20.0518 7.32387 21 9.61305 21 12Z"
                        stroke="black"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500 font-semibold">
                      Thêm
                    </p>
                  </div>
                  <FileInput
                    id="dropzone-file-more"
                    className="hidden"
                    onChange={handlePhotoChange}
                    multiple
                  />
                </Label>
              )}
            </div>
          </div>

          <div className="flex-[2] flex flex-col gap-y-5">
            <div className="flex flex-col gap-y-2">
              <p className="font-manrope font-semibold">Tên sản phẩm</p>
              <input
                id="productName"
                value={productName}
                className="w-full font-semibold font-manrope px-5 py-3 border border-[#808191] focus:outline-none rounded-lg bg-transparent text-[#0a0a0a] text-sm"
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-row gap-x-10">
              <div className="flex flex-col gap-y-2 flex-1">
                <p className="font-manrope font-semibold">Danh mục</p>
                <select
                  id="categoryId"
                  value={categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full font-semibold font-manrope px-5 py-3 border border-[#808191] focus:outline-none rounded-lg bg-transparent text-[#0a0a0a] text-sm"
                  required
                >
                  {categories.map((category) => (
                    <option
                      key={category._id}
                      value={category._id}
                      defaultValue={categoryId}
                    >
                      {`${category.name}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col flex-1 gap-y-2">
                <p className="font-manrope font-semibold">Đơn giá</p>
                <input
                  id="price"
                  value={price}
                  className="w-full font-semibold font-manrope px-5 py-3 border border-[#808191] focus:outline-none rounded-lg bg-transparent text-[#0a0a0a] text-sm"
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-y-2">
              <p className="font-manrope font-semibold">Mô tả</p>
              <textarea
                rows="4"
                id="description"
                value={description}
                className="w-full font-semibold font-manrope px-5 py-3 border border-[#808191] focus:outline-none rounded-lg bg-transparent text-[#0a0a0a] text-sm resize-none"
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
        <p className="font-extrabold text-base">Biến thể</p>
        {variants.map((variant, index) => (
          <main key={index} className="relative mb-2">
            <div className="flex gap-x-10 px-10">
              <div className="flex flex-col gap-y-2">
                <p className="font-manrope font-semibold">Kích cỡ</p>
                <input
                  id="size"
                  value={variant.size}
                  onChange={(e) =>
                    handleVariantChange(index, "size", e.target.value)
                  }
                  className="w-96 font-semibold font-manrope px-5 py-3 border border-[#808191] focus:outline-none rounded-lg bg-transparent text-[#0a0a0a] text-sm"
                  required
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <p className="font-manrope font-semibold">Số lượng</p>
                <input
                  id="quantity"
                  value={variant.quantity}
                  className="w-96 font-semibold font-manrope px-5 py-3 border border-[#808191] focus:outline-none rounded-lg bg-transparent text-[#0a0a0a] text-sm"
                  onChange={(e) =>
                    handleVariantChange(index, "quantity", e.target.value)
                  }
                  required
                />
              </div>
            </div>
            {variants.length > 1 && (
              <button
                className="font-medium text-[#EF0606] items-center flex w-fit h-fit absolute right-60 bottom-4"
                onClick={() => handleRemoveVariant(index)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M11 2.9853V3.13663C11.866 3.21582 12.7285 3.32969 13.5853 3.47797C13.65 3.48917 13.7119 3.51301 13.7674 3.54812C13.8229 3.58324 13.8709 3.62893 13.9087 3.6826C13.9465 3.73628 13.9734 3.79687 13.9878 3.86093C14.0022 3.925 14.0039 3.99127 13.9927 4.05597C13.9815 4.12066 13.9576 4.18252 13.9225 4.23801C13.8874 4.29349 13.8417 4.34152 13.788 4.37934C13.7344 4.41716 13.6738 4.44405 13.6097 4.45845C13.5456 4.47286 13.4794 4.4745 13.4147 4.4633L13.2753 4.43997L12.6053 13.1533C12.5667 13.6557 12.3399 14.125 11.9702 14.4674C11.6005 14.8097 11.1152 14.9999 10.6113 15H5.38934C4.88547 14.9999 4.40017 14.8097 4.03049 14.4674C3.6608 14.125 3.43397 13.6557 3.39534 13.1533L2.72467 4.43997L2.58534 4.4633C2.52064 4.4745 2.45437 4.47286 2.39031 4.45845C2.32625 4.44405 2.26565 4.41716 2.21198 4.37934C2.10358 4.30295 2.02997 4.18663 2.00734 4.05597C1.98471 3.9253 2.01491 3.791 2.0913 3.6826C2.16769 3.57421 2.28401 3.5006 2.41467 3.47797C3.27152 3.32952 4.13399 3.21565 5 3.13663V2.9853C5 1.94263 5.80867 1.05197 6.87734 1.01797C7.62581 0.994012 8.37486 0.994012 9.12334 1.01797C10.192 1.05197 11 1.94263 11 2.9853ZM6.90934 2.0173C7.63649 1.99404 8.36419 1.99404 9.09134 2.0173C9.59334 2.0333 10 2.45597 10 2.9853V3.06063C8.6679 2.97973 7.33211 2.97973 6 3.06063V2.9853C6 2.45597 6.406 2.0333 6.90934 2.0173ZM6.67267 5.98063C6.67013 5.91497 6.65469 5.85045 6.62721 5.79076C6.59974 5.73107 6.56078 5.67738 6.51255 5.63274C6.46433 5.58811 6.40779 5.55341 6.34615 5.53063C6.28452 5.50785 6.219 5.49743 6.15334 5.49997C6.08768 5.5025 6.02316 5.51795 5.96347 5.54542C5.90378 5.5729 5.85008 5.61186 5.80545 5.66008C5.76081 5.70831 5.72611 5.76485 5.70333 5.82649C5.68055 5.88812 5.67013 5.95364 5.67267 6.0193L5.904 12.0193C5.90913 12.1518 5.96669 12.2769 6.06402 12.367C6.11222 12.4116 6.16873 12.4462 6.23032 12.469C6.29191 12.4918 6.35739 12.5022 6.423 12.4996C6.48862 12.4971 6.5531 12.4817 6.61275 12.4542C6.6724 12.4267 6.72606 12.3878 6.77066 12.3396C6.81526 12.2914 6.84994 12.2349 6.8727 12.1733C6.89547 12.1117 6.90588 12.0463 6.90334 11.9806L6.67267 5.98063ZM10.326 6.0193C10.3309 5.95238 10.3223 5.88516 10.3006 5.82164C10.279 5.75812 10.2448 5.69961 10.2001 5.64959C10.1553 5.59957 10.101 5.55907 10.0403 5.53049C9.97957 5.50191 9.91373 5.48585 9.84668 5.48325C9.77963 5.48066 9.71274 5.49158 9.65 5.51538C9.58726 5.53918 9.52996 5.57536 9.4815 5.62177C9.43304 5.66818 9.39441 5.72388 9.36793 5.78553C9.34144 5.84718 9.32764 5.91353 9.32734 5.98063L9.096 11.9806C9.09088 12.1132 9.13864 12.2425 9.22878 12.3398C9.31892 12.4372 9.44406 12.4948 9.57667 12.5C9.70928 12.5051 9.83849 12.4573 9.93589 12.3672C10.0333 12.277 10.0909 12.1519 10.096 12.0193L10.326 6.0193Z"
                    fill="#EF0606"
                  />
                </svg>
              </button>
            )}
          </main>
        ))}
        <div className="flex justify-end">
          <button
            className="border border-[#a93f15] rounded-lg flex items-center px-4 py-3 gap-x-2"
            onClick={handleAddVariant}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 9V15M15 12H9M21 12C21 13.1819 20.7672 14.3522 20.3149 15.4442C19.8626 16.5361 19.1997 17.5282 18.364 18.364C17.5282 19.1997 16.5361 19.8626 15.4442 20.3149C14.3522 20.7672 13.1819 21 12 21C10.8181 21 9.64778 20.7672 8.55585 20.3149C7.46392 19.8626 6.47177 19.1997 5.63604 18.364C4.80031 17.5282 4.13738 16.5361 3.68508 15.4442C3.23279 14.3522 3 13.1819 3 12C3 9.61305 3.94821 7.32387 5.63604 5.63604C7.32387 3.94821 9.61305 3 12 3C14.3869 3 16.6761 3.94821 18.364 5.63604C20.0518 7.32387 21 9.61305 21 12Z"
                stroke="#a93f15"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <p className="font-extrabold text-sm text-[#a93f15]">
              Thêm biến thể
            </p>
          </button>
        </div>
      </div>
      <div className="flex gap-x-5 items-center mt-10">
        <Link to={"/admin/products"}>
          <button className="px-6 py-2 rounded-lg bg-[#a93f15] text-white font-extrabold">
            Quay về
          </button>
        </Link>
        <button
          className="px-6 py-2 rounded-lg bg-[#a93f15] text-white font-extrabold"
          onClick={handleUpdateProduct}
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}
