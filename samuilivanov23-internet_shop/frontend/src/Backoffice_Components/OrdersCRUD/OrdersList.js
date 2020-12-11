import '../../App.css';
import React from 'react';
import JsonRpcClient from 'react-jsonrpc-client';
import { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import { SetOrderToUpdateDetails } from '../../Components/actions/OrderActions';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import Table from '@material-ui/core/Table';
import { makeStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

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

    const getCurrentOrder = (current_order) => {
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

   
    const useStyles = makeStyles({
        table: {
            minWidth: 650,
        },
    });

    const classes = useStyles();
    
    const createData = (order_id, order_date, customer_name, order_price, payment_date, payment_status) => {
        return { order_id, order_date, customer_name, order_price, payment_date, payment_status };
    }
    
    const generateRows = () => {
        const rows = []
    
        orders.forEach(order => {
            rows.push(createData(order['id'], order['order_date'], order['user_first_name'] + ' ' + order['user_last_name'], order['total_price'], order['payment_date'], order['payment_status']))
        });
    
        return rows;
    }
      
    const rows = generateRows();

    if(typeof(orders) === 'undefined'){
        return(
            <div>Loading...</div>
        );
    }    
    else{
        return(
            <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Created</TableCell>
                            <TableCell align="right">Customer</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="right">Paid on</TableCell>
                            <TableCell align="right">Payment status</TableCell>
                            <TableCell align="right"> </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, idx) => (
                            <TableRow key={idx}>
                                <TableCell component="th" scope="row">{row.order_date}</TableCell>
                                <TableCell align="right">{row.customer_name}</TableCell>
                                <TableCell align="right">{row.order_price}</TableCell>
                                <TableCell align="right">{row.payment_date}</TableCell>
                                <TableCell align="right">{row.payment_status}</TableCell>
                                <TableCell align="right">
                                    {(employeeInfo.permissions.update_perm) 
                                    ?   <Button variant="light" className={'crud-buttons-style ml-auto'}>
                                            <Link style={{color:'white'}} to={`/backoffice/orders/update/${row.order_id}`} onClick={() => getCurrentOrder(row)}>
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
                                        ?   <Button variant="light" onClick={() => deleteorder(row.order_id)}>
                                                <img 
                                                src='https://icon-library.com/images/delete-icon-png/delete-icon-png-4.jpg'
                                                alt="Delete order"
                                                className={'image-btnstyle'}
                                                />
                                            </Button>
                                        : null
                                    }
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }
}

export default OrdersList;