import React from "react";
import customLocations from '../json/customLocations.json';

export default class GMap extends React.Component {
    constructor(props) {

        super(props);

        this.infoWindow = null;

        this.state = {
            mapMenuItem: "",
            menuItemOpen: false,
            menuHeight: "0",
            searchValue: "",
            currentMapMarkers: []
        }
    }

    componentDidMount() {
        this.loadMap();
        let menuItemHeight = document.getElementById("sm_navigation").getBoundingClientRect().height
        document.getElementById("sm_googleMap").style.top = menuItemHeight.toString()

    }

    loadMap = () => {
        let parisCenterLongLat = {lat: 48.868476, lng: 2.299877};

        this.map = new window.google.maps.Map(document.getElementById("sm_googleMap"), {
            mapId: "MY_MAP_ID",
            zoom: 13,
            center: parisCenterLongLat,
            mapTypeId: window.google.maps.MapTypeId.ROADMAP,
            mapTypeControlOptions: {
                mapTypeIds: ["roadmap", "hide_poi"]
            }
        });


        this.hidePointsOfInterest();
        // this.loadCustomLocations()
        //
        // service.nearbySearch({
        //     location: parisCenterLongLat,
        //     radius: 500,
        //     type: "cafe"
        // }, this.getNearbyServicesMarkers);
    }

    // getNearbyServicesMarkers = (results, status) => {
    //     if (status === window.google.maps.places.PlacesServiceStatus.OK) {
    //         results.forEach(result => {
    //             this.createMarker(result);
    //         });
    //     }
    // };


    // https://developers.google.com/maps/documentation/javascript/places <--- used documentation for some code
    findPlacesInParis = (keyword) => {
        let map = this.map
        let parisCenterLongLat = {lat: 48.8566, lng: 2.3522};
        var request = {
            location: parisCenterLongLat,
            radius: '10000',
            fields: ['name', 'geometry',"icon"],
            // type: ['lodging'],
            keyword: keyword
        }

        const service = new window.google.maps.places.PlacesService(this.map);
        service.nearbySearch(request, callback);

        let createMarker = this.createMarker
        this.removeMarkers()
        function callback(results, status) {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    console.log(results[i])
                    createMarker(results[i])
                }
            }
            map.setCenter(results[0].geometry.location);
            map.setZoom(15);
        }
    }

    createMarker = (place) => {
        const icon = {
            url: place.icon,
            scaledSize: new window.google.maps.Size(20, 20)
        };
        console.log(place.icon)
        const marker = new window.google.maps.Marker({
            map: this.map,
            position: place.geometry.location,
            icon: icon
        });

        if (!this.infoWindow) {
            this.infoWindow = new window.google.maps.InfoWindow();
        }

        window.google.maps.event.addListener(marker, "click", () => {
            this.infoWindow.setContent(place.name);
            this.infoWindow.open(this.map, marker);
        })

        let mapMarkers = this.state.currentMapMarkers;
        mapMarkers.push(marker)
        this.setState({currentMapMarkers:mapMarkers})
    }

    removeMarkers = (place) => {
        let mapMarkers = this.state.currentMapMarkers;
        for (let i = 0; i < mapMarkers.length; i++) {
            mapMarkers[i].setMap(null);
        }
        let emptyMapMarkers = []
        this.setState({currentMapMarkers:emptyMapMarkers})
    }

    hidePointsOfInterest = () => {
        const styles = [
            {
                featureType: "poi",
                stylers: [{visibility: "off"}]
            }
        ];

        const styledMapType = new window.google.maps.StyledMapType(styles, {name: "POI Hidden"});
        this.map.mapTypes.set("hide_poi", styledMapType);
        this.map.setMapTypeId("hide_poi");
    };

    loadCustomLocations = () => {
        let customLocationArray = customLocations.locations
        customLocationArray.forEach(location => {
            this.createMarker(location)
        })
    }
    openMenuItem = (menuItem) => {
        if (this.state.menuItemOpen) {
            if (this.state.mapMenuItem === menuItem) {
                this.menuAnimation(true)
                this.setState({menuItemOpen: false})
            } else {
                this.menuAnimation(true)
                setTimeout(() => {
                    this.setState({mapMenuItem: menuItem}, () => {
                        this.menuAnimation(false);
                    })
                }, 500)
            }
        } else {
            this.menuAnimation(false)
            this.setState({menuItemOpen: true, mapMenuItem: menuItem})
        }
    }

    menuAnimation = (close) => {
        const mapMenu = document.getElementById("sm_mapMenu");
        if (close) {
            mapMenu.classList.remove("sm_slideInAnimation", "sm_displayNone");
            mapMenu.classList.add("sm_slideOutAnimation",);
        } else {
            mapMenu.classList.remove("sm_slideOutAnimation", "sm_displayNone");
            mapMenu.classList.add("sm_slideInAnimation");
        }
    }

    setSearchValue = (e) => {
        let newSearchValue = e.target.value
        console.log(newSearchValue)
        this.setState({searchValue: newSearchValue})
    }

    render() {
        let planRouteElement = (
            <div className="sm_menuItemsContainer">
                <input></input>
                <p>Plan route </p>
                <p>some text </p>
                <p>some text </p>
                <p>some text </p>
            </div>
        )

        let nearYou = (
            <div className="sm_menuItemsContainer" onClick={() => this.openMenuItem("search")}>
                <div className="sm_menuItem">
                    <div><p>Staying at: </p></div>
                    <div></div>
                    <div><p>Choose</p></div>
                </div>
                <div className="sm_menuItem"><input></input></div>
            </div>
        )
        let searchElement = (
            <div className="sm_menuItemsContainer">
                <div className="sm_menuItem">
                    <input className="sm_searchBar" placeholder="Search for anything"
                           onChange={(e) => this.setSearchValue(e)}>
                    </input>
                    <div className="sm_menuItemInner sm_buttonGrey">
                        Filters
                    </div>
                    <div className="sm_buttonGreen sm_menuItemInner"
                         onClick={() => this.findPlacesInParis(this.state.searchValue)}>GO
                    </div>
                </div>
            </div>

        )

        let elementToRender;
        switch (this.state.mapMenuItem) {
            case "nearYou":
                elementToRender = nearYou;
                break;
            case "planRoute":
                elementToRender = planRouteElement;
                break;
            case "search":
                elementToRender = searchElement;
                break;
            default:
                elementToRender = nearYou;
        }


        let menuToRender = (
            <div id="sm_mapMenu" className="sm_displayNone">
                {elementToRender}
            </div>
        )


        return (
            <div className="sm_mapHoldFull">
                <div id="sm_navigation">
                    <div className="sm_mapNavOptions">
                        <div className="sm_navOptButton" onClick={() => this.openMenuItem("search")}>Search</div>
                        <div className="sm_navOptButton" onClick={() => this.openMenuItem("planRoute")}>Plan Route
                        </div>
                        <div className="sm_navOptButton" onClick={() => this.openMenuItem("nearYou")}>Near You</div>
                    </div>
                </div>
                {menuToRender}
                <div id="sm_googleMap" style={{height: this.state.mapHeight}}></div>
            </div>
        );
    }
}

