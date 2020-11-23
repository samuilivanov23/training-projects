import '../App.css';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Button } from '../../node_modules/react-bootstrap';
import CartProduct from './CartProduct';

function CartProductList (props) {

    const { cartInfo } = useSelector(state=>state.cartProducts);
    console.log('CartProductsList -------');
    console.log(cartInfo);

    return(
        <Card style={{ width: '70rem', margin: '0.5em' }}>
            {cartInfo.map(product => (
                <CartProduct key={product.product_id} {...props} product={product}/>    
            ))}
        </Card>
    );
}

export default CartProductList;