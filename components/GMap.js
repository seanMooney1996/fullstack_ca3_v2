import React from "react";
import customLocations from '../json/customLocations.json';
import ReactDOMServer from 'react-dom/server';

export default class GMap extends React.Component {
    constructor(props) {

        super(props);

        this.infoWindow = null;
        this.directionsRenderer = null

        let filterTypes = {
            "zoo": false,
            "night_club": false,
            "movie_theater": false,
            "cafe": false,
            "restaurant": false,
            "meal_takeaway": false,
            "liquor_store": false,
            "clothing_store": false,
            "shopping_mall": false,
            "shoe_store": false,
            "airport": false,
            "train_station": false,
            "subway_station": false,
            "pharmacy": false,
            "parking": false,
            "tourist_attraction": false,
            "museum": false
        };


        this.state = {
            mapMenuItem: "",
            menuItemOpen: false,
            searchValue: "",
            currentMapMarkers: [],
            filterOptionsOpen: false,
            typesForFilter: [],
            filterCategory: "",
            filterCategoryOpen: false,
            filterTypes: filterTypes,
            infoWindowOpen: false,
            currentlyViewedItemIndex: null,
            routeArray: [],
            stayingAt: "",
            transportMode: "walking",
            directionsOpen: false
        }

    }

    componentDidMount() {
        this.loadMap();
    }


    popUpMessage = (placeName, stayingAtOrRoute) => {
        let message;

        if (stayingAtOrRoute === "stayingAt") {
            message = "Changed your lodging location to <b>" + placeName + "</b>!";
        } else {
            message = " <b>" + placeName + "</b> added to route list!";
        }

        let popup = document.getElementById("sm_popUpMessage")
        popup.innerHTML = message;
        this.popUpAnimation();
    }

    popUpAnimation = () => {
        const mapMenu = document.getElementById("sm_popUpMessage");
        mapMenu.classList.remove("sm_popUpAnimationOut", "sm_displayNone");
        mapMenu.classList.add("sm_popUpAnimationIn");
        setTimeout(function () {
            mapMenu.classList.remove("sm_popUpAnimationIn");
            mapMenu.classList.add("sm_popUpAnimationOut");
        }, 5000);

    }
    changeStayingAt = () => {
        let currentMarkerName = this.state.currentMapMarkers[this.state.currentlyViewedItemIndex].name
        console.log(currentMarkerName + " name of marker")

        this.popUpMessage(currentMarkerName, "stayingAt");

        this.setState({stayingAt: currentMarkerName})
    }
    addPlaceToRoute = () => {
        let currentMarkerName = this.state.currentMapMarkers[this.state.currentlyViewedItemIndex].name
        let placesInRoute = this.state.routeArray
        this.popUpMessage(currentMarkerName, "addToRoute");
        placesInRoute.push(currentMarkerName)
        this.setState({routeArray: placesInRoute})
    }

    // used chatgpt to get code for loading script in a function!!!
    loadMap = () => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD106Ay0bch9-eZ5sXYm1kEFjCelf3N-Gg&loading=async&libraries=places,marker&callback=initMap`;
        document.head.appendChild(script);

        window.initMap = () => {
            let parisCenterLongLat = {lat: 48.868476, lng: 2.299877}
            this.map = new window.google.maps.Map(document.getElementById("sm_googleMap"), {
                mapId: "MY_MAP_ID",
                zoom: 13,
                center: parisCenterLongLat,
                mapTypeId: window.google.maps.MapTypeId.ROADMAP,
                mapTypeControlOptions: {
                    mapTypeIds: ["roadmap", "hide_poi"]
                },
                zoomControl: false,
                streetViewControl: false
            })

            this.directionsRenderer = new google.maps.DirectionsRenderer()
            this.directionsRenderer.setMap(this.map)

            this.directionsRenderer.setPanel(document.getElementById("sm_directions"))
            this.hidePointsOfInterest();
        }
    }

     calculateRoute = () =>
    {
        this.infoWindow.close()
        this.closeMenu()
        console.log(this.state.routeArray[0])
        console.log(this.state.routeArray[this.state.routeArray.length-1])
        let stops = []
        let routeArray = this.state.routeArray
        let wayPointsObject = []
        if (this.state.routeArray.length>2){
            stops = routeArray.slice(1, -1);
            for (let i = 0; i < stops.length; i++) {
                wayPointsObject.push({
                        location: stops[i],
                        stopover: true,
                    })
            }
        }

        let request;
        if (stops.length===0){
            request = {origin: this.state.routeArray[0],
                destination: this.state.routeArray[this.state.routeArray.length-1],
                travelMode:this.state.transportMode.toUpperCase()}
        } else {
            request = {origin: this.state.routeArray[0],
                destination: this.state.routeArray[this.state.routeArray.length-1],
                waypoints: wayPointsObject,
                travelMode:this.state.transportMode.toUpperCase()}
        }

        this.directionsService = new window.google.maps.DirectionsService()
       this.directionsService.route(request, (route, status) =>
        {
            if (status === window.google.maps.DirectionsStatus.OK)
            {
                this.directionsRenderer.setDirections(route)
            }
        })
        this.setState({infoWindowOpen:false,directionsOpen:true})
    }
    // https://developers.google.com/maps/documentation/javascript/places <--- used documentation for nearby search code
    findPlacesInParis = (keyword) => {
        this.closeMenu()
        let trueTags = [];

        for (let [key, value] of Object.entries(this.state.filterTypes)) {
            if (value === true) {
                trueTags.push(key);
            }
        }


        let map = this.map
        let parisCenterLongLat = {lat: 48.8566, lng: 2.3522};
        const request = {
            location: parisCenterLongLat,
            radius: '10000',
            fields: ['name', 'geometry', "icon", "rating", "price_level", "opening_hours", "photos", "adr_address", "website"],
            types: trueTags,
            keyword: keyword
        };
        const service = new window.google.maps.places.PlacesService(this.map);
        service.nearbySearch(request, callback);

        let createMarker = this.createMarker
        let openMapMark = this.openMapMark
        this.removeMarkers()


        function callback(results, status) {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    if (results[i].geometry) {
                        createMarker(results[i])
                    }
                }
            }
            openMapMark(0);
        }
    }

    createMarker = (place) => {

        const icon = {
            url: place.icon,
            scaledSize: new window.google.maps.Size(35, 35)
        };
        const marker = new window.google.maps.Marker({
            map: this.map,
            position: place.geometry.location,
            icon: icon
        })

        if (!this.infoWindow) {
            this.infoWindow = new window.google.maps.InfoWindow();
        }
        let infoWindowWidth = (window.screen.width / 100) * 80

        if (infoWindowWidth > 400) {
            infoWindowWidth = 400;
        }
        let images = '';
        if (place.photos !== undefined) {
            place.photos.forEach(photo => {
                const imageUrl = photo.getUrl();
                const width = infoWindowWidth;
                const aspectRatio = photo.width / photo.height;
                const height = Math.round(width / aspectRatio);
                images += `<img alt class="sm_backgroundImage" src="${imageUrl}" style="width:${width}px; height:${height}px;">`;
            });
        }

        const contentString = `<div class="sm_infoWindowContent">
        <div class="sm_infoBoxImageHolder">${images}</div>
        <div><h1>${place.name}</h1></div>
    </div>`;


        window.google.maps.event.addListener(marker, "click", () => {
            this.infoWindow.setContent(contentString);
            this.infoWindow.open(this.map, marker);
            if (!this.state.infoWindowOpen) {
                this.setState({infoWindowOpen: true})
            }
        })


        window.google.maps.event.addListener(this.infoWindow, "closeclick", () => {
            if (this.state.infoWindowOpen) {
                this.setState({infoWindowOpen: false})
            }
        })

        let mapMarkers = this.state.currentMapMarkers;

        let mapMarkWithContent = {marker: marker, content: contentString, name: place.name, types: place.types}
        mapMarkers.push(mapMarkWithContent)
        this.setState({currentMapMarkers: mapMarkers})
    }


    openMapMark = (positionInArray) => {

        let pos = this.state.currentMapMarkers[positionInArray].marker.position;
        this.infoWindow.setContent(this.state.currentMapMarkers[positionInArray].content);
        this.infoWindow.open(this.map, this.state.currentMapMarkers[positionInArray].marker);
        this.setState({infoWindowOpen: true, currentlyViewedItemIndex: positionInArray})
        this.map.setCenter(pos)
        this.map.setZoom(15);
    }
    removeMarkers = (place) => {
        let mapMarkers = this.state.currentMapMarkers;
        for (let i = 0; i < mapMarkers.length; i++) {
            mapMarkers[i].marker.setMap(null);
        }
        let emptyMapMarkers = []
        this.setState({currentMapMarkers: emptyMapMarkers})
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

    closeMenu = () => {
        this.menuAnimation(true)
        this.setState({menuItemOpen: false})
    }
    openMenuItem = (menuItem) => {
        if (this.state.menuItemOpen) {
            if (this.state.mapMenuItem === menuItem) {
                this.closeMenu()
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
        this.setState({searchValue: newSearchValue})
    }
    toggleFilterOptions = () => {
        this.setState({filterOptionsOpen: !this.state.filterOptionsOpen})
    }
    changeFilterCategory = (category) => {
        if (category !== this.state.filterCategory || !this.state.filterCategoryOpen) {
            this.setState({filterCategory: category, filterCategoryOpen: true})
        } else {
            this.setState({filterCategoryOpen: false, filterCategory: ""});
        }
    }

    changeCheck = (item) => {
        let filterTypes = this.state.filterTypes
        let toChange = filterTypes[item]
        toChange = !toChange;
        filterTypes[item] = toChange

        this.setState({filterTypes: filterTypes})
    }

    changeAllCheck = (boolean) => {
        let allChanged = {}
        for (let [key, value] of Object.entries(this.state.filterTypes)) {
            allChanged[key] = boolean
        }

        this.setState({filterTypes: allChanged})
    }

    changeViewedMarker = (direction) => {
        let viewedMarkerIndex = this.state.currentlyViewedItemIndex + direction;

        console.log(viewedMarkerIndex)
        this.openMapMark(viewedMarkerIndex)
        this.setState({currentlyViewedItemIndex: viewedMarkerIndex})
    }


    changeRouteOrder = (direction, index) => {
        let arrayCopy = this.state.routeArray
        let temp = this.state.routeArray[index];

        if (direction === 1) {
            arrayCopy[index] = arrayCopy[index + 1]
            arrayCopy[index + 1] = temp;
        } else {
            arrayCopy[index] = arrayCopy[index - 1]
            arrayCopy[index - 1] = temp
        }

        this.setState({routeArray: arrayCopy})
    }
    removeFromRouteArray = (index) => {
        let arrayCopy = this.state.routeArray
        arrayCopy.splice(index, 1);
        this.setState({routeArray: arrayCopy})
    }


    setTransport = (transport) => {
        this.setState({transportMode:transport})
    }


    toggleDirections = () => {
        let directionsElem = document.getElementById("sm_directions")
        if (this.state.directionsOpen){
            directionsElem.classList.add("sm_displayNone")
            this.setState({directionsOpen:false})
        } else {
            directionsElem.classList.remove("sm_displayNone")
            this.setState({directionsOpen:true})
        }
    }
    /// all checkbox classes are taken from https://getcssscan.com/css-checkboxes-examples (I did not change class names for this reason)
    render() {

        let filterTypes = this.state.filterTypes
        let entertainment = (
            <div className="sm_categoryItems">
                <div className="sm_categoryHolders">
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox">Zoo</div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_zooCheckBox" checked={filterTypes.zoo} onChange={() => {
                            }} onClick={() => this.changeCheck("zoo")}/>
                            <label htmlFor="sm_zooCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>Night Club</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_nightClubCheckBox" onChange={() => {
                            }} checked={filterTypes.night_club} onClick={() => this.changeCheck("night_club")}/>
                            <label htmlFor="sm_nightClubCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>Movie Theatres</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_movieTheatresCheckBox" onChange={() => {
                            }} checked={filterTypes.movie_theater} onClick={() => this.changeCheck("movie_theater")}/>
                            <label htmlFor="sm_movieTheatresCheckBox" className="check-box"></label>
                        </div>
                    </div>
                </div>
            </div>
        )
        let FoodDrink = (
            <div className="sm_categoryItems">
                <div className="sm_categoryHolders">
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>Cafe</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_coffeeShopCheckBox" onChange={() => {
                            }} checked={filterTypes.cafe} onClick={() => this.changeCheck("cafe")}/>
                            <label htmlFor="sm_coffeeShopCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>Restaurant</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_dinerCheckBox" onChange={() => {
                            }} checked={filterTypes.restaurant} onClick={() => this.changeCheck("restaurant")}/>
                            <label htmlFor="sm_dinerCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>Takeout</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_takeoutCheckBox" onChange={() => {
                            }} checked={filterTypes.meal_takeaway} onClick={() => this.changeCheck("meal_takeaway")}/>
                            <label htmlFor="sm_takeoutCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>Liquor Shop</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_liquorShopCheckBox" onChange={() => {
                            }} checked={filterTypes.liquor_store} onClick={() => this.changeCheck("liquor_store")}/>
                            <label htmlFor="sm_liquorShopCheckBox" className="check-box"></label>
                        </div>
                    </div>
                </div>
            </div>
        )
        let Shopping = (
            <div className="sm_categoryItems">
                <div className="sm_categoryHolders">
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>Clothing Shop</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_apparelStoreCheckBox" onChange={() => {
                            }} checked={filterTypes.clothing_store} onClick={() => this.changeCheck("clothing_store")}/>
                            <label htmlFor="sm_apparelStoreCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>Shopping Mall</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_mallCheckBox" onChange={() => {
                            }} checked={filterTypes.shopping_mall} onClick={() => this.changeCheck("shopping_mall")}/>
                            <label htmlFor="sm_mallCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>Footwear</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_footwearStoreCheckBox" onChange={() => {
                            }} checked={filterTypes.shoe_store} onClick={() => this.changeCheck("shoe_store")}/>
                            <label htmlFor="sm_footwearStoreCheckBox" className="check-box"></label>
                        </div>
                    </div>
                </div>
            </div>
        )
        let Transportation = (
            <div className="sm_categoryItems">
                <div className="sm_categoryHolders">
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>Airport</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_airportCheckBox" onChange={() => {
                            }} checked={filterTypes.airport} onClick={() => this.changeCheck("airport")}/>
                            <label htmlFor="sm_airportCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>Train Station</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_trainStationCheckBox" onChange={() => {
                            }} checked={filterTypes.train_station} onClick={() => this.changeCheck("train_station")}/>
                            <label htmlFor="sm_trainStationCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>Subway Station</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_subwayStationCheckBox" onChange={() => {
                            }} checked={filterTypes.subway_station} onClick={() => this.changeCheck("subway_station")}/>
                            <label htmlFor="sm_subwayStationCheckBox" className="check-box"></label>
                        </div>
                    </div>
                </div>
            </div>
        )
        let Health = (
            <div className="sm_categoryItems">
                <div className="sm_categoryHolders">
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>Pharmacy</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_pharmacyCheckBox" onChange={() => {
                            }} checked={filterTypes.pharmacy} onClick={() => this.changeCheck("pharmacy")}/>
                            <label htmlFor="sm_pharmacyCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>Parking</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_parkingCheckBox" onChange={() => {
                            }} checked={filterTypes.parking} onClick={() => this.changeCheck("parking")}/>
                            <label htmlFor="sm_parkingCheckBox" className="check-box"></label>
                        </div>
                    </div>
                </div>
            </div>
        )
        let Attractions = (
            <div className="sm_categoryItems">
                <div className="sm_categoryHolders">
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>Tourist Attraction</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_touristAttractionCheckBox" onChange={() => {
                            }} checked={filterTypes.tourist_attraction}
                                   onClick={() => this.changeCheck("tourist_attraction")}/>
                            <label htmlFor="sm_touristAttractionCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>Museum</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_museumCheckBox" onChange={() => {
                            }} checked={filterTypes.museum} onClick={() => this.changeCheck("museum")}/>
                            <label htmlFor="sm_museumCheckBox" className="check-box"></label>
                        </div>
                    </div>
                </div>
            </div>
        )

        let FilterOptions = (
            <div className="sm_filterOptions">
                <div className="sm_filterRow">
                    <div className="sm_buttonGreen sm_menuItemInner"
                         onClick={() => this.changeAllCheck(true)}><p>Check All</p>
                    </div>
                    <div className="sm_buttonRed sm_menuItemInner"
                         onClick={() => this.changeAllCheck(false)}><p>Uncheck All</p>
                    </div>
                </div>
                <div className="sm_filterRow">
                    <div className="sm_filterCat">
                        <div onClick={() => this.changeFilterCategory("Entertainment")}><p>Entertainment</p></div>
                        {this.state.filterCategory === "Entertainment" && entertainment}
                    </div>
                </div>
                <div className="sm_filterRow">
                    <div className="sm_filterCat">
                        <div onClick={() => this.changeFilterCategory("FoodDrink")}><p>Food & Drink</p></div>
                        {this.state.filterCategory === "FoodDrink" && FoodDrink}
                    </div>
                </div>
                <div className="sm_filterRow">
                    <div className="sm_filterCat">
                        <div onClick={() => this.changeFilterCategory("Shopping")}><p>Shopping</p></div>
                        {this.state.filterCategory === "Shopping" && Shopping}
                    </div>
                </div>
                <div className="sm_filterRow">
                    <div className="sm_filterCat">
                        <div onClick={() => this.changeFilterCategory("Transportation")}><p>Transportation</p></div>
                        {this.state.filterCategory === "Transportation" && Transportation}
                    </div>
                </div>
                <div className="sm_filterRow">
                    <div className="sm_filterCat">
                        <div onClick={() => this.changeFilterCategory("Health")}><p>Health</p></div>
                        {this.state.filterCategory === "Health" && Health}
                    </div>
                </div>
                <div className="sm_filterRow">
                    <div className="sm_filterCat">
                        <div onClick={() => this.changeFilterCategory("Attractions")}><p>Attractions</p></div>
                        {this.state.filterCategory === "Attractions" && Attractions}
                    </div>
                </div>
            </div>
        );


        let routeItems = []; // Initialize an array to hold JSX elements


        /// https://fontawesome.com/search?q=arrow&o=r&m=free <----- arrow symbols used, taken from here
        if (this.state.routeArray.length > 0) {
            this.state.routeArray.forEach((location, index) => {
                if (index === 0) {

                    if (this.state.routeArray.length !== 1) {
                        routeItems.push(
                            <div className="sm_menuItem" key={index}>
                                <div className="sm_routeItemSplit sm_topMostRoute">
                                    <div className="sm_routeIndicator"><p><b>BEGIN </b></p></div>
                                    <p>{location}</p>
                                    <div className="sm_changeOrderArrows">
                                        <div className="sm_arrowBox" onClick={() => this.removeFromRouteArray(index)}><i
                                            className="fa-solid fa-circle-xmark"></i></div>
                                        <div className="sm_arrowBox" onClick={() => this.changeRouteOrder(1, index)}><i
                                            className="fa-solid fa-arrow-down"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    } else {
                        routeItems.push(
                            <div className="sm_menuItem" key={index}>
                                <div className="sm_routeItemSplit sm_topMostRoute">
                                    <div className="sm_routeIndicator"><p><b>BEGIN </b></p></div>
                                    <p>{location}</p>
                                    <div className="sm_changeOrderArrows">
                                        <div className="sm_arrowBox" onClick={() => this.removeFromRouteArray(index)}><i
                                            className="fa-solid fa-circle-xmark"></i></div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                } else if (index === this.state.routeArray.length - 1) {
                    routeItems.push(
                        <div className="sm_menuItem" key={index}>
                            <div className="sm_routeItemSplit sm_lastRoute">
                                <div className="sm_routeIndicator"><p><b>END </b></p></div>
                                <p>{location}</p>
                                <div className="sm_changeOrderArrows">
                                    <div className="sm_arrowBox" onClick={() => this.removeFromRouteArray(index)}><i
                                        className="fa-solid fa-circle-xmark"></i></div>
                                    <div className="sm_arrowBox" onClick={() => this.changeRouteOrder(-1, index)}><i
                                        className="fa-solid fa-arrow-up"></i></div>
                                </div>
                            </div>
                        </div>
                    )
                } else {
                    routeItems.push(
                        <div className="sm_menuItem" key={index}>
                            <div className="sm_routeItemSplit sm_middleRoute">
                                <div className="sm_routeIndicator"></div>
                                <p>{location}</p>
                                <div className="sm_changeOrderArrows">
                                    <div className="sm_arrowBox" onClick={() => this.removeFromRouteArray(index)}><i
                                        className="fa-solid fa-circle-xmark"></i></div>
                                    <div className="sm_arrowBox" onClick={() => this.changeRouteOrder(1, index)}><i
                                        className="fa-solid fa-arrow-down"></i></div>
                                    <div className="sm_arrowBox" onClick={() => this.changeRouteOrder(-1, index)}><i
                                        className="fa-solid fa-arrow-up"></i></div>
                                </div>
                            </div>
                        </div>
                    )
                }
            })
        } else {
            routeItems.push(
                <div className="sm_menuItem" >
                    <div className="sm_routeItemSplit">
                        <p>Your routes are empty!</p>
                    </div>
                </div>
            )
        }
        let planRouteElement = (
            <div className="sm_menuItemsContainer">
                <div className="sm_modeOfTransportContainer">
                    <div className={`sm_modeOfTransport sm_grow ${this.state.transportMode === "walking" ? "sm_transportSelected" : ""}`} onClick={() => this.setTransport("walking")}><i
                        className="fa-solid fa-person-walking"></i></div>
                    <div className={`sm_modeOfTransport sm_grow ${this.state.transportMode === "bicycling" ? "sm_transportSelected" : ""}`} onClick={() => this.setTransport("bicycling")}><i
                        className="fa-solid fa-person-biking"></i></div>
                    <div className={`sm_modeOfTransport sm_grow ${this.state.transportMode === "driving" ? "sm_transportSelected" : ""}`} onClick={() => this.setTransport("driving")}><i
                        className="fa-solid fa-car-side"></i></div>
                </div>
                {routeItems.map((element, index) => (
                    <div key={index}>
                        {element}
                    </div>
                ))}
                <div className="sm_buttonGreen" onClick={this.calculateRoute}>Get Directions</div>
            </div>
        );

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
                    <div className="sm_menuItemInner sm_buttonGrey" onClick={this.toggleFilterOptions}>
                        Filters
                    </div>
                    <div className="sm_buttonGreen sm_menuItemInner"
                         onClick={() => this.findPlacesInParis(this.state.searchValue)}>GO
                    </div>
                </div>
                {this.state.filterOptionsOpen ? FilterOptions : null}
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

        let buttonsOnView;

        let typesExist = false;
        let addToStayingAtButton = null;

        if (this.state.currentMapMarkers && this.state.currentMapMarkers[this.state.currentlyViewedItemIndex] && this.state.currentMapMarkers[this.state.currentlyViewedItemIndex].types !== undefined) {
            typesExist = true;
            const types = this.state.currentMapMarkers[this.state.currentlyViewedItemIndex].types;
            if (types.includes("lodging")) {
                addToStayingAtButton = (
                    <div className="sm_leftButtons">
                        <div className="sm_buttonGrey sm_leftButton" onClick={this.addPlaceToRoute}>Add to Route</div>
                        <div className="sm_buttonGrey sm_leftButton" onClick={this.changeStayingAt}>Staying here</div>
                    </div>
                )
            } else {
                addToStayingAtButton = (
                    <div className="sm_leftButtons">
                        <div className="sm_buttonGrey sm_leftButton" onClick={this.addPlaceToRoute}>Add to Route</div>
                    </div>
                )
            }
            if (this.state.currentlyViewedItemIndex === 0) {
                buttonsOnView = (<div className="sm_containButtons">
                    {typesExist && addToStayingAtButton}
                    <div className="sm_prevNextButtons sm_buttonGrey" onClick={() => this.changeViewedMarker(1)}>Next
                    </div>
                </div>)
            } else if (this.state.currentlyViewedItemIndex === (this.state.currentMapMarkers.length - 1)) {
                buttonsOnView = (<div className="sm_containButtons">
                    {typesExist && addToStayingAtButton}
                    <div className="sm_prevNextButtons sm_buttonGrey"
                         onClick={() => this.changeViewedMarker(-1)}>Previous
                    </div>
                </div>)
            } else {
                buttonsOnView = (
                    <div className="sm_containButtons">
                        {typesExist && addToStayingAtButton}
                        <div className="sm_prevNextButtons sm_buttonGrey"
                             onClick={() => this.changeViewedMarker(-1)}>Previous
                        </div>
                        <div className="sm_prevNextButtons sm_buttonGrey"
                             onClick={() => this.changeViewedMarker(1)}>Next
                        </div>
                    </div>
                )
            }

        }
        let nextPrevButtons = (
            <div className="sm_nextPrevButtonHold">
                <div id="sm_popUpMessage" className="sm_displayNone"> POP UP MESSAGE</div>
                {buttonsOnView}
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
                {this.state.infoWindowOpen && this.state.currentMapMarkers.length > 1 && nextPrevButtons}
                <div id="sm_directionsContainer">
                    <div id="sm_directions">
                        {this.state.directionsOpen? <div className="sm_buttonGrey" onClick={this.toggleDirections}>Hide Directions</div> : null}
                    </div>
                </div>
                <div id="sm_googleMap"></div>
            </div>
        );
    }
}

