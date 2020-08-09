import React from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from "../../Constants"
import "./Map.css";
import { layers, sources } from './Layers';

mapboxgl.accessToken = MAPBOX_TOKEN;
let map;

class Map extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lng: 32.859,
            lat: 39.938,
            zoom: 13.99,
            map: null
        };
        //this.handleVisibility = this.handleVisibility.bind(this);
    }

    componentDidMount() {
        map = new mapboxgl.Map({
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
                    'maxzoom': layer.maxzoom,
                    'layout': {
                        'visibility': 'none'
                    }
                });
            }
            );
        });

        map.on('move', () => {
            this.setState({
                lng: map.getCenter().lng.toFixed(4),
                lat: map.getCenter().lat.toFixed(4),
                zoom: map.getZoom().toFixed(2)
            });
        });
    }

    handleLayer = (event) => {
        let visible = "none";
        if (event.target.checked) {
            visible = "visible"
        }
        map.setLayoutProperty(event.target.id, "visibility", visible);
    }

    render() {
        return (
            <div>
                <div className='sidebarStyle'>
                    <h3>Gatmangıller</h3>
                    <div class="form-check">

                        {layers.map(layer => (
                            <div>
                                <input class="form-check-input" type="checkbox" value="" onClick={this.handleLayer} id={layer.id} />
                                <label class="form-check-label" for="exampleRadios1">
                                    {layer.id}
                                </label>
                            </div>
                        ))}
                    </div>

                    <div className="fixed-bottom">{this.state.lng} | {this.state.lat} | {this.state.zoom}</div>
                </div>
                <div ref={el => this.mapContainer = el} className='mapContainer' />
            </div>
        )
    }
}

export default Map;