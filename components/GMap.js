import React from "react";
import customLocations from '../json/customLocations.json';

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
            "museum": false,
            "lodging": false,
        };

        let customLocationsSelected = {
            "food_and_drinks": false,
            "olympic_merchandise_stores": false,
            "information_desk": false,
            "medical_tents": false
        }


        const textItems = new Map([
            ["Changedyourlodginglocationto", "Changed your lodging location to"],
            ["addedtoroutelist", "added to route list"],
            ["Information Desk", "Information Desk"],
            ["Wildlife", "Wildlife"],
            ["Night Club", "Night Club"],
            ["Movie Theatres", "Movie Theatres"],
            ["Cafe", "Cafe"],
            ["Restaurant", "Restaurant"],
            ["Takeout", "Takeout"],
            ["Liquor Shop", "Liquor Shop"],
            ["Olympic Specials", "Olympic Specials"],
            ["Olympics Merchandise", "Olympics Merchandise"],
            ["Clothing Shop", "Clothing Shop"],
            ["Shopping Mall", "Shopping Mall"],
            ["Footwear", "Footwear"],
            ["Airport", "Airport"],
            ["Train Station", "Train Station"],
            ["Subway Station", "Subway Station"],
            ["Parking", "Parking"],
            ["Pharmacy", "Pharmacy"],
            ["Olympic Medical Tents", "Olympic Medical Tents"],
            ["Tourist Attraction", "Tourist Attraction"],
            ["Museum", "Museum"],
            ["Check All", "Check All"],
            ["Uncheck All", "Uncheck All"],
            ["Olympic Information", "Olympic Information"],
            ["Entertainment", "Entertainment"],
            ["Food & Drink", "Food & Drink"],
            ["Shopping", "Shopping"],
            ["Transportation", "Transportation"],
            ["Health", "Health"],
            ["Attractions", "Attractions"],
            ["BEGIN" ,"BEGIN"],
            ["END" ,"END"],
            ["Your routes are empty!","Your routes are empty!"],
            ["Staying at" ,"Staying at"],
            ["Find accommodation!" ,"Find accommodation!"],
            ["Range:","Range:"],
            ["Search in range of lodging?","Search in range of lodging?"],
            ["Add to Route","Add to Route"],
            ["Staying Here","Staying Here"],
            ["Next","Next"],
            ["Previous","Previous"],
            ["Search", "Search"],
            ["Directions","Directions"],
            ["Near You","Near You"],
            ["Filters","Filters"],
            ["GO","GO"],
            ["Staying at:","Staying at:"],
            ["Get Directions","Get Directions"]
        ])

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
            directionsOpen: false,
            directionsToggle: false,
            rangeValue: 100,
            customLocationsSelected: customLocationsSelected,
            searchInRangeOfLodging: false,
            textItems: textItems,
            preLoadMapItem: this.props.preLoadSearch,
        }

    }

    componentDidMount() {

        this.loadMap();
    }

    doTranslations = () => {

        const textItems = this.state.textItems

        this.props.translateAll(textItems).then(r =>
            this.setState({textItems: r}))
    }
    toggleLodgingRange = (e) => {
        console.log(e.target.checked)
        this.setState({searchInRangeOfLodging: e.target.checked})
    }
    toggleCustomLocations = (type) => {
        let customLocations = this.state.customLocationsSelected
        customLocations[type] = !customLocations[type]
        this.setState({customLocations: customLocations})
    }

    popUpMessage = (placeName, stayingAtOrRoute) => {
        let message;

        if (stayingAtOrRoute === "stayingAt") {
            message = `<p>${this.state.textItems.get("Changedyourlodginglocationto")}</p> <b>${placeName}</b>!`;
        } else {
            message = `<b>${placeName}</b> <p>${this.state.textItems.get("addedtoroutelist")}</p>`;
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
        let currentMarkerPos = this.state.currentMapMarkers[this.state.currentlyViewedItemIndex].marker.position
        console.log(currentMarkerName + " name of marker")
        let stayingAt = {}
        this.popUpMessage(currentMarkerName, "stayingAt");
        stayingAt.name = currentMarkerName
        stayingAt.position = currentMarkerPos

        this.setState({stayingAt: stayingAt})
    }
    addPlaceToRoute = () => {
        let currentMarkerName = this.state.currentMapMarkers[this.state.currentlyViewedItemIndex].name
        let currentMarkerPos = this.state.currentMapMarkers[this.state.currentlyViewedItemIndex].marker.position
        let placesInRoute = this.state.routeArray
        this.popUpMessage(currentMarkerName, "addToRoute");
        let placeToPush = {name: currentMarkerName, position: currentMarkerPos}
        placesInRoute.push(placeToPush)
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
            this.doTranslations();

            if (this.state.preLoadMapItem !== ""){
                this.findPlacesInParis(this.state.preLoadMapItem)
                this.setState({preLoadMapItem:""})
            }
        }
    }

    calculateRoute = () => {
        this.infoWindow.close()
        this.closeMenu()

        console.log(this.state.routeArray[this.state.routeArray.length - 1])
        let stops = []
        let routeArray = this.state.routeArray
        let wayPointsObject = []
        if (this.state.routeArray.length > 2) {
            stops = routeArray.slice(1, -1);
            for (let i = 0; i < stops.length; i++) {
                wayPointsObject.push({
                    location: stops[i].position,
                    stopover: true,
                })
            }
        }

        let request;
        if (stops.length === 0) {
            request = {
                origin: this.state.routeArray[0].position,
                destination: this.state.routeArray[this.state.routeArray.length - 1].position,
                travelMode: this.state.transportMode.toUpperCase()
            }
        } else {
            request = {
                origin: this.state.routeArray[0].position,
                destination: this.state.routeArray[this.state.routeArray.length - 1].position,
                waypoints: wayPointsObject,
                travelMode: this.state.transportMode.toUpperCase()
            }
        }

        this.directionsService = new window.google.maps.DirectionsService()
        this.directionsService.route(request, (route, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
                this.directionsRenderer.setDirections(route)
            }
        })
        let directionsElem = document.getElementById("sm_directions")
        directionsElem.classList.remove("sm_displayNone")

        this.setState({infoWindowOpen: false, directionsOpen: true})
    }
    // https://developers.google.com/maps/documentation/javascript/places <--- used documentation for nearby search code
    findPlacesInParis = (keyword) => {

        console.log("in search paris")
        this.closeMenu()
        let trueTags = [];

        for (let [key, value] of Object.entries(this.state.filterTypes)) {
            if (value === true) {
                trueTags.push(key);
            }
        }
        let request = null

        if (this.state.stayingAt.name && this.state.searchInRangeOfLodging) {
            let stayingAtPos = this.state.stayingAt.position
            request = {
                location: stayingAtPos,
                radius: this.state.rangeValue,
                fields: ['name', 'geometry', "icon", "rating", "price_level", "opening_hours", "photos", "adr_address", "website"],
                types: trueTags,
                keyword: keyword
            }
        } else {
            let parisCenterLongLat = {lat: 48.8566, lng: 2.3522};
            request = {
                location: parisCenterLongLat,
                radius: '10000',
                fields: ['name', 'geometry', "icon", "rating", "price_level", "opening_hours", "photos", "adr_address", "website"],
                types: trueTags,
                keyword: keyword
            }
        }


        const service = new window.google.maps.places.PlacesService(this.map);
        service.nearbySearch(request, callback);

        let createMarker = this.createMarker
        let openMapMark = this.openMapMark
        this.removeMarkers()
        let loadCustomLocations = this.loadCustomLocations;


        function callback(results, status) {

            let count = loadCustomLocations()
            console.log("custom count " + count)
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {

                if (trueTags.length > 0 || keyword.length > 0) {
                    for (let i = 0; i < results.length; i++) {
                        if (results[i].geometry) {
                            createMarker(results[i])
                            count++;
                        }
                    }
                }
            }
            if (count > 0) {
                openMapMark(0);
            }
        }
    }

    loadCustomLocations = () => {
        let customCount = 0;
        let customLocationArray = customLocations.locations
        let customLocationsSelected = this.state.customLocationsSelected
        let trueTags = [];

        for (let [key, value] of Object.entries(this.state.customLocationsSelected)) {
            if (value === true) {
                trueTags.push(key)
            }
        }

        customLocationArray.forEach(location => {
            let locationType = location.types[0]
            if (trueTags.includes(locationType)) {
                this.createMarker(location)
                customCount++;
            }

        })
        return customCount;
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
        let allChangedCustom = {}
        for (let [key, value] of Object.entries(this.state.filterTypes)) {
            allChanged[key] = boolean
        }

        for (let [key, value] of Object.entries(this.state.customLocationsSelected)) {
            allChangedCustom[key] = boolean
        }

        this.setState({filterTypes: allChanged, customLocationsSelected: allChangedCustom})
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
        this.setState({transportMode: transport})
    }


    toggleDirections = () => {
        let directionsElem = document.getElementById("sm_directions")
        if (this.state.directionsOpen) {
            directionsElem.classList.add("sm_displayNone")
            this.setState({directionsOpen: false})
        } else {
            directionsElem.classList.remove("sm_displayNone")
            this.setState({directionsOpen: true})
        }
    }

    /// all checkbox classes are taken from https://getcssscan.com/css-checkboxes-examples (I did not change class names for this reason)
    render() {

        let filterTypes = this.state.filterTypes
        let customLocationsSelected = this.state.customLocationsSelected
        let information = (
            <div className="sm_categoryItems">
                <div className="sm_categoryHolders">
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>{this.state.textItems.get("Information Desk")}</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_informationDesk"
                                   checked={customLocationsSelected.information_desk}
                                   onClick={() => this.toggleCustomLocations("information_desk")}/>
                            <label htmlFor="sm_informationDesk" className="check-box"></label>
                        </div>
                    </div>
                </div>
            </div>
        )
        let entertainment = (
            <div className="sm_categoryItems">
                <div className="sm_categoryHolders">
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>{this.state.textItems.get("Wildlife")}</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_zooCheckBox" checked={filterTypes.zoo} onChange={() => {
                            }} onClick={() => this.changeCheck("zoo")}/>
                            <label htmlFor="sm_zooCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>{this.state.textItems.get("Night Club")}</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_nightClubCheckBox" onChange={() => {
                            }} checked={filterTypes.night_club} onClick={() => this.changeCheck("night_club")}/>
                            <label htmlFor="sm_nightClubCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>{this.state.textItems.get("Movie Theatres")}</p></div>
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
                        <div className="sm_labelCheckBox"><p>{this.state.textItems.get("Cafe")}</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_coffeeShopCheckBox" onChange={() => {
                            }} checked={filterTypes.cafe} onClick={() => this.changeCheck("cafe")}/>
                            <label htmlFor="sm_coffeeShopCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>{this.state.textItems.get("Restaurant")}</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_dinerCheckBox" onChange={() => {
                            }} checked={filterTypes.restaurant} onClick={() => this.changeCheck("restaurant")}/>
                            <label htmlFor="sm_dinerCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>{this.state.textItems.get("Takeout")}</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_takeoutCheckBox" onChange={() => {
                            }} checked={filterTypes.meal_takeaway} onClick={() => this.changeCheck("meal_takeaway")}/>
                            <label htmlFor="sm_takeoutCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>{this.state.textItems.get("Liquor Shop")}</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_liquorShopCheckBox" onChange={() => {
                            }} checked={filterTypes.liquor_store} onClick={() => this.changeCheck("liquor_store")}/>
                            <label htmlFor="sm_liquorShopCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>{this.state.textItems.get("Olympic Specials")}</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_food_and_drinks" onChange={() => {
                            }} checked={customLocationsSelected.food_and_drinks}
                                   onClick={() => this.toggleCustomLocations("food_and_drinks")}/>
                            <label htmlFor="sm_food_and_drinks" className="check-box"></label>
                        </div>
                    </div>
                </div>
            </div>
        )
        let Shopping = (
            <div className="sm_categoryItems">
                <div className="sm_categoryHolders">
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>{this.state.textItems.get("Olympics Merchandise")}</p>
                        </div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_olympicMerch" onChange={() => {
                            }} checked={customLocationsSelected.olympic_merchandise_stores}
                                   onClick={() => this.toggleCustomLocations("olympic_merchandise_stores")}/>
                            <label htmlFor="sm_olympicMerch" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>{this.state.textItems.get("Clothing Shop")}</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_apparelStoreCheckBox" onChange={() => {
                            }} checked={filterTypes.clothing_store} onClick={() => this.changeCheck("clothing_store")}/>
                            <label htmlFor="sm_apparelStoreCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>{this.state.textItems.get("Shopping Mall")}</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_mallCheckBox" onChange={() => {
                            }} checked={filterTypes.shopping_mall} onClick={() => this.changeCheck("shopping_mall")}/>
                            <label htmlFor="sm_mallCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>{this.state.textItems.get("Footwear")}</p></div>
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
                        <div className="sm_labelCheckBox"><p>{this.state.textItems.get("Airport")}</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_airportCheckBox" onChange={() => {
                            }} checked={filterTypes.airport} onClick={() => this.changeCheck("airport")}/>
                            <label htmlFor="sm_airportCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>{this.state.textItems.get("Train Station")}</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_trainStationCheckBox" onChange={() => {
                            }} checked={filterTypes.train_station} onClick={() => this.changeCheck("train_station")}/>
                            <label htmlFor="sm_trainStationCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>{this.state.textItems.get("Subway Station")}</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_subwayStationCheckBox" onChange={() => {
                            }} checked={filterTypes.subway_station} onClick={() => this.changeCheck("subway_station")}/>
                            <label htmlFor="sm_subwayStationCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>{this.state.textItems.get("Parking")}</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_parkingCheckBox" onChange={() => {
                            }} checked={filterTypes.parking} onClick={() => this.changeCheck("parking")}/>
                            <label htmlFor="sm_parkingCheckBox" className="check-box"></label>
                        </div>
                    </div>
                </div>
            </div>
        )
        let Health = (
            <div className="sm_categoryItems">
                <div className="sm_categoryHolders">
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>{this.state.textItems.get("Pharmacy")}</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_pharmacyCheckBox" onChange={() => {
                            }} checked={filterTypes.pharmacy} onClick={() => this.changeCheck("pharmacy")}/>
                            <label htmlFor="sm_pharmacyCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>{this.state.textItems.get("Olympic Medical Tents")}</p>
                        </div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_medicalTents" onChange={() => {
                            }} checked={customLocationsSelected.medical_tents}
                                   onClick={() => this.toggleCustomLocations("medical_tents")}/>
                            <label htmlFor="sm_medicalTents" className="check-box"></label>
                        </div>
                    </div>
                </div>
            </div>
        )
        let Attractions = (
            <div className="sm_categoryItems">
                <div className="sm_categoryHolders">
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>{this.state.textItems.get("Tourist Attraction")}</p></div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_touristAttractionCheckBox" onChange={() => {
                            }} checked={filterTypes.tourist_attraction}
                                   onClick={() => this.changeCheck("tourist_attraction")}/>
                            <label htmlFor="sm_touristAttractionCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox"><p>{this.state.textItems.get("Museum")}</p></div>
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
                    <div className="sm_buttonGreen sm_menuItemInner sm_checkBoxButton"
                         onClick={() => this.changeAllCheck(true)}><p>{this.state.textItems.get("Check All")}</p>
                    </div>
                    <div className="sm_buttonRed sm_menuItemInner sm_checkBoxButton"
                         onClick={() => this.changeAllCheck(false)}><p>{this.state.textItems.get("Uncheck All")}</p>
                    </div>
                </div>
                <div className="sm_filterRow">
                    <div className="sm_filterCat">
                        <div onClick={() => this.changeFilterCategory("OlympicInformation")}>
                            <p>{this.state.textItems.get("Olympic Information")}</p>
                        </div>
                        {this.state.filterCategory === "OlympicInformation" && information}
                    </div>
                </div>
                <div className="sm_filterRow">
                    <div className="sm_filterCat">
                        <div onClick={() => this.changeFilterCategory("Entertainment")}>
                            <p>{this.state.textItems.get("Entertainment")}</p></div>
                        {this.state.filterCategory === "Entertainment" && entertainment}
                    </div>
                </div>
                <div className="sm_filterRow">
                    <div className="sm_filterCat">
                        <div onClick={() => this.changeFilterCategory("FoodDrink")}>
                            <p>{this.state.textItems.get("Food & Drink")}</p></div>
                        {this.state.filterCategory === "FoodDrink" && FoodDrink}
                    </div>
                </div>
                <div className="sm_filterRow">
                    <div className="sm_filterCat">
                        <div onClick={() => this.changeFilterCategory("Shopping")}>
                            <p>{this.state.textItems.get("Shopping")}</p></div>
                        {this.state.filterCategory === "Shopping" && Shopping}
                    </div>
                </div>
                <div className="sm_filterRow">
                    <div className="sm_filterCat">
                        <div onClick={() => this.changeFilterCategory("Transportation")}>
                            <p>{this.state.textItems.get("Transportation")}</p></div>
                        {this.state.filterCategory === "Transportation" && Transportation}
                    </div>
                </div>
                <div className="sm_filterRow">
                    <div className="sm_filterCat">
                        <div onClick={() => this.changeFilterCategory("Health")}>
                            <p>{this.state.textItems.get("Health")}</p></div>
                        {this.state.filterCategory === "Health" && Health}
                    </div>
                </div>
                <div className="sm_filterRow">
                    <div className="sm_filterCat">
                        <div onClick={() => this.changeFilterCategory("Attractions")}>
                            <p>{this.state.textItems.get("Attractions")}</p></div>
                        {this.state.filterCategory === "Attractions" && Attractions}
                    </div>
                </div>
            </div>
        )


        let routeItems = []


        /// https://fontawesome.com/search?q=arrow&o=r&m=free <----- arrow symbols used, taken from here
        if (this.state.routeArray.length > 0) {
            this.state.routeArray.forEach((location, index) => {
                if (index === 0) {
                    if (this.state.routeArray.length !== 1) {
                        routeItems.push(
                            <div className="sm_menuItem" key={index}>
                                <div className="sm_routeItemSplit sm_topMostRoute">
                                    <div className="sm_routeIndicator"><p><b>{this.state.textItems.get("BEGIN")} </b>
                                    </p></div>
                                    <p>{location.name}</p>
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
                                    <div className="sm_routeIndicator"><p><b>{this.state.textItems.get("BEGIN")} </b>
                                    </p></div>
                                    <p>{location.name}</p>
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
                                <div className="sm_routeIndicator"><p><b>{this.state.textItems.get("END")} </b></p>
                                </div>
                                <p>{location.name}</p>
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
                                <p>{location.name}</p>
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
                <div className="sm_menuItem">
                    <div className="sm_routeItemSplit">
                        <p>{this.state.textItems.get("Your routes are empty!")}</p>
                    </div>
                </div>
            )
        }
        let planRouteElement = (
            <div className="sm_menuItemsContainer">
                <div className="sm_modeOfTransportContainer">
                    <div
                        className={`sm_modeOfTransport sm_grow ${this.state.transportMode === "walking" ? "sm_transportSelected" : ""}`}
                        onClick={() => this.setTransport("walking")}><i
                        className="fa-solid fa-person-walking"></i></div>
                    <div
                        className={`sm_modeOfTransport sm_grow ${this.state.transportMode === "bicycling" ? "sm_transportSelected" : ""}`}
                        onClick={() => this.setTransport("bicycling")}><i
                        className="fa-solid fa-person-biking"></i></div>
                    <div
                        className={`sm_modeOfTransport sm_grow ${this.state.transportMode === "driving" ? "sm_transportSelected" : ""}`}
                        onClick={() => this.setTransport("driving")}><i
                        className="fa-solid fa-car-side"></i></div>
                </div>
                {routeItems.map((element, index) => (
                    <div key={index}>
                        {element}
                    </div>
                ))}
                {this.state.routeArray.length > 1 ?
                    <div className="sm_buttonGreen" onClick={this.calculateRoute}>
                        <p>{this.state.textItems.get("Get Directions")}</p></div> : null}
            </div>
        )
        let nearYou = (
            <div className="sm_menuItemsContainer">
                <div className="sm_menuItem">
                    <div className="sm_fill">
                        <div className="sm_rangeValueDisplay">
                            <p>{this.state.textItems.get("Staying at:")}</p>
                        </div>
                        {this.state.stayingAt.name ? (
                            <p><b>{this.state.stayingAt.name}</b></p>
                        ) : (
                            <div className="sm_clickable" onClick={() => this.findPlacesInParis("lodging")}>
                                <p>{this.state.textItems.get("Find accommodation!")}</p>
                            </div>
                        )}
                    </div>
                </div>
                {this.state.stayingAt.name && (
                    <div className="sm_menuItem">
                        <div className="sm_rangeValueDisplay">
                            <p>{this.state.textItems.get("Range:")} {this.state.rangeValue}M</p>
                        </div>
                        <input
                            className="sm_slider" id="sm_sliderId" type="range" min="0" max="5000" defaultValue={500}
                            onChange={(e) => this.setState({rangeValue: e.target.value})}></input>
                    </div>
                )}
                {this.state.stayingAt.name && (
                    <div className="sm_menuItem">
                        <p>{this.state.textItems.get("Search in range of lodging?")}</p>
                        <input className="toggle" type="checkbox" onChange={(e) => this.toggleLodgingRange(e)}/>
                    </div>
                )}
            </div>
        )
        let searchElement = (
            <div className="sm_menuItemsContainer">
                <div className="sm_menuItem sm_paddingBottomNone">
                    <input className="sm_searchBar" placeholder={this.state.textItems.get("Search for anything")}
                           onChange={(e) => this.setSearchValue(e)}>
                    </input>
                    <div className="sm_menuItemInner sm_buttonGrey" onClick={this.toggleFilterOptions}>
                        <p>{this.state.textItems.get("Filters")}</p>
                    </div>
                    <div className="sm_buttonGreen sm_menuItemInner"
                         onClick={() => this.findPlacesInParis(this.state.searchValue)}>
                        <p>{this.state.textItems.get("GO")}</p>
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
                        <div className="sm_buttonGrey sm_leftButton" onClick={this.addPlaceToRoute}>
                            <p>{this.state.textItems.get("Add to Route")}</p>
                        </div>
                        <div className="sm_buttonGrey sm_leftButton" onClick={this.changeStayingAt}>
                            <p>{this.state.textItems.get("Staying Here")}</p>
                        </div>
                    </div>
                )
            } else {
                addToStayingAtButton = (
                    <div className="sm_leftButtons">
                        <div className="sm_buttonGrey sm_leftButton" onClick={this.addPlaceToRoute}>
                            <p>{this.state.textItems.get("Add to Route")}</p>
                        </div>
                    </div>
                )
            }
            if (this.state.currentlyViewedItemIndex === 0) {
                buttonsOnView = (<div className="sm_containButtons">
                    {typesExist && addToStayingAtButton}
                    <div className="sm_prevNextButtons sm_buttonGrey" onClick={() => this.changeViewedMarker(1)}>
                        <p>{this.state.textItems.get("Next")}</p>
                    </div>
                </div>)
            } else if (this.state.currentlyViewedItemIndex === (this.state.currentMapMarkers.length - 1)) {
                buttonsOnView = (<div className="sm_containButtons">
                    {typesExist && addToStayingAtButton}
                    <div className="sm_prevNextButtons sm_buttonGrey"
                         onClick={() => this.changeViewedMarker(-1)}><p>{this.state.textItems.get("Previous")}</p>
                    </div>
                </div>)
            } else {
                buttonsOnView = (
                    <div className="sm_containButtons">
                        {typesExist && addToStayingAtButton}
                        <div className="sm_prevNextButtons sm_buttonGrey"
                             onClick={() => this.changeViewedMarker(-1)}><p>{this.state.textItems.get("Previous")}</p>
                        </div>
                        <div className="sm_prevNextButtons sm_buttonGrey"
                             onClick={() => this.changeViewedMarker(1)}><p>{this.state.textItems.get("Next")}</p>
                        </div>
                    </div>
                )
            }

        }
        let nextPrevButtons = (
            <div className="sm_nextPrevButtonHold">
                <div id="sm_popUpMessage" className="sm_displayNone"><p>{this.state.textItems.get("POP UP MESSAGE")}</p>
                </div>
                {buttonsOnView}
            </div>
        )

        return (
            <div className="sm_mapHoldFull">
                <div id="sm_navigation">
                    <div className="sm_mapNavOptions">
                        <div className="sm_navButtonsContainer">
                            <div className="sm_navOptButton" onClick={() => this.openMenuItem("search")}><p>{this.state.textItems.get("Search")}</p>
                            </div>
                            <div className="sm_navOptButton" onClick={() => this.openMenuItem("planRoute")}>
                                <p>{this.state.textItems.get("Directions")}</p>
                            </div>
                            <div className="sm_navOptButton" onClick={() => this.openMenuItem("nearYou")}><p>{this.state.textItems.get("Near You")}</p></div>
                        </div>
                    </div>
                </div>
                {menuToRender}
                {this.state.infoWindowOpen && this.state.currentMapMarkers.length > 1 && nextPrevButtons}
                <div id="sm_directionsContainer">
                    <div id="sm_directions" className="sm_displayNone">
                        {this.state.directionsOpen ?
                            <div className="sm_buttonClose sm_openDirections" onClick={this.toggleDirections}><i
                                className="fa-solid fa-circle-xmark"></i></div> : null}
                    </div>
                </div>
                <div id="sm_googleMap"></div>
            </div>
        )
    }
}

