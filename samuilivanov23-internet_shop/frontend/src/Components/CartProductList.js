import '../App.css';
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from '../../node_modules/react-router-dom';
import { Card, Container, Row, Col, Button } from '../../node_modules/react-bootstrap';
import CartProduct from './CartProduct';
import JsonRpcClient from '../../node_modules/react-jsonrpc-client/jsonrpcclient';
import { AddOrderData } from './actions/OrderActions';
import { EmptyCart } from './actions/CartActions';

function CartProductList (props) {

    const [total_price, set_total_price] = useState(0);

    const { cartInfo } = useSelector(state=>state.cartProducts);
    console.log('CartProductsList -------');
    console.log(cartInfo);

    const { userInfo } = useSelector(state=>state.signInUser);
    console.log('Userinfo -------');
    console.log(userInfo);

    const dispatch = useDispatch();

    const calculateTotalPrice = () => {
        let total_price = 0;
        
        for(let i = 0; i < cartInfo.length; i++){
            total_price += (cartInfo[i].price * cartInfo[i].selected_count);
        }

        set_total_price(total_price);
    }

    //takse the signed in user cart_id as argument
    const createOrder = (cart_id) => {

        alert('Product pdded to cart');

        var django_rpc = new JsonRpcClient({
            endpoint: 'http://127.0.0.1:8000/shop/rpc/',
        })

        django_rpc.request(
            'CreateOrder',
            cart_id,
            userInfo.id,
            total_price.toFixed(2),
        ).then(function(response){
            response = JSON.parse(response);
            console.log('Create Order res ----');
            console.log(response);
            console.log()

            dispatch(AddOrderData(response['order_data']))
            dispatch(EmptyCart());
            alert(response['msg']);

            props.history.push('/products');
        }).catch(function(error){
            console.log(error['msg']);
        });
    }

    useEffect(() => {
        calculateTotalPrice();
    });

    if(cartInfo.length > 0){
        return(
            <Container fluid>
                <Row>
                    <Col>
                        <Card className={'outer-card'} style={{ width: '55rem', margin: '0.5em' }}>
                            {cartInfo.map((product, idx) => (
                                <CartProduct key={idx} {...props} product={product}/>    
                            ))}
                            <h5 className="ml-auto" style={{'marginRight' : '5em' }}>
                                Total: {total_price.toFixed(2)} BGN.
                            </h5>
                        </Card>
                    </Col>
    
                    <Col>
                        <Card className={'outer-card'} style={{ width: '20em', margin: '1em', padding : '1em' }}>
                            <Card.Header className="text-center outer-card font-weight-bold">
                                Order information
                            </Card.Header>
    
                            <Card.Body>
                                Products price : {total_price.toFixed(2)} BGN.
                                Delivery taxes: 0 BGN.
                            </Card.Body>
    
                            <Card.Footer className="text-center outer-card font-weight-bold">
                                TOTAL: {total_price.toFixed(2)} BGN.
                                <Button>
                                    <Link style={{color:'white'}} onClick={() => createOrder(userInfo.cart_id)}>
                                        Checkout
                                    </Link>
                                </Button>
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }
    else{
        return(
            <div>
                <h1>
                    The cart is empty. Please add some products first.
                </h1>
                <Button>
                    <Link style={{color:'white'}} to={'/products'}>
                        Browse products
                    </Link>
                </Button>
            </div>
        );
    }
}

export default CartProductList;