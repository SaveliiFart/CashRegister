const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector('.discount__input');

    function handleButtonClick() {
        if (input) {
            ipcRenderer.send('discount', input.value);
            ipcRenderer.send('request-discount');
            ipcRenderer.send('DiscountClose');
            console.log(input.value);
        } else {
            console.error('Input element with class "input__search" not found.');
        }
    };

    document.getElementById('btn_dis').addEventListener('click', handleButtonClick);
});