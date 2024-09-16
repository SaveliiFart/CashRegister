const { ipcRenderer } = require("electron");
document.addEventListener("DOMContentLoaded", () => {
  let tovar = [];

  let paymentMethod;

  let date_ob = new Date();
  let date =
    ("0" + date_ob.getDate()).slice(-2) +
    "." +
    ("0" + (date_ob.getMonth() + 1)).slice(-2) +
    "." +
    date_ob.getFullYear();
  let time = date_ob.getHours() + ":" + date_ob.getMinutes();
  console.log(time);
  console.log(date);

  let receiptData;
  let promices = [];
  let CurrentPromice = new Promise((resolve, reject) => {
    ipcRenderer.send("get-print-receipt");
    resolve();
  });
  promices.push(CurrentPromice);

  Promise.all(promices).then(() => {});

  ipcRenderer.on("print-receipt", (event, data) => {
    console.log("ПИЗДА ПОЛУЧИЛОСЬ");
    receiptData = data;
    tovar = receiptData.list;
    paymentMethod = receiptData.OplataType;

    if (paymentMethod == true) {
      paymentMethod = "Готівка";
    } else if (paymentMethod == false) {
      paymentMethod = "Безготівка";
    }

    let detailsTable = document.querySelector(".details_table");

    let tableContent = `
  <tr>
    <td>Кассир [1011]</td>
    <td></td>
  </tr>
  <tr>
    <td>Клиент [******]</td>
    <td></td>
  </tr>
`;

    for (const key in tovar) {
      if (tovar.hasOwnProperty(key)) {
        tableContent += `
          <tr>
            <td>${tovar[key][0]}</td>
            <td>${tovar[key][1]} x ${tovar[key][2]} = ${tovar[key][3]}</td>
          </tr>
        `;
      }
    }

    detailsTable.innerHTML = tableContent;
    
    if (receiptData.discount == 0) {
        document.querySelector(".total").innerHTML =
          `
                  <div>ДО СПЛАТИ: ${receiptData.total}</div>
                  <div>${paymentMethod}: ${receiptData.total}</div>
          `
    } else {
      document.querySelector(".total").innerHTML =
        `
                <div>Знижка: ${receiptData.discount} %</div>
                <div>ДО СПЛАТИ: ${receiptData.total}</div>
                <div>${paymentMethod}: ${receiptData.total}</div>
        `
    };

    document.querySelector(".header_date").textContent = `ЧЕК от ${date}`;
    document.querySelector(
      ".footer_date"
    ).textContent = `Дата чеку: ${date} ${time}`;

    console.log(tovar);
    console.log(paymentMethod);
    console.log(receiptData);
  });
});
