import '../App.css';
import React from 'react';
import {Card, Button } from '../../node_modules/react-bootstrap';
import JsonRpcClient from '../../node_modules/react-jsonrpc-client/jsonrpcclient';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';

function ProductDetails (props) {

    const [in_stock, set_in_stock] = useState('');
    const [selected_count, set_selected_count] = useState(1);

    const signInUser = useSelector(state=>state.signInUser);
    const { userInfo } = signInUser;
    console.log(userInfo);

    console.log(props);

    const checkProductInStock = (product) => {
        if(product['count'] > 0){
            set_in_stock('In stock');
        }
        else{
            set_in_stock('Out of stock');
        }
    }

    useEffect(() => {
        checkProductInStock(props.product);
    });

    const addProductToCart = (product_id, selected_count, product_count) => {
        console.log('In addProduct');
        
        var django_rpc = new JsonRpcClient({
            endpoint: 'http://127.0.0.1:8000/shop/rpc/',
        });

        django_rpc.request(
            "AddProductToCart",
            product_id,
            selected_count,
            product_count,
            userInfo.cart_id,
        ).then(function(response){
            let json_response = JSON.parse(response);
            console.log(json_response);
        }).catch(function(error){
            console.log(error);
        });
    }

    const changeProductSelectCount = (event) => {
        set_selected_count(event.target.value);
    }

    const generateCountSelectElements = (product_count) => {
        const options = [];

        for(let i = 1; i <= product_count; i++){
            options.push(<option key={i} value={i}>{i}</option>);
        }

        return options;
    }

    const options = generateCountSelectElements(props.product['count']);

    return (
        <div>
            <Card style={{ width: '36rem' }}>
                <Card.Body>
                    <Card.Title>Name: {props.product['name']}</Card.Title>
                    <Card.Text>Description: {props.product['description']}</Card.Text>
                    <Card.Text>Price: {props.product['price']} BGN.</Card.Text>
                    <Card.Text>{in_stock}</Card.Text>
                    
                    <select style={{marginRight : '1em'}} name={'selected_count'} value={selected_count} onChange={changeProductSelectCount}>
                        {options}
                    </select>
                    
                    <Button onClick={() => addProductToCart(props.product['id'], selected_count, props.product['count'])}>
                        Add to cart
                    </Button>
                </Card.Body>
            </Card>
        </div>
    );
}

export default ProductDetails;