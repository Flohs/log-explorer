import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {NavSearch, NavNotification, NavMenu, NavMessage} from '.';

class Navbar extends Component {
    render() {
        return (
            <nav className="main-header navbar navbar-expand navbar-white navbar-light">
                <NavMenu/>

                <NavSearch/>

                <ul className="navbar-nav ml-auto">
                    <NavMessage total={3}/>
                    <NavNotification total={15}/>
                </ul>
            </nav>
        );
    }
}

ReactDOM.render(<Navbar/>, document.querySelector('#navbar'));
