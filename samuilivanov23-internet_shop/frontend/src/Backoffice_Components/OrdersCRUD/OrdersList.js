import '../../App.css';
import React from 'react';
import JsonRpcClient from 'react-jsonrpc-client';
import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { SetOrderToUpdateDetails } from '../../Components/actions/OrderActions';
import ReactPaginate from '../../../node_modules/react-paginate'
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
    const [selected_sorting, set_selected_sorting] = useState('Sort by order_id asc');
    const [pages_count, set_pages_count] = useState(0);
    const [current_page, set_current_page] = useState(0);
    const [sorting_label, set_sorting_label] = useState('order id asc');
    const { employeeInfo } = useSelector(state=>state.employee);
    const dispatch = useDispatch();

    useEffect(() => {
        loadOrders(current_page, selected_sorting);
    }, [])

    const loadOrders = (current_page, selected_sorting) => {
        const django_rpc = new JsonRpcClient({
            endpoint : 'http://127.0.0.1:8000/backoffice/rpc/',
        });

        django_rpc.request(
            'GetOrders',
            selected_sorting,
            current_page,
        ).then(function(response){
            response = JSON.parse(response);
            console.log(response);
            set_orders(response['orders']);
            set_pages_count(response['pages_count']);
            set_selected_sorting(selected_sorting);

            let ordering_param = selected_sorting.split(" ")[2];
            let ordering_direction = selected_sorting.split(" ")[3];            
            ordering_param = ordering_param.split("_");
            
            set_sorting_label('Ordered by: ' + ordering_param[0] + " " + ordering_param[1] + " " + ordering_direction);

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
        const django_rpc = new JsonRpcClient({
            endpoint : 'http://127.0.0.1:8000/backoffice/rpc/',
        });

        django_rpc.request(
            'DeleteOrder',
            id,
        ).then(function(response){
            response = JSON.parse(response);
            alert(response['msg']);
            loadOrders(current_page, selected_sorting);
        }).catch(function(error){
            alert(error['msg']);
        });
    }

    const FilterProducts = (event) => {
        const filter = event.target.value;
        loadOrders(current_page, filter);
    }

    const handlePageClick = (orders) => {
        let page_number = orders.selected;
        console.log(page_number, selected_sorting);
        loadOrders(page_number, selected_sorting);
        set_current_page(page_number);
        window.scrollTo(0, 0);
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
    
    if(typeof(orders) === 'undefined'){
        return(
            <div>Loading...</div>
        );
    }
    else{
        const rows = generateRows();

        return(
            <div>
                <div>
                    <h5 style={{textAlign : 'center'}}>{sorting_label}</h5>
                </div>
                
                <div>
                    <TableContainer component={Paper}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">
                                        Id
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={FilterProducts}>
                                            <option key={1} value={'Sort by order_id asc'}>↗</option>
                                            <option key={2} value={'Sort by order_id desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">
                                        Created
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={FilterProducts}>
                                            <option key={1} value={'Sort by order_date asc'}>↗</option>
                                            <option key={2} value={'Sort by order_date desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">
                                        Customer
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={FilterProducts}>
                                            <option key={1} value={'Sort by customer_name asc'}>↗</option>
                                            <option key={2} value={'Sort by customer_name desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">
                                        Price [BGN]
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={FilterProducts}>
                                            <option key={1} value={'Sort by order_total_price asc'}>↗</option>
                                            <option key={2} value={'Sort by order_total_price desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">
                                        Paid on
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={FilterProducts}>
                                            <option key={1} value={'Sort by order_payment_date asc'}>↗</option>
                                            <option key={2} value={'Sort by order_payment_date desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">Payment status</TableCell>
                                    <TableCell align="center"> </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell component="th" scope="row" align="center">{row.order_id}</TableCell>
                                        <TableCell align="center">{row.order_date}</TableCell>
                                        <TableCell align="center">{row.customer_name}</TableCell>
                                        <TableCell align="center">{row.order_price}</TableCell>
                                        <TableCell align="center">{row.payment_date}</TableCell>
                                        <TableCell align="center">{row.payment_status}</TableCell>
                                        <TableCell align="center">
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
                </div>
                
                <div>
                    <ReactPaginate
                        previousLabel={'← Previous'}
                        nextLabel={'Next →'}
                        pageCount={pages_count}
                        pageRangeDisplayed={ (pages_count > 5) ? 5 : pages_count}
                        onPageChange={handlePageClick}
                        breakClassName={'page-item'}
                        breakLinkClassName={'page-link'}
                        containerClassName={'pagination'}
                        pageClassName={'page-item'}
                        pageLinkClassName={'page-link'}
                        previousClassName={'page-item'}
                        previousLinkClassName={'page-link'}
                        nextClassName={'page-item'}
                        nextLinkClassName={'page-link'}
                        activeClassName={'active'}
                    />
                </div>
            </div>
        );
    }
}

export default OrdersList;