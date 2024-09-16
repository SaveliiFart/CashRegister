const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    const totalPriceInput = document.querySelector(".to__pay-input-payable");
    const firstInput = document.querySelector(".to__pay-input-contribution");
    const thirdInput = document.querySelector(".rest-input")
    let paymentMethodSelected = false

    ipcRenderer.send('request-total-price');

    // Принимаем ответ от главного процесса
    ipcRenderer.on('response-total-price', (event, totalSum) => {
        console.log('Received total price from main process:', totalSum);
        totalPriceInput.value = totalSum;
    });

    ipcRenderer.on('response-final', (event, data) => {
        console.log('Received final data from main process:', data);
    });

    document.getElementById("btn_close").addEventListener("click", (e) => {
        ipcRenderer.send('Final_Receipt');
    });

    document.querySelector(".payment__method").addEventListener("click", (e) => {
        const target = e.target;

        if(target.classList.contains("cash")){
            console.log("Click cash")
            ipcRenderer.send("cashBuy", true)
            paymentMethodSelected = true
        } else if(target.classList.contains("cashless")) {
            console.log("Click cashless")
            firstInput.value = totalPriceInput.value;
            ipcRenderer.send("cashBuy", false)
            paymentMethodSelected = true
        }
    });

    document.getElementById('btn_calc').addEventListener('click', () => {
       
        if (!paymentMethodSelected) {
            alert("Выберите способ оплаты");
            return;
        }

        let change = firstInput.value - totalPriceInput.value;
        thirdInput.value = change;

    });
});