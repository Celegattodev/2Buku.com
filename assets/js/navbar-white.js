const mobile_menu = document.querySelector('.mobile_menu')
const mobile_nav_list = document.querySelector('#mobile_nav_list')
const mobile_btn = document.querySelector('#mobile_btn').addEventListener('click',
    ()=>{
        mobile_menu.classList.toggle('active')
        mobile_nav_list.classList.toggle('active')
    }
)
const button_funcionamento = document.querySelector('#button-funcionamento').addEventListener('click',
    ()=>{
        const funcionamento = document.querySelector('#funcionamento')
        funcionamento.classList.toggle('active')
    }
)
const button_c_funcionamento = document.querySelector('#button-collapse-funcionamento').addEventListener('click',
    ()=>{
        const funcionamento = document.querySelector('#funcionamento')
        funcionamento.classList.toggle('active')
    }
)
