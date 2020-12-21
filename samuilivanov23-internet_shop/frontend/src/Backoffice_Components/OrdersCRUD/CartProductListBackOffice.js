import '../../App.css';
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from '../../../node_modules/react-router-dom';
import { Card, Container, Row, Col, Button } from 'react-bootstrap';
import CartProductBackoffice from './CartProduct';

function CartProductListBackoffice (props) {

    const [total_price, set_total_price] = useState(0);
    const { cartInfo } = useSelector(state=>state.cartProducts);

    const calculateTotalPrice = () => {
        let total_price = 0;
        
        for(let i = 0; i < cartInfo.length; i++){
            total_price += (cartInfo[i].price * cartInfo[i].selected_count);
        }

        set_total_price(total_price);
    }

    useEffect(() => {
        calculateTotalPrice();
    });

    if(cartInfo.length > 0){
        return(
            <Container fluid>
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
                                ORDER TOTAL: {total_price.toFixed(2)} BGN.
                                    <Button>
                                        <Link style={{color:'white'}} to={'/backoffice/orders/choose-customer'}>
                                            Assign customer
                                        </Link>
                                    </Button>
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>

                <Row>
                    <Button style={{marginLeft : '2em'}}>
                        <Link style={{color:'white'}} to={'/backoffice/orders/products'}>
                            Browse products
                        </Link>
                    </Button>
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
                    <Link style={{color:'white'}} to={'/backoffice/orders/products'}>
                        Browse products
                    </Link>
                </Button>
            </div>
        );
    }
}

export default CartProductListBackoffice;