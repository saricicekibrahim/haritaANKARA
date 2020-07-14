import React from 'react';

class Home extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                Burası New York Amerika!
                <br />
                <a href="/map">Go to map </a>
            </div>
        )
    }
}

export default Home;