import React from 'react';
import mapboxgl from 'mapbox-gl';
import { MAP_CONSTANTS } from "../../Constants"
import "./Map.css";
import { layers } from './Layers';
import {
    Accordion,
    AccordionItem,
    AccordionItemButton,
    AccordionItemHeading,
    AccordionItemPanel,
} from 'react-accessible-accordion';

import 'react-accessible-accordion/dist/fancy-example.css';

mapboxgl.accessToken = MAP_CONSTANTS.MAPBOX_TOKEN;
let map;

let layersAccordion = [
    { type: MAP_CONSTANTS.MAP_TXT, heading: "Haritalar" },
    { type: MAP_CONSTANTS.PLAN_TXT, heading: "Planlar" },
    { type: MAP_CONSTANTS.AERIAL_TXT, heading: "Hava Fotoğrafları" }
]

class Map extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lng: 32.854386,
            lat: 39.930696,
            zoom: 12.4,
            windowWidth: window.innerWidth
        };
    }

    handleLayerOpacityChange = (layerId, event) => {
        this.setState({ value: event.target.value });
        console.log(event.target.value);
        map.setPaintProperty(
            layerId,
            'raster-opacity',
            parseInt(event.target.value, 10) / 100
        );
    }

    componentDidMount() {
        map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/mapbox/satellite-v9',
            center: [this.state.lng, this.state.lat],
            zoom: this.state.zoom,
            pitch: 40, // pitch in degrees
            bearing: -20, // bearing in degrees
        });

        map.on('load', function () {
            layers.forEach(layer => {
                map.addSource(layer.source, {
                    "url": layer.source,
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

        this.openNav();
    }

    handleLayer = (event) => {
        let visible = "none";
        if (event.target.checked) {
            visible = "visible"
        }
        map.setLayoutProperty(event.target.id, "visibility", visible);
    }

    openNav = () => {
        let sidePanel = document.getElementById("mapSidePanel");
        sidePanel.style.width = "auto";
        sidePanel.style.paddingLeft = "8px";
        sidePanel.style.paddingRight = "8px";
        sidePanel.style.minWidth = "250px";
        document.getElementById("menu").hidden = true;
    }

    closeNav = () => {
        let sidePanel = document.getElementById("mapSidePanel");
        sidePanel.style.width = "0px";
        sidePanel.style.paddingLeft = "0px";
        sidePanel.style.paddingRight = "0px";
        sidePanel.style.minWidth = "0px";
        document.getElementById("menu").hidden = false;
    }

    render() {
        return (
            <div>
                <div id="mapSidePanel" className='sidePanel' >
                    <a href="#" class="closebtn" onClick={this.closeNav}>×</a>
                    <h4>Katmanlar</h4>
                    <Accordion allowZeroExpanded>
                        {layersAccordion.map((item) => (
                            <AccordionItem key={item.type}>
                                <AccordionItemHeading>
                                    <AccordionItemButton>
                                        {item.heading}
                                    </AccordionItemButton>
                                </AccordionItemHeading>
                                <AccordionItemPanel>
                                    <div className="form-check">
                                        {layers.filter(layers => layers.type === item.type).map(layer => (
                                            <div>
                                                <input className="form-check-input" type="checkbox" value="" onClick={this.handleLayer} id={layer.id} />
                                                <label className="form-check-label" for={layer.id}>
                                                    {layer.displayName}
                                                </label>
                                                <br />
                                                <input className="slider"
                                                    id={"slider-" + layer.id}
                                                    type="range"
                                                    min="0" max="100"
                                                    onChange={(e) => this.handleLayerOpacityChange(layer.id, e)}
                                                    step="1"
                                                    defaultValue="100" />
                                            </div>
                                        ))}
                                    </div>
                                </AccordionItemPanel>
                            </AccordionItem>
                        ))}
                    </Accordion>

                </div>
                <nav id="menu" onClick={this.openNav}>
                    <a href="#">☰</a>
                </nav>
                <div ref={el => this.mapContainer = el} className='mapContainer' />
                <div className="footer fixed-bottom">
                    <a href="https://www.linkedin.com/in/ibrahimsaricicek/" className="btn btn-dark btn-sm" target="_blank">Kim Yaptı?</a>
                    |
                    <a href="https://github.com/saricicekibrahim/haritaANKARA" className="btn btn-dark btn-sm" target="_blank">Bu Nedir?</a>
                </div>
            </div >
        )
    }
}

export default Map;