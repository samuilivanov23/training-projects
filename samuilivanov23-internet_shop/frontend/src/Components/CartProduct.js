import '../App.css';
import React from 'react';
import { Card, Button } from '../../node_modules/react-bootstrap';
import { Link } from '../../node_modules/react-router-dom';


function CartProduct(props){
    return (
        <Card style={{ width: '50rem', margin: '2em' }}>
            <Card.Body>
                <Card.Title>Name: {props.product.name}</Card.Title>
                
                <Card.Text> Price: {props.product.price} </Card.Text>
                
                <Button>
                    <Link style={{'color' : 'white'}} to={`/products/${props.product.id}`} href="#">
                        View details
                    </Link>
                </Button>
            </Card.Body>
        </Card>
    );
}

export default CartProduct;