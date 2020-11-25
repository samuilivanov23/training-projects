import '../App.css';
import React from 'react';
import JsonRpcClient from '../../node_modules/react-jsonrpc-client/jsonrpcclient';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Row, Col, Container } from '../../node_modules/react-bootstrap';
import { Link } from '../../node_modules/react-router-dom';
import { ChangeSelectedCount } from './actions/CartActions';
import { SetProductDetails } from './actions/ProductActions';

function CartProduct(props){

    const { userInfo } = useSelector(state=>state.signInUser);
    const dispatch = useDispatch();

    const changeProductSelectCount = (event) => {
        let selected_count = event.target.value;

        var django_rpc = new JsonRpcClient({
            endpoint : 'http://127.0.0.1:8000/shop/rpc/',
        });

        django_rpc.request(
            'ChangeProductSelectedCount',
            props.product_id,
            userInfo.cart_id,
            selected_count,
        ).then(function(response){
            response = JSON.parse(response);
            alert(response['msg']);
        }).catch(function(error){
            alert(error['msg']);
        });

        dispatch(ChangeSelectedCount(props.product.id, 
                                        props.product.name, 
                                        props.product.description,
                                        props.product.price,
                                        selected_count,
                                        props.product.count,
                                        props.product.image));
        props.history.push('/cart');
    }

    const getCurrentProduct = (current_product) => {
        dispatch(SetProductDetails(props.product.id, 
                                    props.product.name, 
                                    props.product.description, 
                                    props.product.price, 
                                    props.product.selected_count,
                                    props.product.count,
                                    props.product.image));
        
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
        <Card style={{ width: '50rem', margin: '1em' }}>
            <Container style={{ width: '50rem', margin: '1em' }}>
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
                        <div style={{'display': 'inline-block', 'width' : '7em'}}>
                            <select id="selectedCount" name={'selected_count'} value={props.product.selected_count} onChange={changeProductSelectCount}>
                                {options}
                            </select>
                            <label for="selectedCount">Quantity</label>
                        </div>
                    </Col>

                    <Col>
                        <p style={{'marginRight' : '1em', 'width' : '12em'}}>Total price: {(props.product.selected_count*props.product.price).toFixed(2)} BGN.</p>
                    </Col>
                </Row>
            </Container>
        </Card>
    );
}

export default CartProduct;