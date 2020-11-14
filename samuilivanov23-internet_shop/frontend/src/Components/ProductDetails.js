import '../App.css';
import React from 'react';
import {Card, Button } from '../../node_modules/react-bootstrap';
import PropTypes from '../../node_modules/prop-types';
import {BrowserRouter as Router, Switch, Route, Link} from '../../node_modules/react-router-dom'

class ProductDetails extends React.Component {

    static propTypes = {
        product: PropTypes.object.isRequired,
    };

    render(){
        return (
            <div>
                <Card style={{ width: '36rem' }}>
                    <Card.Body>
                        <Card.Title>Name: {this.props.product['name']}</Card.Title>
                        <Card.Text>Description: {this.props.product['description']}</Card.Text>
                        <Card.Text>Price: {this.props.product['price']} lv.</Card.Text>
                        <Card.Text>In stock: //TODO</Card.Text>
                    </Card.Body>
                </Card>            
            </div>
        );
    }
}

export default ProductDetails;