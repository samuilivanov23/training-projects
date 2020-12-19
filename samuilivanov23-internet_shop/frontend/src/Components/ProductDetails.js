import '../App.css';
import React from 'react';
import { Card, Button } from '../../node_modules/react-bootstrap';
import JsonRpcClient from '../../node_modules/react-jsonrpc-client/jsonrpcclient';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { Link } from '../../node_modules/react-router-dom';
import { AddProductToCart } from './actions/CartActions';
import { SetSelectedCount } from './actions/ProductActions';

function ProductDetails (props) {

    const [in_stock, set_in_stock] = useState('');
    const { userInfo } = useSelector(state=>state.signInUser);
    const { productInfo } = useSelector(state=>state.productDetails);
    const dispatch = useDispatch();

    const checkProductInStock = () => {
        if(productInfo.count > 0){
            set_in_stock('In stock');
        }
        else{
            set_in_stock('Out of stock');
        }
    }

    useEffect(() => {
        checkProductInStock();
    });

    const addProductToCart = (product_id, selected_count, product_count) => {        
        var django_rpc = new JsonRpcClient({
            endpoint: 'http://127.0.0.1:8000/shop/rpc/',
        });

        if(typeof selected_count === 'undefined'){
            selected_count = 1;
        }

        console.log(typeof selected_count);

        django_rpc.request(
            "AddProductToCart",
            product_id,
            selected_count,
            product_count,
            userInfo.cart_id,
        ).then(function(response){
            console.log(response);

            if(response.msg === 'Successful'){
                dispatch(AddProductToCart(product_id,
                                            response.product_to_add.name,
                                            response.product_to_add.description,
                                            response.product_to_add.price,
                                            selected_count,
                                            product_count,
                                            response.product_to_add.image));
            }

            alert(response.msg);
        }).catch(function(error){
            console.log(error);
        });
    }

    const changeProductSelectCount = (event) => {
        dispatch(SetSelectedCount(event.target.value));
    }

    const generateCountSelectElements = (product_count) => {
        const options = [];

        for(let i = 1; i <= product_count; i++){
            options.push(<option key={i} value={i}>{i}</option>);
        }

        return options;
    }

    const options = generateCountSelectElements(productInfo.count);

    if(productInfo.count > 0){
        return (

            <div>
                <Card className={"product-details-card"}>
                    <Card.Img style={{width : '80%', height : '50%', marginLeft : '10%', marginTop : '5%'}} variant="top" src={`/images/${productInfo.image}`} alt={`${productInfo.name}`}/>
                    <Card.Body>
                        <Card.Title>Name: {productInfo.name}</Card.Title>
                        <Card.Text>Description: {productInfo.description}</Card.Text>
                        <Card.Text>Price: {productInfo.price} BGN.</Card.Text>
                        <Card.Text>{in_stock}</Card.Text>
                        
                        <select style={{marginRight : '1em'}} name={'selected_count'} value={productInfo.selected_count} onChange={changeProductSelectCount}>
                            {options}
                        </select>
                        
                        <Button onClick={() => addProductToCart(productInfo.id, productInfo.selected_count, productInfo.count)}>
                            Add to cart
                        </Button>
    
                        <Button style={{'float' : 'right'}}>
                            <Link style={{color:'white'}} to={'/shop/products'}>
                                Browse products
                            </Link>
                        </Button>
                    </Card.Body>
                </Card>
            </div>
        );
    }
    else{
        return(
            <div>
                <Card className={"product-details-card"}>
                    <Card.Img variant="top" src={`/images/${productInfo.image}`} alt={`${productInfo.name}`}/>
                    <Card.Body>
                        <Card.Title>Name: {productInfo.name}</Card.Title>
                        <Card.Text>Description: {productInfo.description}</Card.Text>
                        <Card.Text>Price: {productInfo.price} BGN.</Card.Text>
                        <Card.Text>{in_stock}</Card.Text>

                        <Button style={{'float' : 'right'}}>
                            <Link style={{color:'white'}} to={'/shop/products'}>
                                Browse products
                            </Link>
                        </Button>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}

export default ProductDetails;