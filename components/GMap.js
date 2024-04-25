import React from "react";
import customLocations from '../json/customLocations.json';

export default class GMap extends React.Component {
    constructor(props) {

        super(props);

        this.infoWindow = null;

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
            currentlyViewedItemIndex: null
        }

    }

    componentDidMount() {
        this.loadMap();
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
            },
            zoomControl: false,
            streetViewControl: false
        });


        this.hidePointsOfInterest();
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

        let resultWithGeometry
        let geometryFound = false;
        function callback(results, status) {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    if (results[i].geometry){
                        if (!geometryFound){
                            createMarker(results[i])
                        }
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


        console.log(marker.position)
        if (!this.infoWindow) {
            this.infoWindow = new window.google.maps.InfoWindow();
        }
        let infoWindowWidth = (window.screen.width/100)*80

        if (infoWindowWidth > 400){
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
        const contentString = `<div class="sm_infoWindowContent" >
                                        <div class="sm_infoBoxImageHolder"> ${images}</div>
                                                        <div><h1>${place.name}</h1></div>
                        </div>`


        window.google.maps.event.addListener(marker, "click", () => {
            this.infoWindow.setContent(contentString);
            this.infoWindow.open(this.map, marker);
            if (!this.state.infoWindowOpen){
                this.setState({infoWindowOpen:true})
            }
        })

        window.google.maps.event.addListener(this.infoWindow, "closeclick", () => {
            if (this.state.infoWindowOpen){
                this.setState({infoWindowOpen:false})
            }
        })

        let mapMarkers = this.state.currentMapMarkers;

        let mapMarkWithContent = {marker:marker,content:contentString}
        mapMarkers.push(mapMarkWithContent)
        this.setState({currentMapMarkers: mapMarkers})
    }

    openMapMark = (positionInArray) => {

        let pos = this.state.currentMapMarkers[positionInArray].marker.position;

        // let newLat = pos.lat() + 0.004
        // let long = pos.lng()
        //
        // let newCenter = {
        //     lat:newLat,
        //     lng: long
        // }
        //
        // console.log(newCenter)
        this.infoWindow.setContent(this.state.currentMapMarkers[positionInArray].content);
        this.infoWindow.open(this.map, this.state.currentMapMarkers[positionInArray].marker);
        this.setState({infoWindowOpen:true, currentlyViewedItemIndex:positionInArray})
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
            this.setState({filterCategoryOpen: false,filterCategory: ""});
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

        this.setState({filterTypes:allChanged})
    }

    changeViewedMarker = (direction) =>{
        let viewedMarkerIndex = this.state.currentlyViewedItemIndex +direction;

        console.log(viewedMarkerIndex)
        this.openMapMark(viewedMarkerIndex)
        this.setState({currentlyViewedItemIndex:viewedMarkerIndex})
    }


    // let filterTypes = {
    //     "zoo": true,
    //     "night_club": true,
    //     "movie_theater": true,
    //     "cafe": true,
    //     "restaurant": true,
    //     "meal_takeaway": true,
    //     "liquor_store": true,
    //     "clothing_store": true,
    //     "shopping_mall": true,
    //     "shoe_store": true,
    //     "airport": true,
    //     "train_station": true,
    //     "subway_station": true,
    //     "pharmacy": true,
    //     "parking": true,
    //     "tourist_attraction": true,
    //     "museum": true
    // };

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
                        <div className="sm_labelCheckBox">Night Club</div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_nightClubCheckBox" onChange={() => {
                            }} checked={filterTypes.night_club} onClick={() => this.changeCheck("night_club")}/>
                            <label htmlFor="sm_nightClubCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox">Movie Theatres</div>
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
                        <div className="sm_labelCheckBox">Cafe</div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_coffeeShopCheckBox" onChange={() => {
                            }} checked={filterTypes.cafe} onClick={() => this.changeCheck("cafe")}/>
                            <label htmlFor="sm_coffeeShopCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox">Restaurant</div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_dinerCheckBox" onChange={() => {
                            }} checked={filterTypes.restaurant} onClick={() => this.changeCheck("restaurant")}/>
                            <label htmlFor="sm_dinerCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox">Takeout</div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_takeoutCheckBox" onChange={() => {
                            }} checked={filterTypes.meal_takeaway} onClick={() => this.changeCheck("meal_takeaway")}/>
                            <label htmlFor="sm_takeoutCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox">Liquor Shop</div>
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
                        <div className="sm_labelCheckBox">Clothing Shop</div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_apparelStoreCheckBox" onChange={() => {
                            }} checked={filterTypes.clothing_store} onClick={() => this.changeCheck("clothing_store")}/>
                            <label htmlFor="sm_apparelStoreCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox">Shopping Mall</div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_mallCheckBox" onChange={() => {
                            }} checked={filterTypes.shopping_mall} onClick={() => this.changeCheck("shopping_mall")}/>
                            <label htmlFor="sm_mallCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox">Footwear</div>
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
                        <div className="sm_labelCheckBox">Airport</div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_airportCheckBox" onChange={() => {
                            }} checked={filterTypes.airport} onClick={() => this.changeCheck("airport")}/>
                            <label htmlFor="sm_airportCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox">Train Station</div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_trainStationCheckBox" onChange={() => {
                            }} checked={filterTypes.train_station} onClick={() => this.changeCheck("train_station")}/>
                            <label htmlFor="sm_trainStationCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox">Subway Station</div>
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
                        <div className="sm_labelCheckBox">Pharmacy</div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_pharmacyCheckBox" onChange={() => {
                            }} checked={filterTypes.pharmacy} onClick={() => this.changeCheck("pharmacy")}/>
                            <label htmlFor="sm_pharmacyCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox">Parking</div>
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
                        <div className="sm_labelCheckBox">Tourist Attraction</div>
                        <div className="checkbox-wrapper-19">
                            <input type="checkbox" id="sm_touristAttractionCheckBox" onChange={() => {
                            }} checked={filterTypes.tourist_attraction}
                                   onClick={() => this.changeCheck("tourist_attraction")}/>
                            <label htmlFor="sm_touristAttractionCheckBox" className="check-box"></label>
                        </div>
                    </div>
                    <div className="sm_filterCheckBox">
                        <div className="sm_labelCheckBox">Museum</div>
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
                         onClick={() => this.changeAllCheck(true)}>Check All
                    </div>
                    <div className="sm_buttonRed sm_menuItemInner"
                         onClick={() => this.changeAllCheck(false)}>Uncheck All
                    </div>
                </div>
                <div className="sm_filterRow">
                    <div className="sm_filterCat" >
                        <div onClick={() => this.changeFilterCategory("Entertainment")}>Entertainment</div>
                        {this.state.filterCategory === "Entertainment" && entertainment}
                    </div>
                </div>
                <div className="sm_filterRow">
                    <div className="sm_filterCat">
                        <div onClick={() => this.changeFilterCategory("FoodDrink")} >Food & Drink</div>
                        {this.state.filterCategory === "FoodDrink" && FoodDrink}
                    </div>
                </div>
                <div className="sm_filterRow">
                    <div className="sm_filterCat">
                       <div onClick={() => this.changeFilterCategory("Shopping")}>Shopping</div>
                        {this.state.filterCategory === "Shopping" && Shopping}
                    </div>
                </div>
                <div className="sm_filterRow">
                    <div className="sm_filterCat">
                        <div onClick={() => this.changeFilterCategory("Transportation")} >Transportation</div>
                        {this.state.filterCategory === "Transportation" && Transportation}
                    </div>
                </div>
                <div className="sm_filterRow">
                    <div className="sm_filterCat">
                        <div onClick={() => this.changeFilterCategory("Health")} >Health</div>
                        {this.state.filterCategory === "Health" && Health}
                    </div>
                </div>
                <div className="sm_filterRow">
                    <div className="sm_filterCat" >
                        <div onClick={() => this.changeFilterCategory("Attractions")} >Attractions</div>
                        {this.state.filterCategory === "Attractions" && Attractions}
                    </div>
                </div>
            </div>
        );

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

        if (this.state.currentlyViewedItemIndex === 0 ){
            buttonsOnView =   (<div className="sm_containButtons"><div className="sm_prevNextButtons sm_buttonGrey"  onClick={() => this.changeViewedMarker(1)}>Next</div></div>)
        } else if (this.state.currentlyViewedItemIndex === (this.state.currentMapMarkers.length-1)){
            buttonsOnView = (<div className="sm_containButtons"><div className="sm_prevNextButtons sm_buttonGrey" onClick={() => this.changeViewedMarker(-1)}>Previous</div></div>)
        } else {
            buttonsOnView = (
                <div className="sm_containButtons">
                    <div className="sm_prevNextButtons sm_buttonGrey" onClick={() => this.changeViewedMarker(-1)}>Previous</div>
                    <div className="sm_prevNextButtons sm_buttonGrey" onClick={() => this.changeViewedMarker(1)}>Next</div>
                    </div>
                        )
        }
        let nextPrevButtons = (
                <div className="sm_nextPrevButtonHold">
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
                <div id="sm_googleMap"></div>
            </div>
        );
    }
}

