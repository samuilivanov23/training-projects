import '../../App.css';
import React from 'react';
import JsonRpcClient from 'react-jsonrpc-client';
import { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
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
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import DatePicker from 'react-date-picker';

function OrdersList (props){

    const [validated, setValidated] = useState(false);
    const [orders, set_orders] = useState([]);
    const [selected_sorting, set_selected_sorting] = useState('Sort by order_id asc');
    const [pages_count, set_pages_count] = useState(0);
    const [current_page, set_current_page] = useState(0);
    const [sorting_label, set_sorting_label] = useState('order id asc');
    const [start_order_date, set_start_order_date] = useState(null);
    const [end_order_date, set_end_order_date] = useState(null);
    const [start_payment_date, set_start_payment_date] = useState(null);
    const [end_payment_date, set_end_payment_date] = useState(null);
    const [price_slider, set_price_slider] = useState([])
    const [max_price, set_max_price] = useState(0);
    const { employeeInfo } = useSelector(state=>state.employee);
    const dispatch = useDispatch();

    useEffect(() => {
        loadOrders(current_page, selected_sorting, []);
    }, [])

    const loadOrders = (current_page, selected_sorting, filtering_params) => {
        const django_rpc = new JsonRpcClient({
            endpoint : 'http://127.0.0.1:8000/backoffice/rpc/',
        });

        django_rpc.request(
            'GetOrders',
            selected_sorting,
            current_page,
            filtering_params,
        ).then(function(response){
            response = JSON.parse(response);
            console.log(response);
            set_orders(response['orders']);
            set_pages_count(response['pages_count']);
            set_selected_sorting(selected_sorting);
            set_price_slider([0, response['max_price']]);
            set_max_price(response['max_price'])

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
            loadOrders(current_page, selected_sorting, []);
        }).catch(function(error){
            alert(error['msg']);
        });
    }

    const sortProducts = (event) => {
        const filter = event.target.value;
        loadOrders(current_page, filter, []);
    }

    const handlePriceSliderChange = (event, newValie) => {
        set_price_slider(newValie);
    }

    const handleStartOrderDateChange = (event) => {
        set_start_order_date(event);
    }

    const handleEndOrderDateChange = (event) => {
        set_end_order_date(event);
    }

    const handleStartPaymentDateChange = (event) => {
        set_start_payment_date(event);
    }

    const handleEndPaymentDateChange = (event) => {
        set_end_payment_date(event);
    }

    const handleFiltering = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const form_data = event.currentTarget;
        //console.log(form_data);

        if (form_data.checkValidity() === false) {
            alert('Plese fill the input fileds!');
        }
        else{
            console.log('filtering');
            
            let order_id;
            if(form_data.id.value !== ''){
                order_id = parseInt(form_data.id.value);
            }
            else{
                order_id = '';
            }

            loadOrders(current_page, selected_sorting, [
                order_id,
                form_data.first_name.value,
                form_data.last_name.value,
                price_slider,
                [start_order_date, end_order_date],
                [start_payment_date, end_payment_date]
            ]);
        }

        setValidated(true);
    };

    const handlePageClick = (orders) => {
        let page_number = orders.selected;
        console.log(page_number, selected_sorting);
        loadOrders(page_number, selected_sorting, []);
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
                    <Form id="order_filters" noValidate validated={validated} onSubmit={handleFiltering} style={{marginBottom : '2em', marginLeft : '2em'}}>
                        <Row>
                            <Col>
                                <Form.Label>Id</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="id"
                                    placeholder="Enter Id"
                                    defaultValue=""
                                />
                                <Form.Text> Use characters [0-9] </Form.Text>
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Id.
                                </Form.Control.Feedback>
                            </Col>

                            <Col>
                                <Form.Label>Customer first name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="first_name"
                                    placeholder="Enter name"
                                    defaultValue=""
                                />
                                <Form.Text> Use characters [A-Z][a-z] </Form.Text>
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Customer first name.
                                </Form.Control.Feedback>
                            </Col>

                            <Col>
                            <Form.Label>Customer last name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="last_name"
                                    placeholder="Enter name"
                                    defaultValue=""
                                />
                                <Form.Text> Use characters [A-Z][a-z] </Form.Text>
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter Customer last name.
                                </Form.Control.Feedback>
                            </Col>

                            <Col>
                                <Form.Label>Start order date</Form.Label>
                                <DatePicker 
                                    selected={start_order_date} 
                                    onChange={handleStartOrderDateChange}
                                />
                            </Col>

                            <Col>
                                <Form.Label>End order date</Form.Label>
                                <DatePicker 
                                    selected={end_order_date} 
                                    onChange={handleEndOrderDateChange}
                                />
                            </Col>

                            <Col>
                                <Typography id="discrete-slider-small-steps" gutterBottom>
                                    Price [BGN]
                                </Typography>
                                <Slider
                                    value={price_slider}
                                    min={0}
                                    step={0.01}
                                    max={max_price}
                                    onChange={handlePriceSliderChange}
                                    valueLabelDisplay="auto"
                                    aria-labelledby="range-slider"
                                />
                            </Col>

                            <Col>
                                <Form.Label>Start payment date</Form.Label>
                                <DatePicker 
                                    selected={start_payment_date} 
                                    onChange={handleStartPaymentDateChange}
                                />
                            </Col>

                            <Col>
                                <Form.Label>End payment date</Form.Label>
                                <DatePicker 
                                    selected={end_payment_date} 
                                    onChange={handleEndPaymentDateChange}
                                />
                            </Col>

                            <Col>
                                <Button variant="primary" type="submit" className={'filter-button-center'}>
                                    Filter
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </div>

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
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={sortProducts}>
                                            <option key={1} value={'Sort by order_id asc'}>↗</option>
                                            <option key={2} value={'Sort by order_id desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">
                                        Created
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={sortProducts}>
                                            <option key={1} value={'Sort by order_date asc'}>↗</option>
                                            <option key={2} value={'Sort by order_date desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">
                                        Customer
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={sortProducts}>
                                            <option key={1} value={'Sort by customer_name asc'}>↗</option>
                                            <option key={2} value={'Sort by customer_name desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">
                                        Price [BGN]
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={sortProducts}>
                                            <option key={1} value={'Sort by order_total_price asc'}>↗</option>
                                            <option key={2} value={'Sort by order_total_price desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">
                                        Paid on
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={sortProducts}>
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