import React from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from "../../Constants"
import "./Map.css";

mapboxgl.accessToken = MAPBOX_TOKEN;

class Map extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lng: 32.859,
            lat: 39.938,
            zoom: 13.99
        };
    }

    componentDidMount() {
        const map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/mapbox/satellite-v9',
            center: [this.state.lng, this.state.lat],
            zoom: this.state.zoom
        });

        map.on('load', function () {
            map.addSource('mapbox://ibrahimsaricicek.9ngn7hoy', {
                "url": "mapbox://ibrahimsaricicek.9ngn7hoy",
                "type": "raster",
                "tileSize": 256
            });
            map.addLayer({
                "id": "ibrahimsaricicek-1924",
                "type": "raster",
                "source": "mapbox://ibrahimsaricicek.9ngn7hoy",
                'minzoom': 0,
                'maxzoom': 22
            });
        });

        map.on('move', () => {
            this.setState({
                lng: map.getCenter().lng.toFixed(4),
                lat: map.getCenter().lat.toFixed(4),
                zoom: map.getZoom().toFixed(2)
            });
        });
    }

    render() {
        return (
            <div>
                <div className='sidebarStyle'>
                    <div>Longitude: {this.state.lng} | Latitude: {this.state.lat} | Zoom: {this.state.zoom}</div>
                </div>
                <div ref={el => this.mapContainer = el} className='mapContainer' />
            </div>
        )
    }
}

export default Map;