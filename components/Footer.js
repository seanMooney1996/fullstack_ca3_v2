import React from "react";

export default class GMap extends React.Component {
    constructor(props) {

        super(props);

        this.infoWindow = null;
    }

    render() {
        return (
            <div className="sm_mapHoldFull">
                <div className="sm_navigation"></div>
                <div id="sm_googleMap"></div>
            </div>
        );
    }
}
