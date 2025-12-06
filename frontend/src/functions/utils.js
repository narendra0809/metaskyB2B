export const getTotal = (...rest) => {
  let sum = 0;
  for (let i = 0; i < rest.length; i++) {
    if (isNaN(rest[i])) throw new Error(`Invalid value ${rest[i]}`);
    sum += Number(rest[i]);
  }
  return sum;
};

export const extractRates = (rateString) => {
  const adultMatch = rateString.match(/Adult:\s*(\d+)/);
  const childMatch = rateString.match(/Child:\s*(\d+)/);

  const adultRate = adultMatch ? Number(adultMatch[1]) : null;
  const childRate = childMatch ? Number(childMatch[1]) : null;

  return { adultRate, childRate };
};

export const convertTo12HoursFormate = (time) => {
  if (!time) return "";

  let [hours, minutes] = time.split(":");

  hours = parseInt(hours, 10);

  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;

  hours = hours ? hours : 12;

  return `${hours}:${minutes} ${ampm}`;
};
