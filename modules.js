const { BrowserWindow, webContents } = require("electron");
const XlsxPopulate = require("./node_modules/xlsx-populate");
const Workbook = require("xlsx-populate/lib/Workbook");

module.exports = {
/** 
* @param {number} width - width of window
* @param {number} height - height of window
* @param {boolean} withDev - Will there be a window with dev tools?
* @param {boolean} resizable - Will the window be resizable?
* @param {BrowserWindow} parent - Parent window
* @param {string} path - Path to your HTML file
* @param {string} ButtonID - ID close button
*/
    createWindow: function(width, height, withDev, resizable, parent, path, ButtonID = null, isPrinted = 0){
        const name = new BrowserWindow({
        width: width,
        height: height,
        parent: parent,
        webPreferences: {
          webSecurity: true,
          enableRemoteModule: true,
          nodeIntegration: true,
          contextIsolation: false,
        },
        resizable: resizable,
      });
      if(withDev){
      name.webContents.openDevTools();
      }
      name.setMenu(null);
      name.loadFile(path);
      name.webContents.on('did-finish-load', () => {
        const buttonID = ButtonID;
        if(isPrinted != 0){
          name.webContents.print({silent: false, printBackground: true, pageSize: {
            height: 210000,
            width: 58000,
          },margins: { 
            marginType: 'custom',
            top: 5,
            bottom: 5,
            left: 0,
            right: 0
        }, });
        }
        if (buttonID) {
          name.webContents.executeJavaScript(`
            document.getElementById('${buttonID}').addEventListener('click', () => {
              window.close();
            });
          `);
          console.log('Button added');
        }
      });
      name.on("closed", () => {});
    },

    /**
     * 
     * @param {string} CellID 
     * @param {string} Data 
     * @param {string} date 
     * @param {number} index 
     */

    addXLSX: function(CellID, Data, date, index) {
      XlsxPopulate.fromFileAsync("./excel/" + date + ".xlsx")
        .then(Workbook => {
          const sheet = Workbook.sheet(0);

          if (!sheet) {
            throw new Error("Sheet at index 0 not found");
          }
          const PickCell = sheet.cell(CellID + (index + 2));

          const currentValue = PickCell.value();
          const newValue = Data + '\n';

          if (currentValue !== null && currentValue !== undefined) {
            PickCell.value(currentValue + newValue);
          } else {
            PickCell.value(newValue);
          }

          return Workbook.toFileAsync("./excel/" + date + ".xlsx");
        })
        .catch(error => {
          console.error('Произошла ошибка:', error);
        });
}
  };