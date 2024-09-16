const { ipcRenderer } = require("electron");
const fs = require("fs-extra");


const dom = {
    inputNazva: document.querySelector('.main__posluga-nazva'),
    inputPrice: document.querySelector('.main__posluga-price'),
    btn: document.querySelector('#btn'),
};


dom.btn.addEventListener('click', () => {
    let Price = [];
    Price[0] = {
        IDSTRIH: 1,
        NAME: dom.inputNazva.value,
        MODEL: '-',
        COLOR: '-',
        DISCOUNT: 0,
        type: null,
        quatity: 0,
        QUALITY: 1,
        CENA: dom.inputPrice.value
    };
    let DataSet = [];
    DataSet.push({Price});

    fs.readFile("./Info.json", 'utf8', (err, data) => {
        if (err) {
        console.error('Ошибка чтения файла:', err);
        return;
        }
        const jsonData = JSON.parse(data);
        jsonData.PoslugaSalary += Number(dom.inputPrice.value);
        const updatedData = JSON.stringify(jsonData, null, 2);
        fs.writeFile("./Info.json", updatedData, 'utf8', (err) => {
        if (err) {
            console.error('Ошибка записи файла:', err);
            return;
        }

        console.log('Значение поля "age" обновлено успешно.');
        });
    });
    
    ipcRenderer.send('TotalPriceVal', dom.inputPrice.value);
    // ipcRenderer.send('OpenPrice');
    ipcRenderer.send('DataSend', DataSet);
    ipcRenderer.send('request-posluga');


});