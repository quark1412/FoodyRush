import { useState, useEffect, useContext, useMemo } from "react";

import { Dropdown, Table } from "flowbite-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import Calendar from "../../components/Calendar";
import { getStatistics } from "../../data/statistic";
import { formatToVND } from "../../utils/format";
import Error from "../Error";
import AuthContext from "../../context/AuthContext";
import Cookies from "js-cookie";
import { ITEM_PER_PAGE } from "../../utils/Constants";
import Pagination from "../../components/Pagination";

export default function Report() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedView, setSelectedView] = useState("week");
  const [showPicker, setShowPicker] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [statistics, setStatistics] = useState([]);
  const [totalOrder, setTotalOrder] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const { auth, setHasError } = useContext(AuthContext);
  const permission = Cookies.get("permission") ?? null;

  const getCurrentDateRange = (date) => {
    if (selectedView === "week") {
      const startOfWeek = date
        .startOf("week")
        .add(date.startOf("week").day() === 0 ? 1 : 0, "day");
      const endOfWeek = startOfWeek.add(6, "days");
      return `${startOfWeek.format("DD/MM/YYYY")} - ${endOfWeek.format(
        "DD/MM/YYYY"
      )}`;
    } else if (selectedView === "month") {
      return date.format("MM/YYYY");
    } else if (selectedView === "year") {
      return date.format("YYYY");
    }
    return "";
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowPicker(false);
    if (date) {
      setInputValue(getCurrentDateRange(date));
    }
  };

  const fetchData = async () => {
    if (selectedDate) {
      const year = selectedDate.year();
      const month = selectedDate.month() + 1;
      const day = selectedDate.date();

      try {
        if (selectedView === "week") {
          const startOfWeek = selectedDate.startOf("week").add(1, "day");
          const weeklyRevenue = Array(7).fill(0);
          const dailyOrder = Array(7).fill(0);
          const weekStatistics = [];
          const dayArray = Array(7).fill(0);
          const monthArray = Array(7).fill(0);
          const yearArray = Array(7).fill(0);

          for (let i = 0; i < 7; i++) {
            const currentDay = startOfWeek.add(i, "day");
            const response = await getStatistics(
              currentDay.date(),
              currentDay.month() + 1,
              currentDay.year()
            );

            const day = currentDay.add(-1, "day");

            dayArray[i] = day.date();
            monthArray[i] = day.month() + 1;
            yearArray[i] = day.year();
            dailyOrder[i] = response.length !== 0 ? response[0].totalOrder : 0;
            weeklyRevenue[i] =
              response.length !== 0 ? response[0].totalRevenue : 0;

            weekStatistics.push(...response);
          }

          const dailyReport = weeklyRevenue.map((totalRevenue, index) => ({
            day: dayArray[index],
            month: monthArray[index],
            year: yearArray[index],
            totalOrder: dailyOrder[index],
            totalRevenue: totalRevenue,
          }));

          setStatistics(dailyReport);

          const total = weekStatistics.reduce((sum, stat) => {
            return sum + stat.totalRevenue;
          }, 0);
          setTotalRevenue(total);

          setTotalOrder(
            weekStatistics.reduce((sum, stat) => sum + stat.totalOrder, 0)
          );
        } else if (selectedView === "month") {
          const response = await getStatistics("", month, year);

          const daysInMonth = new Date(year, month, 0).getDate();
          const monthlyRevenue = Array(daysInMonth).fill(0);
          const monthlyOrder = Array(daysInMonth).fill(0);

          response.forEach((stat) => {
            if (stat.day) {
              const dayIndex = stat.day - 1;
              if (dayIndex >= 0 && dayIndex < daysInMonth) {
                monthlyOrder[dayIndex] += stat.totalOrder || 0;
                monthlyRevenue[dayIndex] += stat.totalRevenue || 0;
              }
            }
          });

          const dailyReport = monthlyRevenue.map((totalRevenue, index) => ({
            day: index + 1,
            month: month,
            year: year,
            totalOrder: monthlyOrder[index],
            totalRevenue: totalRevenue,
          }));

          setStatistics(dailyReport);

          const total = response.reduce((sum, stat) => {
            return sum + stat.totalRevenue;
          }, 0);

          setTotalOrder(
            response.reduce((sum, stat) => sum + stat.totalOrder, 0)
          );

          setTotalRevenue(total);
        } else if (selectedView === "year") {
          const response = await getStatistics("", "", year);

          const yearlyRevenue = Array(12).fill(0);
          const yearlyOrder = Array(12).fill(0);

          response.forEach((stat) => {
            if (stat._id) {
              if (stat._id.month) {
                const monthIndex = stat._id.month - 1;
                if (monthIndex >= 0 && monthIndex < 12) {
                  yearlyOrder[monthIndex] += stat.totalOrder || 0;
                  yearlyRevenue[monthIndex] += stat.totalRevenue || 0;
                }
              }
            }
          });

          const monthlyReport = yearlyRevenue.map((totalRevenue, index) => ({
            year: year,
            month: index + 1,
            totalOrder: yearlyOrder[index],
            totalRevenue: totalRevenue,
          }));

          setStatistics(monthlyReport);
          const total = response.reduce((sum, stat) => {
            return sum + stat.totalRevenue;
          }, 0);
          setTotalOrder(
            response.reduce((sum, stat) => sum + stat.totalOrder, 0)
          );
          setTotalRevenue(total);
        }
        setCurrentPage(1);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  const chartData = useMemo(() => {
    return selectedView !== "year"
      ? statistics.map((stat) => ({
          date: `${stat?.day}/${stat?.month}/${stat?.year}`,
          revenue: stat.totalRevenue,
        }))
      : statistics.map((stat) => ({
          date: `${stat.month}/${stat.year}`,
          revenue: stat.totalRevenue,
        }));
  }, [statistics, selectedView]);

  const currentStatistics = statistics.slice(
    (currentPage - 1) * ITEM_PER_PAGE,
    currentPage * ITEM_PER_PAGE
  );

  const handleViewChange = (value) => {
    setSelectedView(value);
    setInputValue(getCurrentDateRange(dayjs()));
    fetchData();
  };

  useEffect(() => {
    const currentDate = dayjs();
    setSelectedDate(currentDate);
    setInputValue(getCurrentDateRange(currentDate));
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDate || selectedView) {
      fetchData();
    }
  }, [selectedDate, selectedView]);

  useEffect(() => {
    setInputValue(getCurrentDateRange(dayjs()));
  }, [selectedView]);

  const handleExportReport = () => {
    if (!selectedDate) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Bảng Báo Cáo");

    worksheet.mergeCells("A2:D2");
    const reportCell2 = worksheet.getCell("A2");
    if (selectedView === "month") {
      reportCell2.value =
        "Tháng: " + (selectedDate?.month() + 1) + "/" + selectedDate?.year();
    } else if (selectedView === "year") {
      reportCell2.value = "Năm: " + selectedDate?.year();
    } else {
      reportCell2.value = "Tuần: " + getCurrentDateRange(selectedDate);
    }
    reportCell2.font = { bold: true };
    reportCell2.alignment = { vertical: "middle", horizontal: "center" };

    worksheet.getRow(3).values = [
      "STT",
      "Thời gian",
      "Số đơn hàng",
      "Doanh thu",
    ];
    const headerRow = worksheet.getRow(3);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFCCEEFF" },
      };
      cell.alignment = { horizontal: "left" };
      cell.border = {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
      };
    });

    statistics.forEach((stat, index) => {
      worksheet.addRow([
        index + 1,
        selectedView !== "year"
          ? `${stat.day}/${stat.month}/${stat.year}`
          : `${stat.month}/${stat.year}`,
        stat.totalOrder,
        stat.totalRevenue,
      ]);
    });

    worksheet.columns = [
      { key: "no", width: 5 },
      { key: "date", width: 20 },
      { key: "total_order", width: 20 },
      { key: "total_revenue", width: 25 },
    ];

    const fileName = `Báo_Cáo_Doanh_Thu_${dayjs().format("YYYYMMDD")}.xlsx`;
    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(new Blob([buffer]), fileName);
    });
  };

  if (!permission || !permission.includes("REPORT")) {
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
      <p className="font-extrabold text-xl">Báo cáo</p>
      <div className="bg-white rounded-lg mt-10 p-6 shadow-md w-full flex flex-col gap-y-5">
        <div className="flex flex-row gap-x-3 items-center">
          <div>
            <input
              onClick={() => setShowPicker(true)}
              value={inputValue}
              placeholder="Chọn ngày"
              className="w-full font-semibold font-manrope px-5 py-3 focus:outline-none rounded-lg bg-[#F8F8F8] text-[#0a0a0a] text-sm"
              readOnly
            />
            {showPicker && (
              <Calendar
                setNewTime={handleDateChange}
                value={selectedDate}
                timeOption={selectedView}
                handlerSetNewTime={handleDateChange}
              />
            )}
          </div>
          <select
            value={selectedView}
            onChange={(e) => handleViewChange(e.target.value)}
            className="w-fit h-fit font-semibold font-manrope px-5 py-3 border-none focus:ring-0 focus:outline-none rounded-lg bg-[#F8F8F8] text-[#0a0a0a] text-sm"
            required
          >
            <option value="week" className="font-medium font-manrope text-sm">
              Tuần
            </option>
            <option value="month" className="font-medium font-manrope text-sm">
              Tháng
            </option>
            <option value="year" className="font-medium font-manrope text-sm">
              Năm
            </option>
          </select>
          <button
            onClick={handleExportReport}
            className="px-6 py-3 h-full rounded-lg bg-[#a93f15] text-white text-sm font-extrabold ml-4"
          >
            Xuất báo cáo
          </button>
        </div>
        <div className="flex justify-between">
          <Table hoverable>
            <Table.Head className="normal-case text-sm">
              <Table.HeadCell className="w-40">STT</Table.HeadCell>
              <Table.HeadCell className="w-40">Thời gian</Table.HeadCell>
              <Table.HeadCell className="w-40">Số đơn hàng</Table.HeadCell>
              <Table.HeadCell className="w-40">Doanh thu</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {currentStatistics.map((stat, index) => (
                <Table.Row key={index}>
                  <Table.Cell>{index + 1}</Table.Cell>
                  <Table.Cell>
                    {selectedView !== "year"
                      ? `${stat.day}/${stat.month}/${stat.year}`
                      : `${stat.month}/${stat.year}`}
                  </Table.Cell>
                  <Table.Cell>{stat.totalOrder}</Table.Cell>
                  <Table.Cell>{formatToVND(stat.totalRevenue)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            {currentStatistics.length > 0 && (
              <div className="mt-2">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(statistics.length / ITEM_PER_PAGE)}
                  onPageChange={setCurrentPage}
                  svgClassName={"w-5 h-5"}
                  textClassName={"text-sm px-3 py-2"}
                />
              </div>
            )}
          </Table>
          <Table>
            <Table.Head className="normal-case text-sm">
              <Table.HeadCell>Thông tin</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              <Table.Row>
                <Table.Cell>
                  <div className="w-[400px] flex justify-between font-semibold">
                    <p>Tổng đơn hàng</p>
                    <p>{totalOrder}</p>
                  </div>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <div className="w-[400px] flex justify-between font-semibold">
                    <p>Tổng doanh thu</p>
                    <p>{formatToVND(totalRevenue)}</p>
                  </div>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </div>
        <div className="bg-white rounded-lg flex flex-col gap-y-2">
          <p className="font-bold">Doanh thu</p>
          <p className="text-2xl font-bold">{formatToVND(totalRevenue)}</p>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart
              data={chartData}
              className="font-semibold text-xs"
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#82ca9d"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
