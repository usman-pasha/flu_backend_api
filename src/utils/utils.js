import logger from "./logger.js";

export const tokenStar = (data) => {
  for (const text in data) {
    if (typeof data[text] === "string") {
      const maskedNumbers = data[text].slice(1, 2);
      const lastVisibleNumbers = data[text].slice(-4);

      const maskedValue = maskedNumbers.replace(/./g, "*") + lastVisibleNumbers;
      logger.info(`${text}: ${maskedValue}`);
    } else if (typeof data[text] === "number") {
      const maskedNumbers = data[text].toString().slice(1, 2);
      const lastVisibleNumbers = data[text].toString().slice(-2);

      const maskedValue = maskedNumbers.replace(/./g, "*") + lastVisibleNumbers;
      logger.info(`${text}: ${maskedValue}`);
    }
  }
};

export const starPattern = (data) => {
  for (const text in data) {
    if (typeof data[text] === "string") {
      const maskedNumbers = data[text].slice(1, 2);
      const lastVisibleNumbers = data[text].slice(-5);

      const maskedValue = maskedNumbers.replace(/./g, "*") + lastVisibleNumbers;
      logger.info(`${text}: ${maskedValue}`);
    }

    if (Array.isArray(data[text])) {
      for (const item of data[text]) {
        for (const key in item) {
          const maskedNumbers = item[key].toString().slice(1, 2);
          const lastVisibleNumbers = item[key].toString().slice(-5);

          const maskedItem = maskedNumbers.replace(/./g, "*") + lastVisibleNumbers;
          logger.info(`${key}: ${maskedItem}`);
        }
      }
    }
  }
};
export const generateOTP = (digits = 4) => {
  const num = Math.pow(10, digits - 1);
  return Math.floor(num + Math.random() * 9 * num);
};