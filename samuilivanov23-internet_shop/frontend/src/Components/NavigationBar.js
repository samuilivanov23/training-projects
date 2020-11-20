import React from 'react';
import { Navbar, Nav } from '../../node_modules/react-bootstrap';

function NavigationBar() {
    
    return (
        <Navbar bg="dark" variant="dark">
            <Navbar.Brand href="#home">Vide Surveillance shop</Navbar.Brand>
            <Nav className="mr-auto">
                <Nav.Link href="/products">Products</Nav.Link>
                <Nav.Link href="#tags">Categories</Nav.Link>
            </Nav>
            <Nav className="ml-auto">
                <Nav.Link href="/register">Register</Nav.Link>
                <Nav.Link href="/login">Login</Nav.Link>
                <Nav.Link href="#cart">Cart</Nav.Link>
            </Nav>
        </Navbar>
    );
}

export default NavigationBar;