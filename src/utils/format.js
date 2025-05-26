export const formatURL = (url) => {
  if (!url) return "";
  return url.replace(/\\/g, "//");
};

export const formatDate = (date) => {
  if (!date) return "";

  if (typeof date === "string") {
    date = new Date(date);
  }

  if (!(date instanceof Date) || isNaN(date)) {
    return "";
  }

  return date.toLocaleDateString("vi-VN");
};

export const getTime = (dateTime) => {
  const date = new Date(dateTime);
  const localTime = date.toLocaleTimeString("vi-VN");

  return localTime;
};

export const formatMoney = (number) => {
  const strNumber = String(number);
  const parts = strNumber.split(/(?=(?:\d{3})+(?!\d))/);
  const formattedNumber = parts.join(".");
  return formattedNumber;
};

export const formatLargeMoney = (number) => {
  if (number <= 999999999) return formatMoney(number);

  if (number <= 999999999999) {
    if (Math.floor(number / 1000000000) >= 100)
      return Math.floor(number / 1000000000) + "B";
    else
      return (
        Math.floor(number / 1000000000) +
        "," +
        Math.floor((number % 1000000000) / 100000000) +
        "B"
      );
  }
  if (number <= 999999999999999) {
    if (Math.floor(number / 1000000000000) >= 100)
      return Math.floor(number / 1000000000000) + "T";
    else
      return (
        Math.floor(number / 1000000000000) +
        "," +
        Math.floor((number % 1000000000000) / 100000000000) +
        "T"
      );
  }
};

export const formatToVND = (number) => {
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  return formatter.format(number);
};

export const formatNumber = (number) => {
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(number);
};
