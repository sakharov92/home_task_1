@@include('./slick.js');
@@include('./wow.js');

const burgerBtn = document.querySelector(".burger-menu");
const sideMenu = document.querySelector(".sideMenu");
const anchors = document.querySelectorAll('a[href*="#"]');

burgerBtn.addEventListener('click', (e) => {
    toogleMenu();

})

for (let anchor of anchors) {
    anchor.addEventListener('click', function (e) {
        e.preventDefault()
        if (e.target.parentElement.classList.contains("sideMenu__item")) {
            toogleMenu();
        }
        const blockID = anchor.getAttribute('href').substr(1)
        document.getElementById(blockID).scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        })
    })
}

function toogleMenu() {
    if (burgerBtn.classList.contains("burger-menu_active")) {
        burgerBtn.classList.remove("burger-menu_active")
        document.body.style.overflow = "";
    } else {
        burgerBtn.classList.add("burger-menu_active")
        document.body.style.overflow = "hidden";
    }
    // // burgerBtn.classList.contains("burger-menu_active") ? burgerBtn.classList.remove("burger-menu_active") : burgerBtn.classList.add("burger-menu_active");
    sideMenu.classList.contains("sideMenu_active") ? sideMenu.classList.remove("sideMenu_active") : sideMenu.classList.add("sideMenu_active");
}


$(document).ready(function () {

    //first slider
    $('.services-samples').slick({
        autoplay: false,
        arrows: false,
        appendDots: $(".sliderControll"),
        // adaptiveHeight: true,
        dots: true,
        responsive: [
            {
                breakpoint: 999999,
                settings: "unslick"

            },
            {
                breakpoint: 769,
                settings: {
                    unslick: null,
                    infinite: false,
                    slidesToShow: 1.2,
                    slidesToScroll: 1
                }
            }
        ]

    });


    //second slider

    $('.coaches-slider').slick({
        autoplay: false,
        prevArrow: "<div class='coaches-controlPanel__prev  icon-arrow-left-solid'></div>",
        nextArrow: "<div class='coaches-controlPanel__next  icon-arrow-right-solid'></div>",
        appendArrows: $(".coaches-controlPanel"),
        slidesToShow: 2,
        slidesToScroll: 2,
        infinite: false,
        appendDots: $(".coachesSliderControll"),
        // adaptiveHeight: true,
        dots: true,
        responsive: [
            {
                breakpoint: 1025,
                settings: {

                    slidesToShow: 1.2,
                    slidesToScroll: 1,
                    autoplay: false
                }
            }
        ],


    });

    $('.coaches-slider').on('afterChange', function (slick, currentSlide) {
        let currentSlideDOM = document.querySelector("span.coaches-controlPanel__current");
        currentSlideDOM.innerText = (currentSlide.currentSlide + 2) / 2;

        switch (currentSlide.currentSlide) {
            case 0: currentSlide.$prevArrow[0].classList.add(".slick-arrow-disabled");
                break;
            case 6: currentSlide.$nextArrow[0].classList.add(".slick-arrow-disabled");
                break;
            default: currentSlide.$nextArrow[0].classList.remove(".slick-arrow-disabled");
                currentSlide.$prevArrow[0].classList.remove(".slick-arrow-disabled");
        }
    });
});

new WOW().init(
    {
    }
);