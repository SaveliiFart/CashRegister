const { app, BrowserWindow, Menu, ipcMain } = require("electron");
var mysql = require("mysql");
const fs = require("fs-extra");
const path = require("node:path");
const { maxHeaderSize } = require("node:http");
const SettingsPath = "./settings.json";
const XlsxPopulate = require("xlsx-populate");
const modules = require('./modules.js');
const { eventNames } = require("node:process");

// Обьявление
let globalHost, globalUser, globalPassword, globalDatabase, oldData;
let childWindow;
let mainWindow;
let TOTAL;
let DISCOUNT;
let i;
let OplataType
let DataSet;

let date_ob = new Date();
let date =
  ("0" + date_ob.getDate()).slice(-2) +
  ("0" + (date_ob.getMonth() + 1)).slice(-2) +
  date_ob.getFullYear();
console.log(date);

function readSettingsSync() {
  try {
    const data = fs.readFileSync(SettingsPath, "utf8");
    const jsonData = JSON.parse(data);

    globalHost = jsonData.Database_Settings.host;
    globalUser = jsonData.Database_Settings.username;
    globalPassword = jsonData.Database_Settings.password;
    globalDatabase = jsonData.Database_Settings.database_name;
    oldData = jsonData.TimeSettings.Olddate;
  } catch (error) {
    console.error("Ошибка при чтении файла:", error);
  }
}

readSettingsSync();

console.log(globalHost, globalUser, globalPassword, globalDatabase);

// Работа с бд
var connection = mysql.createConnection({
  host: globalHost,
  user: globalUser,
  password: globalPassword,
  database: globalDatabase,
});

if (oldData != date) {
  fs.pathExists("./excel/" + date + ".xlsx")
  .then(exists => {
    if (exists) {
      console.log(`Файл ./excel/` + date + `.xlsx существует.`);
    } else {
      XlsxPopulate.fromFileAsync("./excel/file_maket.xlsx").then((workbook) => {
        return workbook.toFileAsync("./excel/" + date + ".xlsx");
    })
  }
});
}
connection.connect();

connection.query("SELECT 1 + 1 AS solution", function (error, results, fields) {
  if (error) throw error;
  console.log("The solution is: ", results[0].solution);
});

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: maxHeaderSize,
    height: maxHeaderSize,
    webPreferences: {
      webSecurity: true,
      enableRemoteModule: true,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.webContents.openDevTools();
  mainWindow.loadFile("./html/index.html");

  ipcMain.on("searchInfo", (event, input) => {
    if (isNaN(input)) {
      if(input.length > 1){
        connection.query(
          "SELECT * FROM `tovar` WHERE `NAME` = ? AND `COLOR` = ? AND `MODEL` = ?",
          [input[0], input[1], input[2]],
          function (error, results, fields) {
            mainWindow.webContents.send("searchOutput", results);
          }
        );
      } else {
      connection.query(
        "SELECT * FROM `tovar` WHERE `NAME` = ?",
        [input[0]],
        function (error, results, fields) {
          if (!results[0]) {
            connection.query(
              "SELECT * FROM `tovar` WHERE `MODEL` = ?",
              [input[0]],
              function (error, results2, fields) {
                mainWindow.webContents.send("searchOutput", results2);
              }
            );
          }
          mainWindow.webContents.send("searchOutput", results);
        }
      );
      }
    } else {
      connection.query(
        "SELECT * FROM `tovar` WHERE `IDSTRIH` = ?",
        [input[0]],
        function (error, results, fields) {
          mainWindow.webContents.send("searchOutput", results);
        }
      );
    }
  });

  ipcMain.on("Final_Receipt", (event) => {
    modules.createWindow(500, 400, true, false, mainWindow, "./html/receipt.html", null, 1); 
    mainWindow.webContents.send("receipt");
  });

  let receipt;

  ipcMain.on("receipt_return", (event, data) => {
    console.log("resp " + data)
    data.OplataType = OplataType;
    return receipt = data;
  });

  ipcMain.on("get-print-receipt", (event) => {
    console.log("print" + receipt);
    event.reply("print-receipt", receipt);
  });

  ipcMain.on("request-posluga", (event) => {
    console.log(DataSet);
    mainWindow.webContents.send("response-posluga", DataSet);
  });

  ipcMain.on("DataSend", (event, data) => {
    console.log("data" + data);
    return DataSet = data;
  });
  
  ipcMain.on("cashBuy", (event, data) =>{
    console.log("cash" + data)
    mainWindow.webContents.send('cash', data);
    return OplataType = data;
  })

  ipcMain.on("request-discount", (event) => {
    mainWindow.webContents.send("response-discount", DISCOUNT);
  });

  ipcMain.on("discount", (event, discount) => {
    return DISCOUNT = discount;
  });

  // Добавим обработчик для получения значения из дочернего процесса
  ipcMain.on("request-total-price", (event) => {
    event.reply("response-total-price", TOTAL);
  });

  ipcMain.on("GetPrice", (event, ID) => {
    connection.query(
      "SELECT `IDSTRIH`,`CENA`, `NAME`, `COLOR`, `MODEL`, `DISCOUNT`, `QUALITY` FROM `tovar` WHERE `IDSTRIH` = ?",
      [ID],
      function (error, results, fields) {
        mainWindow.webContents.send("PriceReturn", results);
      }
    );
  });

};


app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
  connection.end();
});

const template = [
  {
    label: "База данних",
    submenu: [
      {
        label: "Додати товар",
        click: () => {
          //Функція додавання товару в базу данних
          modules.createWindow(400, 350, false, false, mainWindow, "./html/add.html","btn_add1",0)
        },
      },
      {
        label: "Видалити товар",
        click: () => {
          //Функція видяляння товару в базу данних
          modules.createWindow(500, 300, false, false, mainWindow, "./html/delete.html", 'btn_add1',0)
        },
      },
      {
        label: "Змінити кількість товару",
        click: () => {
          modules.createWindow(500, 350, false, false, mainWindow, "./html/edit.html", 'btn_add1',0)
        },
      },
    ],
  },
  {
    label: "Налаштування",
    click: () => {
      //Функція відкриття діалового вікна з налаштуваннями програми
      modules.createWindow(500, 800, true, false, mainWindow, "./html/settings.html")
    },
  },
  {
    label: "Чек",
    click:() => {
      modules.createWindow(300, 1000, true, false, mainWindow, "./html/x-otchet.html", null, 1);    
    }
  },
  {
    label: "Повернення товару",
    click: () => {
      modules.createWindow(500, 350, false, false, mainWindow, "./html/purchase_returns.html", 'btn_add1')
    },
  },
  {
    label: "Вихід",
    click: () => {
      app.quit();
    },
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

ipcMain.on("addClient", (event, client) => {
  connection.query(
    "INSERT INTO `сlient`(`name`, `surname`, `phone`) VALUES (?,?,?)",
    [client.name, client.surname, client.phone],
    function (error, results, fields) {
      if (error) {
        console.error("Ошибка выполнения запроса:", error);
      } else {
      }
    }
  );
});

ipcMain.on("deleteClient", (event, client) => {
  connection.query(
    "DELETE FROM `сlient` WHERE `phone` = ?",
    [client.phone],
    function (error, results, fields) {
      if (error) {
        console.error("Ошибка выполнения запроса:", error);
      } else {
      }
    }
  );
});

ipcMain.on("editClient", (event, client) => {
    connection.query(
      "UPDATE `сlient` SET `phone` = ? WHERE `name` = ? AND `surname` = ?",
      [client.phone, client.name, client.surname],
      function (error, results, fields) {
        if (error) {
          console.error("Ошибка выполнения запроса:", error);
        } else {
          // Обработка результатов
        }
      }
    );
});

ipcMain.on("searchClient", (event, client) => {
  connection.query(
    "SELECT * FROM `сlient` WHERE `phone` = ?",
    [client.phone],
    function (error, results, fields) {
      if (error) {
        console.error("Ошибка выполнения запроса:", error);
      } else {
        event.reply("getClient", results);
      }
    }
  );
});

ipcMain.on("addProduct", (event, product) => {
  console.log(product);
  connection.query(
    "SELECT * FROM `tovar` WHERE `IDSTRIH` = ?",
    [product.strih],
    function (error, results, fields) {

      if (results.length > 0) {
        let isNull = results[0];
        let finalQual = Number(isNull.QUALITY) + Number(product.quality);

        connection.query(
          "UPDATE `tovar` SET `QUALITY` = ? WHERE `IDSTRIH` = ?",
          [finalQual, product.strih],
          function (error, results, fields) {
            if (error) {
              console.error("Ошибка выполнения запроса:", error);
            } else {
              // Обработка результатов
            }
          }
        );
      } else {
        connection.query(
          "INSERT INTO `tovar` (`IDSTRIH`, `NAME`, `COLOR`, `QUALITY`, `CENA`, `MODEL`) VALUES (?, ?, ?, ?, ?, ?)",
          [
            product.strih,
            product.name,
            product.color,
            product.quality,
            product.cena,
            product.model,
          ],
          function (error, results, fields) {
            if (error) {
              console.error("Ошибка выполнения запроса:", error);
            } else {
              // Обработка результатов
            }
          }
        );
      }
    }
  );
});

ipcMain.on("deleteProduct", (event, product) => {
  connection.query(
    "SELECT * FROM `tovar` WHERE `IDSTRIH` = ?",
    [product.strih],
    function (error, results, fields) {
      if (results.length > 0) {
        let isNull = results[0];
        let finalQual = Number(isNull.QUALITY) - Number(product.quality);
        if (finalQual > 0) {
          connection.query(
            "UPDATE `tovar` SET `QUALITY` = ? WHERE `IDSTRIH` = ?",
            [finalQual, product.strih],
            function (error, results, fields) {
              if (error) {
                console.error("Ошибка выполнения запроса:", error);
              } else {
                // Обработка результатов
              }
            }
          );
        } else if (finalQual < 0) {
          connection.query(
            "UPDATE `tovar` SET `QUALITY` = ? WHERE `IDSTRIH` = ?",
            [0, product.strih],
            function (error, results, fields) {
              if (error) {
                console.error("Ошибка выполнения запроса:", error);
              } else {
                // Обработка результатов
              }
            }
          );
        }
      }
    }
  );
});

ipcMain.on("OpenPosluga", (event) =>{
  modules.createWindow(500, 550, false, false, mainWindow, "./html/posluga.html", 'btn',0);
});

ipcMain.on("OpenPrice", (event) => {
  modules.createWindow(580, 500, false, false, mainWindow, "./html/finish-price.html", "btn_close",0);
});

ipcMain.on("OpenDiscount", (event) => {
  modules.createWindow(400, 220, false, false, mainWindow, "./html/discount.html", "btn_dis",0);
});

ipcMain.on("OpenClient", (event) => {
  modules.createWindow(500, 470, false, false, mainWindow, "./html/client.html", "btn_close" ,0);
});

ipcMain.on("EditProduct", (event, product) => {
  connection.query(
    "SELECT * FROM `tovar` WHERE `IDSTRIH` = ?",
    [product.strih],
    function (error, results, fields) {

      if (results.length > 0) {
        let isNull = results[0];
        let finalQual = Number(isNull.QUALITY) + Number(product.quality);

        connection.query(
          "UPDATE `tovar` SET `QUALITY` = ? WHERE `IDSTRIH` = ?",
          [finalQual, product.strih],
          function (error, results, fields) {
            if (error) {
              console.error("Ошибка выполнения запроса:", error);
            } else {
              // Обработка результатов
            }
          }
        );
      }
    }
  );
});

ipcMain.on("PurchaseProduct", (event, returns) => {
  connection.query(
    "SELECT * FROM `tovar` WHERE `IDSTRIH` = ?",
    [returns.strih],
    function (error, results, fields) {

      if (results.length > 0) {
        let isNull = results[0];
        let finalQual = Number(isNull.QUALITY) + Number(returns.quality);

        connection.query(
          "UPDATE `tovar` SET `QUALITY` = ? WHERE `IDSTRIH` = ?",
          [finalQual, returns.strih],
          function (error, results, fields) {
            if (error) {
              console.error("Ошибка выполнения запроса:", error);
            } else {
              // Обработка результатов
            }
          }
        );
      }
    }
  );
});

ipcMain.on("TotalPriceVal", (event, totalSum) => {
  return (TOTAL = totalSum);
});

ipcMain.on('Final', (event) => {
  let NewQuantity;
  console.log(DataSet[0]);
  for (let i = 0; i < DataSet.length; i++) {
    connection.query(
      'SELECT `QUALITY` FROM `tovar` WHERE `IDSTRIH` = ?', 
      [DataSet[i].Price[0].IDSTRIH], 
      (function (index) {
        return function (error, results, fields) {
          NewQuantity = results[0].QUALITY
          for(let j = 0; j < DataSet[index].Price[0].quatity; j++){
            NewQuantity = NewQuantity - 1;
          }
          
          connection.query(
            "UPDATE `tovar` SET `QUALITY` = ? WHERE `IDSTRIH` = ?",
            [NewQuantity, DataSet[index].Price[0].IDSTRIH],
            function (updateError, updateResults, updateFields) {
              if (updateError) {
                console.error("Error:", updateError);
              } else {
                // Обработка результатов
              }
            }
          );
        };
      })(i)
    );
  }
  fs.readFile("./Info.json", 'utf8', (err, data) => {
    if (err) {
      console.error('Ошибка чтения файла:', err);
      return;
    }
  const jsonData = JSON.parse(data);
  jsonData.Total += Number(TOTAL);
  console.log(OplataType);
  if(OplataType == true){
    jsonData.TotalInCash += Number(TOTAL);
  }
  else if(OplataType == false){
    jsonData.TotalOnCash += Number(TOTAL);
  }
  jsonData.OldDate = date;
  const updatedData = JSON.stringify(jsonData, null, 2);
    fs.writeFile("./Info.json", updatedData, 'utf8', (err) => {
      if (err) {
        console.error('Ошибка записи файла:', err);
        return;
      }

      console.log('Значение поля "age" обновлено успешно.');
    });
  });
  XlsxPopulate.fromFileAsync("./excel/" + date + ".xlsx")
    .then(workbook => {    
      const sheet = workbook.sheet(0);
      i = sheet.cell('Y1').value()
      sheet.cell('A' + (i + 2)).value(i + 1);
      for (let f = 0; f < DataSet.length; f++) {
        const cell = sheet.cell('B' + (i + 2));
        const currentValue = cell.value();
        const newValue = DataSet[f].Price[0].IDSTRIH + '\n';

        if (currentValue !== null && currentValue !== undefined) {
          cell.value(currentValue + newValue);
        } else {
          cell.value(newValue);
        }
      }
      for (let f = 0; f < DataSet.length; f++) {
        const cell = sheet.cell('C' + (i + 2));
        const currentValue = cell.value();
        const newValue = DataSet[f].Price[0].NAME + " " + DataSet[f].Price[0].MODEL + " " + DataSet[f].Price[0].COLOR +'\n';

        if (currentValue !== null && currentValue !== undefined) {
          cell.value(currentValue + newValue);
        } else {
          cell.value(newValue);
        }
      }
      for (let f = 0; f < DataSet.length; f++) {
        const cell = sheet.cell('D' + (i + 2));
        const currentValue = cell.value();
        const newValue = DataSet[f].Price[0].quatity +'\n';
        if (currentValue !== null && currentValue !== undefined) {
          cell.value(currentValue + newValue);
        } else {
          cell.value(newValue);
        }
      }
      for (let f = 0; f < DataSet.length; f++) {
        const cell = sheet.cell('E' + (i + 2));
        const cell1 = sheet.cell('G' + (i + 2));
        const cell2 = sheet.cell('J' + (i + 2));
        const currentValue = cell.value();
        const currentValue1 = cell1.value();
        const currentValue2 = cell2.value();
        const newValue = DataSet[f].Price[0].CENA +'\n';
        if (currentValue !== null && currentValue !== undefined) {
          cell.value(currentValue + newValue);
          cell1.value(currentValue1 + newValue);
          cell2.value(currentValue2 + newValue);
        } else {
          cell.value(newValue);
          cell1.value(newValue);
          cell2.value(newValue);
        }
      }
      for (let f = 0; f < DataSet.length; f++) {
        const cell = sheet.cell('F' + (i + 2));
        const cell1 = sheet.cell('K' + (i + 2));
        const currentValue = cell.value();
        const currentValue1 = cell1.value();
        const newValue = (DataSet[f].Price[0].CENA - DataSet[f].Price[0].CENA*0.10) +'\n';
        const newValue1 = ((DataSet[f].Price[0].CENA*0.10)*DataSet[f].Price[0].quatity) +'\n';
        fs.readFile("./Info.json", 'utf8', (err, data) => {
          if (err) {
              console.error('Ошибка чтения файла:', err);
              return;
          }
          // Преобразование JSON-строки в объект
          const jsonData = JSON.parse(data);
          jsonData.SellerSalaryToday += DataSet[f].Price[0].CENA*0.10*DataSet[f].Price[0].quatity;
          const updatedData = JSON.stringify(jsonData, null, 2);
          fs.writeFile("./Info.json", updatedData, 'utf8', (err) => {
            if (err) {
                console.error('Ошибка записи файла:', err);
                return;
            }
    
            console.log('Значение полeй обновлено успешно.');
            });
          });

        if (currentValue !== null && currentValue !== undefined) {
          cell.value(currentValue + newValue);
          cell1.value(currentValue1 + newValue1);
        } else {
          cell.value(newValue);
          cell1.value(newValue1);
        }
      }
      for (let f = 0; f < DataSet.length; f++) {
        const cell = sheet.cell('L' + (i + 2));
        const currentValue = cell.value();
        const newValue = DataSet[f].Price[0].QUALITY +'\n';
        if (currentValue !== null && currentValue !== undefined) {
          cell.value(currentValue + newValue);
        } else {
          cell.value(newValue);
        }
      }
      for (let f = 0; f < DataSet.length; f++) {
        const cell = sheet.cell('H' + (i + 2));
        const currentValue = cell.value();
        if(DISCOUNT > 0) {
          newValue = DISCOUNT + "\n";
        } else{
          newValue = DataSet[f].Price[0].DISCOUNT +'\n';
        }
        if (currentValue !== null && currentValue !== undefined) {
          cell.value(currentValue + newValue);
        } else {
          cell.value(newValue);
        }
      }
      for (let f = 0; f < DataSet.length; f++) {
        const cell = sheet.cell('I' + (i + 2));
        const currentValue = cell.value();
        if(DISCOUNT > 0){
          newValue = DataSet[f].Price[0].CENA - (DataSet[f].Price[0].CENA * DISCOUNT)/100 +'\n';
        }
        else{
          newValue = DataSet[f].Price[0].CENA - (DataSet[f].Price[0].CENA * DataSet[f].Price[0].DISCOUNT)/100 +'\n';
        }
        if (currentValue !== null && currentValue !== undefined) {
          cell.value(currentValue + newValue);
        } else {
          cell.value(newValue);
        }
        const cell2 = sheet.cell('M' + (i + 2));
        cell2.value('0');
        for (let f = 0; f < DataSet.length; f++) {
          const cell = sheet.cell('M' + (i + 2));
          const currentValue = cell.value();
          console.log(currentValue)
          const newValue = DataSet[f].Price[0].quatity;
          if (currentValue !== null && currentValue !== undefined) {
            cell.value(Number(currentValue) + Number(newValue));
            console.log(Number(currentValue),Number(newValue))
          } else {
            cell.value(Number(newValue));
          }
        }

          const cell1 = sheet.cell('N' + (i + 2));
          cell1.value(Number(TOTAL))

          sheet.cell('P1').formula('SUM(N2:N' + (i + 2) + ')');

        sheet.cell('Y1').value(i+1);
      }
      return workbook.toFileAsync("./excel/" + date + ".xlsx");
    })
    .then(() => {
    })
    .catch(error => {
      console.error('Произошла ошибка:', error);
    });
});