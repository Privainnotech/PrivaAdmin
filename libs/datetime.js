const checkMonth = () => {
  let today = new Date();
  let mm = today.getMonth() + 1;
  let yyyy = today.getFullYear();
  console.log(yyyy, mm);
  if (mm < 10) mm = "0" + mm;
  return `${yyyy}${mm}`;
};

const checkDate = () => {
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1;
  let yyyy = today.getFullYear();
  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;
  return yyyy + "/" + mm + "/" + dd;
};

const checkTime = () => {
  let today = new Date();
  let SS = today.getSeconds();
  let MM = today.getMinutes();
  let HH = today.getHours();
  let dd = today.getDate();
  let mm = today.getMonth() + 1;
  let yyyy = today.getFullYear();
  if (SS < 10) SS = "0" + SS;
  if (MM < 10) MM = "0" + MM;
  if (HH < 10) HH = "0" + HH;
  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;
  return yyyy + "/" + mm + "/" + dd + " " + HH + ":" + MM + ":" + SS;
};

module.exports = {
  checkMonth,
  checkDate,
  checkTime,
};
