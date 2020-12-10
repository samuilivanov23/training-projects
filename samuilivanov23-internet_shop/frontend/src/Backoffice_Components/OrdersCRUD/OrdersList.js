import '../../App.css';
import React from 'react';
import JsonRpcClient from 'react-jsonrpc-client';
import { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import { SetOrderToUpdateDetails } from '../../Components/actions/OrderActions';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

function OrdersList (props){

    const [orders, set_orders] = useState([]);
    const { employeeInfo } = useSelector(state=>state.employee);
    const dispatch = useDispatch();

    useEffect(() => {
        loadOrders();
    }, [])

    const loadOrders = () => {
        const django_rpc = new JsonRpcClient({
            endpoint : 'http://127.0.0.1:8000/backoffice/rpc/',
        });

        django_rpc.request(
            'GetOrders',
        ).then(function(response){
            response = JSON.parse(response);
            set_orders(response['orders']);
            console.log(response);
            alert(response['msg']);
        }).catch(function(error){
            alert(error['msg']);
        });
    }

    const getCurrentorder = (current_order) => {
        // dispatch(SetOrderToUpdateDetails(
        //     current_order['first_name'],
        //     current_order['last_name'],
        //     current_order['email_address'],
        //     current_order['role_name'],
        //     permission_dict,
        // ));
    }

    const deleteorder = (id) => {
        // const django_rpc = new JsonRpcClient({
        //     endpoint : 'http://127.0.0.1:8000/backoffice/rpc/',
        // });

        // django_rpc.request(
        //     'Deleteorder',
        //     id,
        // ).then(function(response){
        //     response = JSON.parse(response);
        //     alert(response['msg']);
        //     loadOrders();
        // }).catch(function(error){
        //     alert(error['msg']);
        // });
    }

    if(typeof(orders) === 'undefined'){
        return(
            <div>Loading...</div>
        );
    }    
    else{
        return(
            <div className={"App"} style={{display : 'flex', flexDirection : 'row', flex : 1, flexWrap : 'wrap'}}>
                {orders.map((order, idx) => (
                    <Card key={idx} className={'employee-card'}>
                        <Card.Body>
                            <div style={{display : 'flex', flexDirection : 'row', flex : 1, flexWrap : 'wrap'}}>
                                <Card.Title style={{marginRight:'1em'}}> Created: { order['order_date'] }</Card.Title>
                                <Card.Text> by: { order['user_first_name'] } { order['user_last_name'] } </Card.Text>
                                <Card.Text style={{marginRight:'1em', marginLeft:'1em'}}> Price: { order['total_price'] } </Card.Text>
                                <Card.Text> Paid on: { order['payment_date'] } Status: { order['payment_status'] }</Card.Text>

                                {(employeeInfo.permissions.update_perm) 
                                ?   <Button variant="light" className={'crud-buttons-style ml-auto'}>
                                        <Link style={{color:'white'}} to={`/backoffice/orders/update/${order['id']}`} onClick={() => getCurrentorder(order)}>
                                            <img 
                                            src='https://p7.hiclipart.com/preview/9/467/583/computer-icons-tango-desktop-project-download-clip-art-update-button.jpg'
                                            alt="Update order"
                                            className={'image-btnstyle'}
                                            />
                                        </Link>
                                    </Button>
                                : null
                                }

                                {(employeeInfo.permissions.delete_perm)
                                    ?   <Button variant="light" className={'crud-buttons-style'} onClick={() => deleteorder(order['id'])}>
                                            <img 
                                                src='https://icon-library.com/images/delete-icon-png/delete-icon-png-4.jpg'
                                                alt="Delete"
                                                className={'image-btnstyle'}
                                                />
                                        </Button>
                                    : null
                                }
                            </div> 
                        </Card.Body>
                    </Card>
                ))}
            </div>
        );
    }
}

export default OrdersList;