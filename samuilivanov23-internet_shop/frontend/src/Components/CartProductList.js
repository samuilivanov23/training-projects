import '../App.css';
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card } from '../../node_modules/react-bootstrap';
import CartProduct from './CartProduct';

function CartProductList (props) {

    const [total_price, set_total_price] = useState(0);

    const { cartInfo } = useSelector(state=>state.cartProducts);
    console.log('CartProductsList -------');
    console.log(cartInfo);

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

    return(
        <Card className={'outer-card'} style={{ width: '70rem', margin: '0.5em' }}>
            {cartInfo.map((product, idx) => (
                <CartProduct key={idx} {...props} product={product}/>    
            ))}
            <h5 className="ml-auto" style={{'marginRight' : '5em' }}>
                Total: {total_price.toFixed(2)}
            </h5>
        </Card>
    );
}

export default CartProductList;