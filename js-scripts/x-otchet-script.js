const fs = require("fs-extra");

const dom = {
    date: document.querySelector(".date"),
    balance_start: document.querySelector(".balance_start_money"),
    transaction_amount_cash: document.querySelector(".transaction_amount_cash"),
    transaction_amount_cashless: document.querySelector(".transaction_amount_cashless"),
    amount_cash: document.querySelector("#transaction_amount_cash"), 
    amount_cashless: document.querySelector("#transaction_amount_cashless"),
    total_revenue_money: document.querySelector(".total_revenue_money"),
    commission_revenue_money: document.querySelector(".commission_revenue_money"),
    price_revenue_money: document.querySelector(".price_revenue_money"),
    commission_terminals: document.querySelector(".commission_terminals_-"),
    new_client: document.querySelector(".new_client_-"),
    receipts_over_50_uah_clients: document.querySelector(".receipts_over_50_uah_clients"),
    salary_goods_money: document.querySelector(".salary_goods_money"),
    goods_coefficient_money: document.querySelector(".goods_coefficient_money"),
    service_salary_money: document.querySelector(".service_salary_money"),
    bonus_money: document.querySelector(".bonus_money"),
    in_general_money: document.querySelector(".in_general_money"),
    general_money: document.querySelector("#general_money"),
}

let date_ob = new Date();
let date =
    ("0" + date_ob.getDate()).slice(-2) +
    ("0" + (date_ob.getMonth() + 1)).slice(-2) +
    date_ob.getFullYear();
let dateCheck = date_ob.toISOString().slice(0, 19).replace("T", " ");

fs.readFile("./Info.json", 'utf8', (err, data) => {
    if (err) {
        console.error('Ошибка чтения файла:', err);
        return;
    }

    // Преобразование JSON-строки в объект
    const jsonData = JSON.parse(data);
    console.log(jsonData.Total);
    if(jsonData.OldDate != date){
        console.log("NewDay");
        jsonData.OldTotal += jsonData.Total - jsonData.SellerSalaryToday - jsonData.PoslugaSalary;
        jsonData.Total = 0;
        jsonData.TotalInCash = 0;
        jsonData.TotalOnCash = 0;
        jsonData.SellerSalaryToday = 0;
        jsonData.PoslugaSalary = 0;
        jsonData.OldDate = date;
        const updatedData = JSON.stringify(jsonData, null, 2);
        fs.writeFile("./Info.json", updatedData, 'utf8', (err) => {
        if (err) {
            console.error('Ошибка записи файла:', err);
            return;
        }

        console.log('Значение полeй обновлено успешно.');
        });
    }
    dom.date.innerHTML = dateCheck;
    dom.balance_start.innerHTML = jsonData.OldTotal;
    dom.transaction_amount_cash.innerHTML = jsonData.TotalInCash;
    dom.transaction_amount_cashless.innerHTML = jsonData.TotalOnCash;
    dom.amount_cash.innerHTML = jsonData.TotalInCash;
    dom.amount_cashless.innerHTML = jsonData.TotalOnCash;
    dom.in_general_money.innerHTML = jsonData.Total;
    dom.general_money.innerHTML = jsonData.Total;
    dom.total_revenue_money.innerHTML = jsonData.Total;
    dom.commission_revenue_money.innerHTML = jsonData.Total - jsonData.SellerSalaryToday - jsonData.PoslugaSalary;
    dom.price_revenue_money.innerHTML = jsonData.Total - jsonData.SellerSalaryToday - jsonData.PoslugaSalary;
    dom.salary_goods_money.innerHTML = jsonData.SellerSalaryToday;
    dom.goods_coefficient_money.innerHTML = jsonData.SellerSalaryToday;
    dom.service_salary_money.innerHTML = jsonData.PoslugaSalary;
});


