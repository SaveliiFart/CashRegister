const fs = require("fs-extra");

const dom = {
    host: document.querySelector("#Host"),
    username: document.querySelector("#Username"),
    password: document.querySelector("#Password"),
    database: document.querySelector("#Database"),
    apply: document.querySelector("#Apply")
}
fs.readFile("./settings.json", 'utf8', (err, data) => {
    if (err) {
        console.error('Ошибка чтения файла:', err);
        return;
    }
    // Преобразование JSON-строки в объект
    const jsonData = JSON.parse(data);
    console.log(jsonData.Database_Settings);
    dom.host.value = jsonData.Database_Settings.host;
    dom.username.value = jsonData.Database_Settings.username;
    dom.password.value = jsonData.Database_Settings.password;
    dom.database.value = jsonData.Database_Settings.database_name;+
    dom.apply.addEventListener("click", (e) =>{
        jsonData.Database_Settings.host = dom.host.value;
        jsonData.Database_Settings.username = dom.username.value;
        jsonData.Database_Settings.password = dom.password.value;
        jsonData.Database_Settings.database_name = dom.database.value;
        const updatedData = JSON.stringify(jsonData, null, 2);
        fs.writeFile("./settings.json", updatedData, 'utf8', (err) =>{
            if (err) {
                console.error('Ошибка записи файла:', err);
                return;
            }    
        })
    })
});
function showTab(tabId) {
    // Скрываем все вкладки
    document.querySelectorAll(".tab-content").forEach(tabContent => {
        tabContent.style.display = 'none';
    });

    // Показываем выбранную вкладку
    var selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }
}

document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", function (event) {
        // Remove the "active" class from all tabs
        document.querySelectorAll(".tab").forEach(tab => {
            tab.classList.remove("active");
        });

        // Add the "active" class to the clicked tab
        this.classList.add("active");

        // Get the tab ID from the data-tab attribute
        var tabId = this.getAttribute("data-tab");
        console.log(tabId);
        // Call the showTab function with the selected tab
        showTab(tabId);
    });
});