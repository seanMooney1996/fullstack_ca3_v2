import React from 'react';
import video from '../videos/olympicsVideo.mp4';
import ImageSlider from "./ImageSlider";
export default class VideoHolder extends React.Component {


    constructor(props) {
        super(props)

        const textItems = new Map([
            ["h1", "SUMMER OLYMPICS 2024"],
            ["p", "For everything olympics"]
        ])

        this.state = {
            textItems:textItems
        }

    }
    componentDidMount() {
        const textItems = this.state.textItems

        this.props.translateAll(textItems).then(translatedTextItems => {
            this.setState({ textItems: translatedTextItems });
        });
    }
    render() {
        return (
            <div className="sm_videoHolderContainer">
                <video className="sm_videoPlayer" autoPlay muted loop>
                    <source src={video} type="video/mp4" />
                </video>

                <div className= "sm_textContent">
                    <h1>{this.state.textItems.get("h1")}</h1>
                    <p>{this.state.textItems.get("p")}</p>
                </div>

                <div className="sm_holdImageSlider"><ImageSlider></ImageSlider></div>
            </div>
        )
    }
}

