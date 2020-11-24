import '../App.css';
import React from 'react';
import { useState } from 'react';
import { useSelect, useDispatch } from 'react-redux';
import { Card, Button } from '../../node_modules/react-bootstrap';
import { Link } from '../../node_modules/react-router-dom';
import { ChangeSelectedCount } from './actions/CartActions';
import { SetProductDetails } from './actions/ProductActions';

function CartProduct(props){

    const dispatch = useDispatch();

    const changeProductSelectCount = (event) => {
        let selected_count = event.target.value;
        dispatch(ChangeSelectedCount(props.product.id, props.product.name, props.product.description, props.product.price, selected_count, props.product.count));
        props.history.push('/cart');
    }

    const getCurrentProduct = (current_product) => {
        console.log(current_product.image);
        dispatch(SetProductDetails(current_product.id, 
                                    current_product.name, 
                                    current_product.description, 
                                    current_product.price, 
                                    current_product.selected_count,
                                    current_product.count),
                                    current_product.image);
        
        props.history.push(`/products/${current_product['id']}`);
    }

    const generateCountSelectElements = (product_count) => {
        const options = [];

        for(let i = 1; i <= product_count; i++){
            options.push(<option key={i} value={i}>{i}</option>);
        }

        return options;
    }

    const options = generateCountSelectElements(props.product.count);

    return (
        <Card style={{ width: '50rem', margin: '2em' }}>
            <Card.Body>
                <Card.Img variant="top" src={`/images/${props.product.image}`} alt={`${props.product.name}`} />
                <Card.Title>Name: {props.product.name}</Card.Title>
                <Card.Text> Price: {props.product.price} </Card.Text>
                <Card.Text> Quantity: {props.product.selected_count} </Card.Text>
                
                <select style={{marginRight : '1em'}} name={'selected_count'} value={props.product.selected_count} onChange={changeProductSelectCount}>
                    {options}
                </select>
                
                <Button>
                    <Link style={{'color' : 'white'}} to={`/products/${props.product.id}`} onClick={() => getCurrentProduct(props.product)}>
                        View details
                    </Link>
                </Button>
            </Card.Body>
        </Card>
    );
}

export default CartProduct;