import React from 'react';
import NavBar from "./NavBar";
import VideoHolder from "./VideoHolder";
import GMap from "./GMap";
import Translator from "./Translator";


"use strict"
class App extends React.Component {

    constructor(props) {
        super(props);

    // checking for storage existence and then if setting defaults
        if (!sessionStorage.getItem('component')) {
            sessionStorage.setItem('component', 'Home');
        }

        if (!sessionStorage.getItem('language')) {
            sessionStorage.setItem('language', 'en');
        }
         this.state = {
             language: sessionStorage.getItem('language'),
             componentToLoad: sessionStorage.getItem('component'),
         }
    }

    changeLanguage = (lang) => {
        sessionStorage.setItem('language', lang);
        this.setState({language:lang})
        window.location.reload()
    }

     applyTranslations = (text) => {
        const translator = new Translator();
        return translator.translateText(text, this.state.language)
            .then(translations => {
                return translations
            })
            .catch(error => {
                return text
            })
    }

    translateAll = async (textItems) => {
        const translationPromises = [];
        for (const [key, value] of textItems) {
            const translationPromise = this.applyTranslations(value)
                .then(translatedText => {
                    textItems.set(key, translatedText);
                })
            translationPromises.push(translationPromise);
        }
        await Promise.all(translationPromises);
        return textItems;
    }

    changeComponentToRender = (componentName) =>{
        sessionStorage.setItem('component', componentName);
        this.setState({componentToLoad:componentName})
    }

    render() {


        return (
            <div className="sm_pageContain">
                <NavBar  changeComponentToRender={this.changeComponentToRender}  changeLanguage={this.changeLanguage}  translateAll={this.translateAll} language={this.state.language}></NavBar>
            <div className="sm_app">

                {this.state.componentToLoad === "Home" ?<VideoHolder   changeComponentToRender={this.changeComponentToRender} translateAll={this.translateAll} language={this.state.language} ></VideoHolder>: null}
                {this.state.componentToLoad === "Gmap" ?<GMap  changeComponentToRender={this.changeComponentToRender}  translateAll={this.translateAll} language={this.state.language} ></GMap>: null}

            </div>
            </div>
        )
    }
}

export default App