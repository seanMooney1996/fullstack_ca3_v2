import React from 'react';
import logo from "../images/Paris2024_OlyEmbleme_RVB_Poly_2021.png"
import logo2 from "../images/2024_Summer_Olympics_text_logo.png"
export default class NavBar extends React.Component {
    constructor(props) {
        super(props)

        const textItems = new Map([
            ["home", "Home"],
            ["map", "Map"],
            ["gallery", "Gallery"],
            ["reviews", "Reviews"],
            ["aboutUs", "About Us"],
            ["lang", "Lang"],
            ["nav", "Nav"],
            ["english", "English"],
            ["french", "French"],
            ["german", "German"],
            ["olympicsWithLogo", "Olympics with logo"]
        ])

        this.state = {
            menuOpen:false,
            menuItem:"Nav",
            textItems:textItems,
            currentTemp: "",
            conditions: ""
        }

    }

    componentDidMount() {

        let currentTemp;
        let conditions;
        let url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/paris?unitGroup=metric&key=H5VAUUMZTHJ6T54PGKRHBA6CV&contentType=json`;


            const textItems = new Map([
                ["home", "Home"],
                ["map", "Map"],
                ["gallery", "Gallery"],
                ["reviews", "Reviews"],
                ["aboutUs", "About Us"],
                ["lang", "Language"],
                ["nav", "Navigation"],
                ["english", "English"],
                ["french", "French"],
                ["german", "German"],
                ["spanish", "Spanish"],
                ["chinese", "Chinese"],
                ["title", "Olympics with logo"]
            ])
        this.props.translateAll(textItems)
            .then(r => {
                this.setState({ textItems: r });
                fetch(url)
                    .then(response => {
                        return response.json();
                    })
                    .then(data => {
                        console.log(data)
                        currentTemp = data.currentConditions.temp;
                        conditions = data.currentConditions.conditions
                        console.log(currentTemp)
                        console.log(conditions)
                        this.setState({currentTemp:currentTemp, conditions:conditions})
                    })
            })
    }

    clickOpenMenu = (menuType)=> {
        if (this.state.menuItem !== menuType){
            this.setState({menuOpen:true,menuItem:menuType})
        } else {
            this.setState({menuOpen:!this.state.menuOpen})
        }
    }

    changeComponent = (componentName) => {
        this.props.changeComponentToRender(componentName)
        this.setState({menuOpen:false})
    }

    render() {
        let sm_toggledNavItems;
       if (this.state.menuOpen){
           sm_toggledNavItems = "sm_toggledNavItems"
       } else {
           sm_toggledNavItems = "sm_toggledNavItemsHidden"
       }

        const menuItemsNav = (
            <>
                <div className = "sm_navBarItem" onClick={() => this.changeComponent("Home")}>
                    <p>{this.state.textItems.get("home")}</p>
                </div>
                <div className = "sm_navBarItem" onClick={() => this.changeComponent("Gmap")}>
                    <p>{this.state.textItems.get("map")}</p>
                </div>
            </>
        )

        let menuItemsLang = (
            <>
                <div className = "sm_navBarItem" onClick={() => this.props.changeLanguage("en")}>
                    <p>{this.state.textItems.get("english")}</p>
                </div>
                <div className = "sm_navBarItem" onClick={() => this.props.changeLanguage("fr")}>
                    <p>{this.state.textItems.get("french")}</p>
                </div>
                <div className =  "sm_navBarItem"   onClick={() => this.props.changeLanguage("de")}>
                    <p>{this.state.textItems.get("german")}</p>
                </div>
                <div className =  "sm_navBarItem"  onClick={() => this.props.changeLanguage("zh-CN")}>
                    <p>{this.state.textItems.get("chinese")}</p>
                </div>
                <div className =  "sm_navBarItem"  onClick={() => this.props.changeLanguage("es")}>
                    <p>{this.state.textItems.get("spanish")}</p>
                </div>
            </>
        )



        return (
            <div className="sm_navHolder">

                <div className ="sm_tempHold">
                    <p className="sm_displayIfLarge">Current Conditions Paris</p>
                    <p>{this.state.currentTemp}&deg;C</p>
                    <p>{this.state.conditions}</p>
                </div>
            <div className ="sm_navLogo">
                <img src={logo2} className="sm_logo" alt="" height="80%"/>
            </div>
                <div className="sm_navMenuButton">
                    <div  onClick={() => this.clickOpenMenu("Lang")} ><p>{this.state.textItems.get("lang")}</p></div>
                    <div onClick={() => this.clickOpenMenu("Nav")}><p>{this.state.textItems.get("nav")}</p></div>
                </div>
                <div className={sm_toggledNavItems} ref={node => this.componentRef = node}>
                    {this.state.menuItem === "Nav" ? menuItemsNav : null}
                    {this.state.menuItem === "Lang" ?  menuItemsLang : null}
                </div>
            </div>
        )
    }
}

