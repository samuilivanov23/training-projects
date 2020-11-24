import '../App.css';
import React from 'react';
import { useState } from 'react';
import { useSelect, useDispatch } from 'react-redux';
import { Card, Button, Row, Col, Container } from '../../node_modules/react-bootstrap';
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
        <Card style={{ width: '60rem', margin: '1em' }}>
            <Container style={{ width: '60rem', margin: '1em' }}>
                <Row>
                    <Col>
                        <Card.Img variant="left" src={`/images/${props.product.image}`} alt={`${props.product.name}`} />
                    </Col>
                    
                    <Col>
                        <Card.Title>
                            <Link style={{'textDecoration' : 'none', 'color' : 'black'}} to={`/products/${props.product.id}`} onClick={() => getCurrentProduct(props.product)}>
                                {props.product.name}
                            </Link>
                        </Card.Title>
                    </Col>

                    <Col>
                        <div>
                            <select className="ml-auto" style={{'marginRight' : '5em' }} name={'selected_count'} value={props.product.selected_count} onChange={changeProductSelectCount}>
                                {options}
                            </select>
                            <p>Quantity</p>
                        </div>
                    </Col>

                    <Col>
                        <p>Total product price: {(props.product.selected_count*props.product.price).toFixed(2)} BGN.</p>
                    </Col>
                </Row>
            </Container>
        </Card>
    );
}

export default CartProduct;