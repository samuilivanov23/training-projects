import '../../App.css';
import React from 'react';
import JsonRpcClient from 'react-jsonrpc-client';
import { Card, Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from '../../../node_modules/react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { EmptyCart } from '../../Components/actions/CartActions';
import CartProductBackoffice from './CartProductBackoffice';


function CreateOrder(props){

    const [total_price, set_total_price] = useState(0);
    const { cartInfo } = useSelector(state=>state.cartProducts);
    const { userBackofficeInfo } = useSelector(state=>state.userBackoffice);
    const { employeeInfo } = useSelector(state=>state.employee);
    const dispatch = useDispatch();

    const calculateTotalPrice = () => {
        let total_price = 0;
        
        for(let i = 0; i < cartInfo.length; i++){
            total_price += (cartInfo[i].price * cartInfo[i].selected_count);
        }

        set_total_price(total_price);
    }
    
    const createOrder = (user_id, products, employee_id) => {
        const django_rpc = new JsonRpcClient({
            endpoint: 'http://127.0.0.1:8000/shop/rpc/',
        });

        django_rpc.request(
            'CreateOrderBackoffice',
            products,
            user_id,
            employee_id,
        ).then(function(response){
            response = JSON.parse(response);

            dispatch(EmptyCart());
            alert(response['msg']);
        }).catch(function (error){
            alert(error['msg']);
        });
    };

    useEffect(() => {
        calculateTotalPrice();
    });

    return (
        <div>
            <div>
                <h1>Create order</h1>
            </div>

            <Container fluid>
                <Row>
                    <Col>
                        <h3>This order will be assigned to: {userBackofficeInfo.id}</h3>
                    </Col>        
                </Row>

                <Row>
                    <Col>
                        <Card className={'outer-card'} style={{ width: '65rem', margin: '0.5em' }}>
                            {cartInfo.map((product, idx) => (
                                <CartProductBackoffice key={idx} {...props} product={product}/>    
                            ))}
                            <h5 className="ml-auto" style={{'marginRight' : '5em' }}>
                                ORDER TOTAL: {total_price.toFixed(2)} BGN.
                            </h5>
                        </Card>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <Button style={{marginLeft : '2em'}}>
                            <Link style={{color:'white'}} to={'/backoffice/orders/products'}>
                                Browse products
                            </Link>
                        </Button>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <Button style={{marginLeft : '2em'}}>
                            <Link style={{color:'white'}} to={'/backoffice/orders'} onClick={() => createOrder(userBackofficeInfo.id, cartInfo, employeeInfo.id)}>
                                Create order
                            </Link>
                        </Button>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default CreateOrder;