import React, {useRef} from 'react';

//***** Swiper modules*****/
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation} from 'swiper/modules';

/*** Using swiper css for basic swiper style ****/
// https://codesandbox.io/p/devbox/swiper-react-navigation-2k3jk3?file=%2Fsrc%2FApp.jsx%3A27%2C16
import 'swiper/css';
import 'swiper/css/navigation';


export default class ImageSlider extends React.Component {

    constructor(props) {
        super(props);

        this.swiperRef = React.createRef();
        this.state = {
            spacing: 0,
            slidesPerView: 0,
            slideHeight: 0,
            isSlidesRendered: false
        }

        // using timeout
        this.resizeTimeout = null;
    }


    handleWindowChange = () => {
        window.addEventListener('resize', this.handleResize);
        document.addEventListener('fullscreenchange', this.handleResize);
        document.addEventListener('webkitfullscreenchange', this.handleResize);
        document.addEventListener('mozfullscreenchange', this.handleResize);
        document.addEventListener('MSFullscreenChange', this.handleResize);
    }

    componentDidMount = () => {
        this.setSlideParams();
        this.handleWindowChange()
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.isSlidesRendered && this.state.isSlidesRendered) {
            this.setSlideHeights();
            if (this.swiperRef.current !== null) {
                this.swiperRef.current.swiper.slideTo(2, 0, false);
            }
        }
    }


    handleResize = () => {
        window.location.reload()
        this.setSlideParams()
    }


    setSlideHeights = () => {
        let slides = document.getElementsByClassName("sm_swiperSlide");
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.height = (slides[i].getBoundingClientRect().width) + "px";
        }
    }

    setSlideParams = () => {
        let parentWidth = document.getElementById("sm_imageSliderHolder").getBoundingClientRect().width;
        let slidesPerView = 0;
        let spacing;
        if (parentWidth < 500) {
            slidesPerView = 1;
            spacing = ((5 / 100) * parentWidth);
        } else if (parentWidth < 800) {
            slidesPerView = 3;
            spacing = ((1.7 / 100) * parentWidth);
        } else if (parentWidth < 1200) {
            slidesPerView = 4;
            spacing = ((0.85 / 100) * parentWidth);
        } else {
            slidesPerView = 4;
            spacing = ((1.2 / 100) * parentWidth);
        }
        this.setState({slidesPerView: slidesPerView, spacing: spacing}, () => {
            this.setState({isSlidesRendered: true})
        })
        this.setSlideHeights()
    }

    render() {
        return (
            <div id="sm_imageSliderHolder">
                <Swiper ref={this.swiperRef}
                        navigation={true} slidesPerView={this.state.slidesPerView} spaceBetween={this.state.spacing}
                        centeredSlides={true}
                        modules={[Navigation]} className="sm_Swiper"
                        onSlideChangeTransitionEnd={() => this.setState({isSlidesRendered: true})}>
                    <SwiperSlide className="sm_swiperSlide">Slide 1</SwiperSlide>
                    <SwiperSlide className="sm_swiperSlide">Slide 2</SwiperSlide>
                    <SwiperSlide className="sm_swiperSlide">Slide 3</SwiperSlide>
                    <SwiperSlide className="sm_swiperSlide">Slide 4</SwiperSlide>
                    <SwiperSlide className="sm_swiperSlide">Slide 5</SwiperSlide>
                    <SwiperSlide className="sm_swiperSlide">Slide 6</SwiperSlide>
                    <SwiperSlide className="sm_swiperSlide">Slide 7</SwiperSlide>
                </Swiper>
            </div>
        )
    }
}

