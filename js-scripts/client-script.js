const { ipcRenderer } = require("electron");

dom = {
    add_name: document.getElementById("add_name"),
    add_surname: document.getElementById("add_surname"),
    add_phone: document.getElementById("add_phone"),
    del_phone: document.getElementById("del_phone"),
    edit_name: document.getElementById("edit_name"),
    edit_surname: document.getElementById("edit_surname"),
    edit_phone: document.getElementById("edit_phone"),
    search_phone: document.getElementById("search_phone"),
    btn_add: document.getElementById("Add"),
    btn_del: document.getElementById("Delete"),
    btn_edit: document.getElementById("Edit"),
    btn_search: document.getElementById("Search"),
}

function addClient() {
    let client = {
        name: dom.add_name.value,
        surname: dom.add_surname.value,
        phone: dom.add_phone.value
    }
    return client;
}

function deleteClient() {
    let client = {
        phone: dom.del_phone.value
    }
    return client;
}

function editClient() {
    let client = {
        name: dom.edit_name.value,
        surname: dom.edit_surname.value,
        phone: dom.edit_phone.value
    }
    return client;
}

function searchClient() {
    let client = {
        phone: dom.search_phone.value
    }
    return client;
}

function buildListSearch(content){
    console.log(content)
    return `
    <div class="search_item">
        <span class="search_title">${content[0].name}</span>
    </div>
    <div class="search_item">
        <span class="search_title">${content[0].surname}</span>
    </div>
    <div class="search_item">
        <span class="search_title">${content[0].phone}</span>
    </div>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
dom.btn_del.addEventListener("click", function () {
    if (dom.del_phone.value == '') {
        console.log('Пожалуйста, введите номер телефона.');
    } else {
        ipcRenderer.send('deleteClient', deleteClient())
    }

    dom.del_phone.value = '';
    window.close();
});

dom.btn_add.addEventListener("click", function () {
    if (dom.add_name.value == '' || dom.add_surname.value == '' || dom.add_phone.value == '') {
        console.log('Пожалуйста, заполните все поля ввода.');
    } else {
        ipcRenderer.send('addClient', addClient())
    }
    dom.add_name.value = '';
    dom.add_surname.value = '';
    dom.add_phone.value = '';
    window.close();
});

dom.btn_edit.addEventListener("click", function () {
    if (dom.edit_name.value == '' || dom.edit_surname.value == '' || dom.edit_phone.value == '') {
        console.log('Пожалуйста, заполните все поля ввода.');
    } else {
        ipcRenderer.send('editClient', editClient())
    }
    dom.edit_name.value = '';
    dom.edit_surname.value = '';
    dom.edit_phone.value = '';
    window.close();
});

dom.btn_search.addEventListener("click", function () {
    if (dom.search_phone.value == '') {
        console.log('Пожалуйста, введите номер телефона.');
    } else {
        ipcRenderer.send('searchClient', searchClient());
        ipcRenderer.on('getClient', (event, result) => {
            let searchThingContainer = document.querySelector(".search_thingContainer");
            
            searchThingContainer.innerHTML = '';

            if (result && result.length > 0) {
                const searchResult = document.createElement("div");
                searchResult.className = "search_result";
                searchResult.innerHTML = buildListSearch(result);
                searchThingContainer.appendChild(searchResult);
            } else {
                const noResult = document.createElement("div");
                noResult.className = "no_result";
                noResult.textContent = "Клиент не найден.";
                searchThingContainer.appendChild(noResult);
            }
        });

        dom.search_phone.value = '';
    }
});
});

function showTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(tabContent => {
        tabContent.style.display = 'none';
    });

    var selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }
}

document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", function (event) {
        document.querySelectorAll(".tab").forEach(tab => {
            tab.classList.remove("active");
        });

        this.classList.add("active");


        var tabId = this.getAttribute("data-tab");
        console.log(tabId);
        showTab(tabId);
    });
});