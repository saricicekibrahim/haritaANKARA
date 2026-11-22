import React from 'react';
import mapboxgl from 'mapbox-gl';
import { MAP_CONSTANTS } from "../../Constants"
import 'mapbox-gl/dist/mapbox-gl.css';
import "./Map.css";
import { layers } from './Layers';
import About from '../About/About';
import {
    Accordion,
    AccordionItem,
    AccordionItemButton,
    AccordionItemHeading,
    AccordionItemPanel,
} from 'react-accessible-accordion';

mapboxgl.accessToken = MAP_CONSTANTS.MAPBOX_TOKEN;
let map;

let layersAccordion = [
    { type: MAP_CONSTANTS.MAP_TXT, heading: "Haritalar" },
    { type: MAP_CONSTANTS.PLAN_TXT, heading: "Planlar" },
    { type: MAP_CONSTANTS.AERIAL_TXT, heading: "Hava Fotoğrafları" }
]

// Below this width the side panel would cover most of the map, so it starts closed.
const NARROW_SCREEN = 768;

class Map extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mapLoaded: false,
            panelOpen: window.innerWidth >= NARROW_SCREEN,
            aboutOpen: false,
            visible: {},
            opacity: {}
        };
    }

    componentDidMount() {
        map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/mapbox/satellite-v9',
            center: [32.854386, 39.930696],
            zoom: 12.4,
            pitch: 40, // pitch in degrees
            bearing: -20, // bearing in degrees
            // The credit sits with the other map credits in the bottom-right corner.
            customAttribution: '<a href="https://www.linkedin.com/in/ibrahimsaricicek/" target="_blank" rel="noopener noreferrer">Harita Ankara: İbrahim Sarıçiçek</a>'
        });

        map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
        map.addControl(new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true } }), 'top-right');
        // Full screen takes the side panel along with the map.
        map.addControl(new mapboxgl.FullscreenControl({ container: this.appContainer }), 'top-right');
        map.addControl(new mapboxgl.ScaleControl(), 'bottom-right');

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
    }

    handleLayer = (layer, event) => {
        const checked = event.target.checked;
        map.setLayoutProperty(layer.id, "visibility", checked ? "visible" : "none");
        this.setState(state => ({ visible: { ...state.visible, [layer.id]: checked } }));
        if (checked) {
            this.zoomToLayer(layer);
        }
    }

    handleLayerOpacityChange = (layer, event) => {
        const value = parseInt(event.target.value, 10);
        map.setPaintProperty(layer.id, 'raster-opacity', value / 100);
        this.setState(state => ({ opacity: { ...state.opacity, [layer.id]: value } }));
    }

    // Fly to the extent of a layer. The extent comes from the tileset's TileJSON,
    // which mapbox-gl has already loaded into the source.
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

        // Keep the layer clear of the side panel, unless the panel covers most of the screen (mobile).
        const panel = document.getElementById("mapSidePanel");
        const panelRight = panel && this.state.panelOpen ? panel.getBoundingClientRect().right : 0;
        const left = panelRight < map.getContainer().clientWidth / 2 ? panelRight : 0;
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

    setPanelOpen = (panelOpen) => {
        this.setState({ panelOpen });
    }

    setAboutOpen = (aboutOpen) => {
        this.setState({ aboutOpen });
    }

    render() {
        const { mapLoaded, panelOpen, aboutOpen, visible, opacity } = this.state;

        return (
            <div className="mapApp" ref={el => this.appContainer = el}>
                <aside id="mapSidePanel" className={panelOpen ? 'sidePanel' : 'sidePanel closed'} aria-label="Katmanlar">
                    <header className="sidePanel-header">
                        <div>
                            <h1 className="sidePanel-title">Harita Ankara</h1>
                            <p className="sidePanel-subtitle">
                                Ankara'nın eski haritaları, planları ve hava fotoğrafları.{' '}
                                <button type="button" className="linkButton" onClick={() => this.setAboutOpen(true)}>Bu nedir?</button>
                            </p>
                        </div>
                        <button type="button" className="iconButton" onClick={() => this.setPanelOpen(false)} aria-label="Paneli kapat">×</button>
                    </header>

                    <div className="sidePanel-body">
                        <Accordion allowZeroExpanded>
                            {layersAccordion.map((item) => {
                                const groupLayers = layers.filter(layer => layer.type === item.type);
                                const openCount = groupLayers.filter(layer => visible[layer.id]).length;
                                return (
                                    <AccordionItem key={item.type}>
                                        <AccordionItemHeading>
                                            <AccordionItemButton>
                                                {item.heading}
                                                {openCount > 0 && <span className="countBadge" aria-label={`${openCount} katman açık`}>{openCount}</span>}
                                            </AccordionItemButton>
                                        </AccordionItemHeading>
                                        <AccordionItemPanel>
                                            <ul className="layerList">
                                                {groupLayers.map(layer => {
                                                    const isOpen = !!visible[layer.id];
                                                    const value = opacity[layer.id] === undefined ? 100 : opacity[layer.id];
                                                    return (
                                                        <li key={layer.id} className={isOpen ? 'layerItem active' : 'layerItem'}>
                                                            <label className="layerToggle">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isOpen}
                                                                    onChange={(e) => this.handleLayer(layer, e)}
                                                                    disabled={!mapLoaded} />
                                                                <span>{layer.displayName}</span>
                                                            </label>
                                                            {isOpen && (
                                                                <div className="opacityRow">
                                                                    <input
                                                                        className="slider"
                                                                        type="range"
                                                                        min="0" max="100" step="1"
                                                                        value={value}
                                                                        onChange={(e) => this.handleLayerOpacityChange(layer, e)}
                                                                        aria-label={`${layer.displayName} opaklığı`} />
                                                                    <span className="opacityValue">%{value}</span>
                                                                </div>
                                                            )}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </AccordionItemPanel>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    </div>
                </aside>

                {!panelOpen && (
                    <button type="button" className="menuButton" onClick={() => this.setPanelOpen(true)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M12 3 2 8l10 5 10-5-10-5z" />
                            <path d="m2 13 10 5 10-5" />
                        </svg>
                        Katmanlar
                    </button>
                )}

                <div ref={el => this.mapContainer = el} className='mapContainer' />

                <About open={aboutOpen} onClose={() => this.setAboutOpen(false)} />
            </div>
        )
    }
}

export default Map;