import { useContext, useEffect, useState } from "react";
import Banner from "../../assets/images/banner.png";
import Slider from "../../components/Slider";
import {
  getBestSellerProducts,
  getNewArrivalProducts,
} from "../../data/products";
import { getRelatedProducts } from "../../data/recommendation";
import AuthContext from "../../context/AuthContext";
import Cookies from "js-cookie";
import Error from "../Error";
import { Link } from "react-router-dom";

function Home() {
  const [user, setUser] = useState(() =>
    Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null
  );
  const [newArrivalProducts, setNewArrivalProducts] = useState([]);
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const { setHasError } = useContext(AuthContext);
  const permission = Cookies.get("permission") ?? null;

  const fetchNewArrivalProducts = async () => {
    const products = await getNewArrivalProducts();
    setNewArrivalProducts(products);
  };
  const fetchBestSellerProducts = async () => {
    const products = await getBestSellerProducts();
    setBestSellerProducts(products);
  };
  const fetchRelatedProducts = async () => {
    const products = await getRelatedProducts();
    setRelatedProducts(products);
  };

  useEffect(() => {
    fetchNewArrivalProducts();
    fetchBestSellerProducts();

    // if (user || (permission && permission.includes("HOME"))) {
    //   fetchRelatedProducts();
    // }
  }, []);

  if (user && (!permission || !permission.includes("HOME"))) {
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
    <div className="mb-20">
      <div className="flex items-center px-20">
        <div className="flex-1 flex flex-col gap-y-[60px]">
          <p className="text-6xl font-medium">
            Thỏa mãn cơn đói, <br /> giải khát cực đã!
          </p>
          <p className="text-2xl font-medium">
            Đặt món ngay hôm nay để tận hưởng hương vị nóng hổi, tươi mới, giao
            hàng siêu tốc!
          </p>
          <Link
            to={"/products"}
            className="bg-[#a93f15] w-fit px-10 py-3 rounded-lg mt-4 text-white font-semibold text-lg"
          >
            Khám phá ngay
          </Link>
        </div>
        <img src={Banner} alt="Fashion Banner" className="flex-1 h-auto" />
      </div>
      <div className="px-40">
        {/* {user && (
          <div className="mx-auto py-10">
            <div className="flex text-center justify-center items-center pb-2">
              <h1 className="font-medium px-24 text-3xl">
                Có thể bạn sẽ thích
              </h1>
            </div>
            <Slider products={relatedProducts} usage={""} />
          </div>
        )} */}
        <div className="mx-auto py-10">
          <div className="flex text-center justify-center items-center pb-2">
            <h1 className="font-medium px-24 text-3xl">Sản phẩm mới</h1>
          </div>
          <Slider products={newArrivalProducts} usage={"new-arrival"} />
        </div>
        <div className="mx-auto py-10">
          <div className="flex text-center justify-center items-center pb-2">
            <h1 className="font-medium px-24 text-3xl">
              Sản phẩm bán chạy nhất
            </h1>
          </div>
          <Slider products={bestSellerProducts} usage={"best-seller"} />
        </div>
        <div className="mt-10"></div>
      </div>
    </div>
  );
}

export default Home;
