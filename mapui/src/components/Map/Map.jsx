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
            windowWidth: window.innerWidth,
            mapLoaded: false
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

        map.on('load', () => {
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
            this.setState({ mapLoaded: true });
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
        if (event.target.checked) {
            this.zoomToLayer(layers.find(layer => layer.id === event.target.id));
        }
    }

    // Fly to the extent of a layer, unless the user is already looking at it. The extent
    // comes from the tileset's TileJSON, which mapbox-gl has already loaded into the source.
    zoomToLayer = (layer) => {
        const source = map.getSource(layer.source);
        if (!source || !source.bounds) {
            const onSourceData = (e) => {
                if (e.sourceId === layer.source && e.isSourceLoaded) {
                    map.off('sourcedata', onSourceData);
                    this.zoomToLayer(layer);
                }
            };
            map.on('sourcedata', onSourceData);
            return;
        }

        // If the layer covers the middle of the screen, the user may have gone there on purpose,
        // so stay put. A layer is hidden below its minzoom, so zoom in just enough, in place.
        const [west, south, east, north] = source.bounds;
        const { lng, lat } = map.getCenter();
        if (lng >= west && lng <= east && lat >= south && lat <= north) {
            if (map.getZoom() < layer.minzoom) {
                map.easeTo({ zoom: layer.minzoom + 0.1 });
            }
            return;
        }

        // Keep the layer clear of the side panel, unless the panel covers most of the screen (mobile).
        const panel = document.getElementById("mapSidePanel");
        const panelWidth = panel ? panel.offsetWidth : 0;
        const left = panelWidth < map.getContainer().clientWidth / 2 ? panelWidth : 0;
        const bearing = map.getBearing();
        const camera =
            map.cameraForBounds(source.bounds, { bearing, padding: { top: 40, bottom: 60, right: 40, left: left + 40 } }) ||
            map.cameraForBounds(source.bounds, { bearing });
        if (!camera) return;

        map.flyTo({
            center: camera.center,
            // A layer is hidden below its minzoom, so never stop further out than that.
            zoom: Math.max(camera.zoom, layer.minzoom + 0.1),
            bearing,
            pitch: map.getPitch(),
            speed: 1.4
        });
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
                                                <input className="form-check-input" type="checkbox" value="" onClick={this.handleLayer} id={layer.id} disabled={!this.state.mapLoaded} />
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
                                                    disabled={!this.state.mapLoaded}
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