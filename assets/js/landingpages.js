document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const navbarLogo = document.getElementById('navbar_logo');
    const navButtons = document.querySelectorAll('.nav-button');
    const mobileMenu = document.querySelector('.mobile_menu');
    const mobileNavList = document.querySelector('#mobile_nav_list');
    const mobileBtn = document.querySelector('#mobile_btn');
    const mainSection = document.querySelector('.main');
    const benefitsSection = document.querySelector('.benefits');
    const funcionamentoSection = document.querySelector('#funcionamento');
    const footer = document.querySelector('footer');

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            navbarLogo.style.transform = 'scale(0.8)';
        } else {
            navbar.classList.remove('scrolled');
            navbarLogo.style.transform = 'scale(1)';
        }
    });

    // Mobile menu toggle
    mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        mobileNavList.classList.toggle('active');
    });

    // Smooth scroll to sections
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = button.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Animate elements on scroll
    const animateOnScroll = (element, animation) => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(animation);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(element);
    };

    // Apply animations
    const elementsToAnimate = [
        { element: mainSection, animation: 'fadeIn' },
        { element: benefitsSection, animation: 'fadeIn' },
        { element: funcionamentoSection, animation: 'fadeIn' },
        { element: footer, animation: 'fadeIn' },
        ...document.querySelectorAll('.text h1'),
        ...document.querySelectorAll('.text p'),
        ...document.querySelectorAll('.orange-button'),
        ...document.querySelectorAll('.img'),
        ...document.querySelectorAll('.benefit'),
        ...document.querySelectorAll('#funcionamento h3'),
        ...document.querySelectorAll('.item')
    ];

    elementsToAnimate.forEach(item => {
        if (item.element) {
            animateOnScroll(item.element, item.animation);
        } else {
            animateOnScroll(item, 'fadeIn');
        }
    });
});