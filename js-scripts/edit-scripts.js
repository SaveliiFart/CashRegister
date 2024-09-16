const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#btn_add1').addEventListener('click', () => {
        const dom = {
            input_strih: document.querySelector('.id_strih_input'),
            quality_input: document.querySelector('.quality_input'),
        }



        function EditProduct() {
            const product = {
                strih: dom.input_strih.value,
                quality: dom.quality_input.value,
            }
            return product;
        }

        if (dom.input_strih.value == ''  || dom.quality_input.value == '') {
            console.log('Пожалуйста, заполните хотя бы одно поле ввода.');
        } else {
            EditProduct()
            dom.input_strih.value == '' 
            dom.quality_input.value == ''
        }
        ipcRenderer.send('EditProduct', EditProduct())
    });
});