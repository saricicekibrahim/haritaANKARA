import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Map from "../Map/Map";
import Home from "../Home";
// import Sidebar from '../Sidebar';
// import Navbar from '../Navbar';

const DefaultContainer = () => (
    <div className="d-flex" id="wrapper">
        {/* <Sidebar /> */}
        <div id="page-content-wrapper">
            {/* <Navbar /> */}
            <Route path="/" exact component={Map} />
            <Route path="/map" exact component={Home} />
        </div>
    </div>
)

const layout = () => (
    <BrowserRouter basename="/haritaankara">
        <Switch>
            {/* <Route path="/" exact component={SignIn} /> */}
            <Route component={DefaultContainer} />
        </Switch>
    </BrowserRouter>
);

export default layout;