import '../App.css';
import React from 'react';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useHistory } from '../../node_modules/react-router-dom';
import JsonRpcClient from '../../node_modules/react-jsonrpc-client/jsonrpcclient';

function Payment(props){

    const {orderInfo} = useSelector(state=>state.orderProducts);
    console.log('OrderInfo -------');
    console.log(orderInfo);

    const [description, set_description] = useState('default');
    const [encoded, set_encoded] = useState('');
    const [checksum, set_checksum] = useState('');
    const history = useHistory();

    const redirectToHome = (event) => {
        setTimeout(function (){
            history.push('/shop/products');
        }, 10);
    };

    const setNewDescription = (event) => {
        set_description(event.target.value);
        setTimeout(function (){
            getOrderData();
        }, 5000);
    };

    const getOrderData = () => {
        console.log('GET ORDER DATA');
        var django_rpc = new JsonRpcClient({
            endpoint : 'http://127.0.0.1:8000/shop/rpc/',
        });

        console.log('order id');
        console.log(orderInfo.id);

        django_rpc.request(
            "PaymentRequestData",
            orderInfo.id,
            orderInfo.total_price,
            description,
        ).then(function(response){
            response = JSON.parse(response);
            set_encoded(response['data']['encoded']);
            set_checksum(response['data']['checksum']);
        }).catch(function(error){
            alert(error['msg'])
        });
    };

    useEffect(() => {
        getOrderData();
    }, []);

    console.log(description);
    console.log(orderInfo.total_price);
    console.log('encoded: ' + encoded);
    console.log('checksum: ' + checksum);

    return (
        <div>
            <form onSubmit={redirectToHome} target="_blank" action="https://demo.epay.bg/" method="POST">
                <input type="hidden" name="PAGE" value="paylogin"/>
                <input required name="DESCR" onChange={setNewDescription} value={description}/>
                <input type="hidden" name="ENCODED" value={encoded}/>
                <input type="hidden" name="CHECKSUM" value={checksum}/>
                <input type="hidden" name="URL_OK" value="https://www.epay.bg/?p=thanks"/>
                <input type="hidden" name="URL_CANCEL" value="https://www.epay.bg/?p=cancel"/>
                <input type="submit" defaultValue="default"/>
            </form>
        </div>
    );
}

export default Payment;