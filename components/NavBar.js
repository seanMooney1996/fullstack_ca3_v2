import React from 'react';
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
            textItems:textItems
        }

    }

    componentDidMount() {
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
            this.props.translateAll(textItems).then(r =>
            this.setState({textItems:r}) )
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
                <div className =  "sm_navBarItem">
                    <p>{this.state.textItems.get("gallery")}</p>
                </div>
                <div className =  "sm_navBarItem">
                    <p>{this.state.textItems.get("reviews")}</p>
                </div>
                <div className =  "sm_navBarItem">
                    <p>{this.state.textItems.get("aboutUs")}</p>
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
            <div className ="sm_navLogo">
                <p>LOGO</p>
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

