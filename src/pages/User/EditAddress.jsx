import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import axios from "axios";

import Banner from "../../components/Banner";
import instance from "../../services/axiosConfig";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import AuthContext from "../../context/AuthContext";
import {
  getOrderAddressById,
  updateOrderAddress,
} from "../../data/orderAddress";
import Error from "../Error";
import {
  getUserAddressById,
  updateUserAddressById,
} from "../../data/userAddress";

const apiUrl = "https://api.mysupership.vn";
const apiEndpointProvince = apiUrl + "/v1/partner/areas/province";
const apiEndpointDistrict = apiUrl + "/v1/partner/areas/district?province=";
const apiEndpointCommune = apiUrl + "/v1/partner/areas/commune?district=";

function EditAddress() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [phone, setPhone] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("0");
  const [selectedDistrict, setSelectedDistrict] = useState("0");
  const [selectedCommune, setSelectedCommune] = useState("0");
  const [street, setStreet] = useState("");
  const [userAddress, setUserAddress] = useState({});

  const { auth, setHasError } = useContext(AuthContext);
  const permission = Cookies.get("permission") ?? null;

  useEffect(() => {
    if (selectedProvince !== "0") {
      updateDistricts(selectedProvince);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict !== "0") {
      updateCommunes(selectedDistrict);
    }
  }, [selectedDistrict]);

  async function fetchData(url) {
    try {
      const response = await axios.get(url);
      return response.data.results || [];
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }

  async function updateProvince() {
    const provinceList = await fetchData(apiEndpointProvince);
    setProvinces(provinceList);
  }

  async function updateDistricts(idProvince) {
    const districtList = await fetchData(apiEndpointDistrict + idProvince);
    setDistricts(districtList);
  }

  async function updateCommunes(idDistrict) {
    const communeList = await fetchData(apiEndpointCommune + idDistrict);
    setCommunes(communeList);
  }

  const handleUpdateOrderAddress = async () => {
    const selectedCityName = provinces.find(
      (p) => p.code === selectedProvince
    )?.name;
    const selectedDistrictName = districts.find(
      (d) => d.code === selectedDistrict
    )?.name;
    const selectedCommuneName = communes.find(
      (c) => c.code === selectedCommune
    )?.name;

    try {
      const response = await updateUserAddressById(
        id,
        selectedCityName,
        selectedDistrictName,
        selectedCommuneName,
        street,
        phone
      );
      toast.success("Cập nhật thông tin giao hàng thành công", {
        duration: 2000,
      });
      navigate("/account");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message, {
        duration: 2000,
      });
    }
  };

  useEffect(() => {
    const fetchOrderAddressData = async () => {
      try {
        const userAddressData = await getUserAddressById(id);
        setUserAddress(userAddressData);

        const provincesList = await fetchData(apiEndpointProvince);
        setProvinces(provincesList);

        const selectedProvinceCode = provincesList.find(
          (p) => p.name === userAddressData.city
        )?.code;

        if (selectedProvinceCode) {
          setSelectedProvince(selectedProvinceCode);

          const districtsList = await fetchData(
            apiEndpointDistrict + selectedProvinceCode
          );
          setDistricts(districtsList);

          const selectedDistrictCode = districtsList.find(
            (d) => d.name === userAddressData.district
          )?.code;

          if (selectedDistrictCode) {
            setSelectedDistrict(selectedDistrictCode);

            const communesList = await fetchData(
              apiEndpointCommune + selectedDistrictCode
            );
            setCommunes(communesList);

            const selectedCommuneCode = communesList.find(
              (c) => c.name === userAddressData.commune
            )?.code;

            if (selectedCommuneCode) {
              setSelectedCommune(selectedCommuneCode);
            }
          }
        }

        setPhone(userAddressData.phone);
        setStreet(userAddressData.street);
      } catch (error) {
        console.error("Error fetching order address data:", error);
      }
    };

    fetchOrderAddressData();
  }, [id]);

  if (!permission || !permission.includes("EDIT_ADDRESS")) {
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
      <Banner
        title={"Chỉnh sửa thông tin giao hàng"}
        route={
          "Trang chủ / Tài khoản / Đơn hàng của tôi / Chỉnh sửa thông tin giao hàng"
        }
      />
      <div className="px-40 justify-center flex flex-col items-center gap-y-6">
        <div className="flex flex-col gap-y-6 w-[800px] mt-10">
          <div>
            <p className="text-base">Số điện thoại</p>
            <input
              className="px-5 py-3 mt-2 border rounded-lg text-sm w-[100%]"
              type="number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
            ></input>
          </div>
          <div>
            <p className="text-base">Tỉnh/Thành phố</p>
            <select
              id="city-province"
              value={selectedProvince}
              class="w-[100%] border rounded-lg px-3 py-2.5 mt-2 text-sm"
              name="city"
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                setDistricts([]);
                setCommunes([]);
              }}
            >
              <option value="0">Chọn tỉnh/thành phố</option>
              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-base">Quận/Huyện</p>
            <select
              value={selectedDistrict}
              id="district-town"
              class="w-full border rounded-lg px-3 py-2.5 mt-2 text-sm disabled:cursor-not-allowed"
              name="district"
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={districts.length === 0}
            >
              <option value="0">Chọn quận/huyện</option>
              {districts.map((district) => (
                <option key={district.code} value={district.code}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-base">Xã</p>
            <select
              value={selectedCommune}
              id="ward-commune"
              class="w-full border rounded-lg px-3 py-2.5 text-sm mt-2 disabled:cursor-not-allowed"
              name="ward"
              disabled={communes.length === 0}
              onChange={(e) => setSelectedCommune(e.target.value)}
            >
              <option value="0">Chọn xã</option>
              {communes.map((commune) => (
                <option key={commune.code} value={commune.code}>
                  {commune.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-base">Đường</p>
            <input
              type="text"
              className="px-5 py-3 mt-2 border rounded-lg text-sm w-[100%]"
              placeholder="VD: Số 81, đường số 6"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            ></input>
          </div>
        </div>
        <button
          className="bg-[#a93f15] text-white px-4 py-2 rounded-md"
          onClick={() => handleUpdateOrderAddress()}
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

export default EditAddress;
