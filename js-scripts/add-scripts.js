const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#btn_add1').addEventListener('click', () => {
        const dom = {
            input_strih: document.querySelector('.id_strih_input'),
            name_input: document.querySelector('.name_input'),
            color_input: document.querySelector('.color_input'),
            quality_input: document.querySelector('.quality_input'),
            cena_input: document.querySelector('.cena_input'),
            model_input: document.querySelector('.model_input')
        }



        function addProduct() {
            const product = {
                strih: dom.input_strih.value,
                name: dom.name_input.value,
                color: dom.color_input.value,
                quality: dom.quality_input.value,
                cena: dom.cena_input.value,
                model: dom.model_input.value
            }
            console.log(dom.model_input.value)
            return product;
        }

        if (dom.input_strih.value == '' || dom.name_input.value == '' || dom.color_input.value == '' || dom.quality_input.value == '' || dom.cena_input.value == '' || dom.model_input.value == '') {
            console.log('Пожалуйста, заполните хотя бы одно поле ввода.');
        } else {
            addProduct()
        }
        ipcRenderer.send('addProduct', addProduct())
    });
});