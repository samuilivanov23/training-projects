import '../App.css';
import React from 'react';
import { Navbar, Nav } from '../../node_modules/react-bootstrap';
import { Link } from '../../node_modules/react-router-dom';
import { useSelector } from 'react-redux';

function NavigationBar() {
    
    const signInUser = useSelector(state=>state.signInUser);
    const { userInfo } = signInUser;

    const checkUserLoggedIn = () => {
        console.log(userInfo.username);
        if(userInfo.username != 'init'){
            return true;
        }
        else{
            return false;
        }
    }

    const generateLoginLink = () => {
        if(userInfo.username === 'init'){
            return <Link className={'nav-link'} to="/login">Login</Link>;
        }
    }

    const generateCartLink = () => {
        if(userInfo.username !== 'init'){
            const elements = []
            elements.push(<Link key={1} className={'nav-link'} to="/cart">Cart</Link>);
            elements.push(<p key={0} style={{'color' : 'white', 'margin-top' : '0.5em'}}> Hello {userInfo.username} </p>);

            return elements;
        }
    }

    const logInLink = generateLoginLink();
    const cartLink = generateCartLink();

    return (
        <Navbar bg="dark" variant="dark">
            <Navbar.Brand to="/">Vide Surveillance shop</Navbar.Brand>
            <Nav className="mr-auto">
                <Link className={'nav-link'} to="/products">Products</Link>
                <Link className={'nav-link'} to="/tags">Categories</Link>
            </Nav>
            <Nav className="ml-auto">
                <Link className={'nav-link'} to="/register">Register</Link>
                {logInLink}
                {cartLink}
            </Nav>
        </Navbar>
    );
}

export default NavigationBar;