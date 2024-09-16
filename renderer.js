const { ipcRenderer } = require("electron");
let purchaseData = [];
let cashType;

let recept_list = {
  list: [],
  total: 0,
  discount: 0,
};

// Работает
document.addEventListener("DOMContentLoaded", () => {
  const inputSearch = document.querySelector(".input__search_shtrih");
  const listThingContainer = document.querySelector(".list_thing_container");

  document.getElementById("btn__search").addEventListener("click", handleButtonClick);

  function handleButtonClick() {
    if (inputSearch) {
      let searchArray = inputSearch.value.split(" ");
      console.log(searchArray);
      ipcRenderer.send("searchInfo", searchArray);
    } else {
      console.error('Input element with class "input__search" not found.');
    }
    ipcRenderer.removeAllListeners("searchOutput");
    ipcRenderer.on("searchOutput", (event, results) => {
      renderListSearch(results);
    });
  }

  document.getElementById("btn__posluga").addEventListener("click", () => {
    ipcRenderer.send("OpenPosluga");
  });

  document.getElementById("btn__finish").addEventListener("click", () => {
    ipcRenderer.send("OpenPrice");
    ipcRenderer.send("DataSend", purchaseData);
  });

  document.getElementById("btn_percent").addEventListener("click", () => {
    ipcRenderer.send("OpenDiscount");
  });

  document.getElementById("btn_client").addEventListener("click", () => {
    ipcRenderer.send("OpenClient");
  });

  function renderListSearch(results) {
    const listSearchBox = document.createElement("div");
    listSearchBox.className = "list_thing";
    let listSearchHTML = []; 

    for (let i = 0; i < results.length; i++) {
      const content = [
        "ID: " +
          results[i].IDSTRIH +
          "<br>Ім`я: " +
          results[i].NAME +
          "<br>Кількість: " +
          results[i].QUALITY +
          "<br>Ціна: " +
          results[i].CENA +
          "<br>Модель/Бренд: " +
          results[i].MODEL,
      ];
      const listSearchString = buildListSearch(content);
      listSearchHTML.push(listSearchString);
    }

    if (inputSearch.value == "") {
      console.error("Помилка");
    } else {
      listSearchBox.innerHTML = listSearchHTML.join("");
      listThingContainer.appendChild(listSearchBox);
    }
  }

  function buildListSearch(content) {
    return `
        <div class="list_search">
            <div class="inner__search_list">${content}</div>
            <button class="btn__delete">&#128473</button>
        </div>
    `;
  }
});

// Работает
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("btn__delete")) {
    let parentDiv = event.target.closest(".list_search");

    if (parentDiv) {
      parentDiv.parentElement.removeChild(parentDiv);
    } else {
      console.error('Parent element with class "list_search" not found.');
    }
  }
});

let DISCOUNT;
let DataSet;

ipcRenderer.on("response-discount", (event, discount) => {
  console.log("Received total price from main process:", discount);
  return (DISCOUNT = discount);
});


document.addEventListener("click", (event) => {
  if (event.target.classList.contains("btn_percent")) {
    let parentDiv = event.target.closest(".list_search");

    if (parentDiv) {
    } else {
      console.error('Parent element with class "list_search" not found.');
    }
  }
});

//Работает
document.addEventListener("DOMContentLoaded", () => {
  const listBoxContainer = document.querySelector(".list__box__conteiner");
  const listPriceDiv = document.querySelector(".list_price");
  let totalSum = 0; 
  let totalSumWithDiscount;

  document.getElementById("btn_add1").addEventListener("click", handleButtonClick);

ipcRenderer.on("response-posluga", (event, data) => {
    DataSet = data;
    console.log(DataSet[0].Price[0]);
    const listBox = document.createElement("div");
    listBox.classList = "list__box";
    listBox.dataset.id = DataSet[0].Price[0].IDSTRIH;
    console.log(1, listBox);
    currentProperties = DataSet[0].Price[0].NAME
    currentTotalPriceThing = DataSet[0].Price[0].CENA * DataSet[0].Price[0].QUALITY;
    const listString = buildList(currentProperties,DataSet[0].Price[0].QUALITY,DataSet[0].Price[0].CENA, currentTotalPriceThing);
    recept_list.list[DataSet[0].Price[0].IDSTRIH] = [currentProperties,DataSet[0].Price[0].QUALITY,DataSet[0].Price[0].CENA,currentTotalPriceThing];
    recept_list.total = DataSet[0].Price[0].CENA * DataSet[0].Price[0].QUALITY;
    totalSum += DataSet[0].Price[0].CENA * DataSet[0].Price[0].QUALITY;
    updateTotalSum();
    let listHTML = [];
    listHTML.push(listString);
    listBox.innerHTML = listHTML.join("");
    listBoxContainer.appendChild(listBox);
});

  const inputAdd = document.querySelector(".input_add");
  const inputQuality = document.querySelector(".input__add_quality");

  inputAdd.addEventListener("input", function (e) {
    this.value = this.value.replace(/[^\d.]/g, ""); // Фильтруем только цифры
  });

  inputQuality.addEventListener("input", function (e) {
    this.value = this.value.replace(/[^\d.]/g, ""); // Фильтруем только цифры
  });

  function handleButtonClick() {
    function renderList() {
      const listBox = document.createElement("div");
      listBox.classList = "list__box";
      listBox.dataset.id = currentId;
      console.log(1, listBox);
      const listString = buildList(currentProperties,inputQuality.value,currentPrice,currentTotalPriceThing);
      let listHTML = [];

      listHTML.push(listString);

      listBox.innerHTML = listHTML.join("");
      listBoxContainer.appendChild(listBox);

      if (DISCOUNT == null) {
        totalSum += currentPrice * inputQuality.value;
        listPriceDiv.textContent = `Разом: ${totalSum}`;
        recept_list.list[currentId] = [currentProperties,inputQuality.value,currentPrice,currentTotalPriceThing,];
        recept_list.total = totalSum;
        recept_list.discount = DISCOUNT;
        updateTotalSum();
      } else {
        totalSum += currentPrice * inputQuality.value;
        totalSumWithDiscount = totalSum - (totalSum * DISCOUNT) / 100;
        listPriceDiv.textContent = `Разом: ${totalSumWithDiscount}`;
        ipcRenderer.send("TotalPriceVal", totalSumWithDiscount);
        recept_list.list[currentId] = [currentProperties,inputQuality.value,currentPrice,currentTotalPriceThing,];
        recept_list.total = totalSumWithDiscount;
        recept_list.discount = DISCOUNT;
      }

      console.log(recept_list);
      console.log(DISCOUNT);
      console.log(totalSumWithDiscount);
      console.log("Total Sum:", totalSum);
    }

    ipcRenderer.once("cash", (event, data) => {
      console.log("Sended:", data);
      return (cashType = data);
    });

    ipcRenderer.on("DataReturn", (event, data) => {
      console.log("Sended.");
    });

    ipcRenderer.send("GetPrice", inputAdd.value);
    ipcRenderer.once("PriceReturn", (event, Price) => {
      Price[0].type = cashType;
      Price[0].quatity = inputQuality.value;
      currentId = Price[0].IDSTRIH;
      currentPrice = Price[0].CENA;
      currentTotalPriceThing = currentPrice * inputQuality.value;
      currentProperties =Price[0].NAME +" " +Price[0].MODEL +" " +Price[0].COLOR ;

      // Check if the item with the same inputAdd.value() is already present
      const existingItem = purchaseData.find(
        (item) => item.Price[0].IDSTRIH === currentId
      );

      if (Price[0].QUALITY < 0) {
        alert("Помилка, немає товару на складі");
        return;
      }

      if (existingItem) {
        // If the item exists, update the quantity
        existingItem.Price[0].quatity = parseFloat(existingItem.Price[0].quatity) + parseFloat(inputQuality.value);
        if (recept_list.id === currentId || DISCOUNT == null) {
          recept_list.list[currentId][1] = existingItem.Price[0].quatity;
          recept_list.total = existingItem.Price[0].quatity * recept_list.total;
          recept_list.list[currentId][4] =
            existingItem.Price[0].quatity * currentPrice;
        } else {
          recept_list.list[currentId][1] = existingItem.Price[0].quatity;
          recept_list.total = existingItem.Price[0].quatity * recept_list.total;
          recept_list.list[currentId][4] =
            existingItem.Price[0].quatity * currentPrice;
        }
        currentTotalPriceThing = currentPrice * existingItem.Price[0].quatity;
        updateExistingItem(existingItem);
      } else {
        purchaseData.push({ Price });
        renderList();
      }
    });

    ipcRenderer.once("receipt", (event) => {
      console.log("FINISH RECEIPT");
      ipcRenderer.send("receipt_return", recept_list);
    });
  }

  function updateExistingItem(existingItem) {
    // Find the existing item in the DOM
    const existingListBox = document.querySelector(
      `.list__box[data-id="${existingItem.Price[0].IDSTRIH}"]`
    );

    if (existingListBox) {
      // Update the quantity in the DOM
      const existingTotalPriceThingElement = existingListBox.querySelector(
        ".price_multiplication_quality"
      );
      const existingQualityElement =
        existingListBox.querySelector(".price_and_quality");
      existingTotalPriceThingElement.textContent = `= ${currentTotalPriceThing}`;
      existingQualityElement.textContent = `${currentPrice} x ${existingItem.Price[0].quatity}`;
      // Update total sum
      totalSum += currentPrice * parseFloat(inputQuality.value);
      totalSumWithDiscount = totalSum - (totalSum * DISCOUNT) / 100;
      console.log(totalSumWithDiscount);
      updateTotalSum();
    }
  }

  document.getElementById("btn__clear").addEventListener("click", () => {
    listBoxContainer.innerHTML = "";
    totalSum = 0;
    totalSumWithDiscount = 0;
    recept_list.list = [];
    recept_list.total = 0;
    purchaseData = [];
    console.log(recept_list);
    updateTotalSum();
  });

  function addClassAndRemove(event) {
    const selectedDiv = event.target;

    if (selectedDiv.classList.contains("list")) {
      selectedDiv.classList.toggle("selected");
      updateTotalSum();
    }
  }

  listBoxContainer.addEventListener("click", addClassAndRemove);

  document.getElementById("btn__del").addEventListener("click", () => {
    const selectedDivs = Array.from(document.querySelectorAll(".selected"));
    selectedDivs.forEach((div) => {
      const parentDiv = div.closest(".list__box");
      if (parentDiv) {
        const idStrihToRemove = Number(parentDiv.dataset.id);
        recept_list.total -= recept_list.list[idStrihToRemove][3];
        delete recept_list.list[idStrihToRemove];
        console.log(recept_list);
        console.log(idStrihToRemove);
        const priceElement = div.querySelector(".price_multiplication_quality");
        const price = parseFloat(priceElement.textContent.split("=")[1].trim());
        totalSum -= price;
        totalSumWithDiscount -= price - (price * DISCOUNT) / 100;
        listBoxContainer.removeChild(parentDiv);
        purchaseData = purchaseData.filter(
          (item) => item.Price[0].IDSTRIH !== idStrihToRemove
        );
      }
    });
    updateTotalSum();
  });

  function updateTotalSum() {
    if (DISCOUNT === null || DISCOUNT === undefined) {
      listPriceDiv.textContent = `Разом: ${totalSum}`;
      ipcRenderer.send("TotalPriceVal", totalSum);
    } else {
      listPriceDiv.textContent = `Разом: ${Math.round(totalSumWithDiscount)}`;
      ipcRenderer.send("TotalPriceVal", totalSumWithDiscount);
      console.log(totalSumWithDiscount);
    }
  }
});
function buildList(content, quality, Price, currentTotalPriceThing) {
    return `
              <div id="list_1" class="list">
                  <div class="inner_list">${content}</div> 
                  <div class="price_multiplication_quality">= ${currentTotalPriceThing}</div> 
                  <div class="price_and_quality">${Price} x ${quality}</div>
                  <hr>
              </div>
          `;
  }
