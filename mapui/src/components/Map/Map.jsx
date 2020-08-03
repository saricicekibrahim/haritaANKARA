import React from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from "../../Constants"
import "./Map.css";
import { layers, sources } from './Layers';

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

            sources.forEach(source => {
                map.addSource(source, {
                    "url": source,
                    "type": "raster",
                    "tileSize": 256
                });
            });

            layers.forEach(layer => {
                map.addLayer({
                    "id": layer.id,
                    "type": "raster",
                    "source": layer.source,
                    'minzoom': layer.minzoom,
                    'maxzoom': layer.maxzoom
                });
            });


            //map.setLayoutProperty("ibrahimsaricicek-1924", 'visibility', 'none');
            //map.setLayoutProperty("ibrahimsaricicek-42fn4k4w", 'visibility', 'none');

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
                    <div>{this.state.lng} | {this.state.lat} | {this.state.zoom}</div>
                </div>
                <div ref={el => this.mapContainer = el} className='mapContainer' />
            </div>
        )
    }
}

export default Map;