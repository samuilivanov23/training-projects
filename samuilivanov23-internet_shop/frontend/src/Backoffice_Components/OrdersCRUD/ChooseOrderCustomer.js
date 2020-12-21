import '../../App.css';
import React from 'react';
import JsonRpcClient from 'react-jsonrpc-client';
import { useState, useEffect, useRef } from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import { AssignUserBackofficeOrder } from '../../Components/actions/UserActions';
import { useDispatch } from 'react-redux';
import ReactPaginate from '../../../node_modules/react-paginate'
import { Link } from 'react-router-dom';
import Table from '@material-ui/core/Table';
import { makeStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

function UsersList (props){

    const [validated, setValidated] = useState(false);
    const formRef = useRef(null);
    const [users, set_users] = useState([]);
    const [selected_sorting, set_selected_sorting] = useState('Sort by u.id asc');
    const [pages_count, set_pages_count] = useState(0);
    const [current_page, set_current_page] = useState(0);
    const [sorting_label, set_sorting_label] = useState('user id asc')
    const [user_id, set_user_id] = useState(null);
    const [user_first_name, set_user_first_name] = useState('');
    const [user_last_name, set_user_last_name] = useState('');
    const [username, set_username] = useState('');
    const [user_email_address, set_user_email_address] = useState('');
    const dispatch = useDispatch();

    useEffect(() => {
        loadUsers(current_page, selected_sorting, []); // empty array -> no filtering params
    }, [])

    const loadUsers = (current_page, selected_sorting, filtering_params) => {
        const django_rpc = new JsonRpcClient({
            endpoint : 'http://127.0.0.1:8000/backoffice/rpc/',
        });

        django_rpc.request(
            'GetUsers',
            selected_sorting,
            current_page,
            filtering_params
        ).then(function(response){
            response = JSON.parse(response);
            set_users(response['users']);
            set_pages_count(response['pages_count']);
            set_selected_sorting(selected_sorting);

            let ordering_param = selected_sorting.split(" ")[2];
            let ordering_direction = selected_sorting.split(" ")[3];
            
            set_sorting_label('Ordered by: ' + ordering_param + " " + ordering_direction);
        }).catch(function(error){
            alert(error['msg']);
        });
    };

    const assignUserToOrder = (current_user) => {
        dispatch(AssignUserBackofficeOrder(
            current_user.user_id,
        ));
    };

    const sortUsers = (event) => {
        const filter = event.target.value;
        loadUsers(current_page, filter, [
            parseInt(user_id),
            user_first_name,
            user_last_name,
            username,
            user_email_address,
        ]);
    };

    const handleFiltering = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const form_data = event.currentTarget;

        if(form_data.checkValidity() === false){
            alert('Please fill the input fields');
        }
        else{
            set_user_id(form_data.id.value);
            set_user_first_name(form_data.first_name.value);
            set_user_last_name(form_data.last_name.value);
            set_username(form_data.username.value);
            set_user_email_address(form_data.email_address.value);

            console.log(form_data.id.value);
            loadUsers(current_page, selected_sorting, [
                parseInt(form_data.id.value),
                form_data.first_name.value,
                form_data.last_name.value,
                form_data.username.value,
                form_data.email_address.value
            ]);
        }
        
        setValidated(true);
    };

    const clearFilters = () => {
        formRef.current.reset();
        setValidated(false);

        set_user_id(null);
        set_user_first_name('');
        set_user_last_name('');
        set_username('');
        set_user_email_address('');

        loadUsers(current_page, selected_sorting, []) // empty array -> no filtering params
    };

    const handlePageClick = (user) => {
        let page_number = user.selected;
        loadUsers(page_number, selected_sorting, [
            parseInt(user_id),
            user_first_name,
            user_last_name,
            username,
            user_email_address,
        ]);
        set_current_page(page_number);
        window.scrollTo(0, 0);
    };

    const useStyles = makeStyles({
        table: {
            minWidth: 650,
        },
    });

    const classes = useStyles();
    
    const createData = (user_id, user_first_name, user_last_name, username, user_email_address, user_inserted_at, user_authenticated) => {
        return { user_id, user_first_name, user_last_name, username, user_email_address, user_inserted_at, user_authenticated };
    }

    const generateRows = () => {
        const rows = []

        users.forEach(user => {
            rows.push(createData(user['id'], user['first_name'], user['last_name'], user['username'], user['email_address'], user['inserted_at'], user['authenticated']))
        });
    
        return rows;
    };

    if(typeof(users) === 'undefined'){
        return(
            <div>Loading...</div>
        );
    }
    else{
        const rows = generateRows();

        return(
            <div>
                <div>
                    <Form ref={formRef} noValidate validated={validated} onSubmit={handleFiltering} style={{marginBottom : '2em', marginLeft : '2em'}}>
                        <Row>
                            <Col>
                                <Form.Label>Id</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="id"
                                    placeholder="Id"
                                    defaultValue=""
                                />
                                <Form.Text> Use characters [0-9] </Form.Text>
                            </Col>

                            <Col>
                                <Form.Label>First name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="first_name"
                                    placeholder="First name"
                                    defaultValue=""
                                />
                                <Form.Text> Use characters [A-Z]/[a-z] </Form.Text>
                            </Col>

                            <Col>
                                <Form.Label>Last name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="last_name"
                                    placeholder="Last name"
                                    defaultValue=""
                                />
                                <Form.Text> Use characters [A-Z]/[a-z] </Form.Text>
                            </Col>

                            <Col>
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    defaultValue=""
                                />
                                <Form.Text> Use characters [A-Z]/[a-z] </Form.Text>
                            </Col>

                            <Col>
                                <Form.Label>Email address</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="email_address"
                                    placeholder="Email address"
                                    defaultValue=""
                                />
                                <Form.Text> Use characters [A-Z]/[a-z] </Form.Text>
                            </Col>

                            <Col>
                                <Button variant="primary" type="submit" className={'filter-button-center'}>
                                    Filter product
                                </Button>

                                <Button variant="primary" className={'filter-button-center'} onClick={clearFilters}>
                                    Clear
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </div>

                <div style={{textAlign : 'center'}}>
                    <h5>{sorting_label}</h5>
                </div>

                <div>
                    <TableContainer component={Paper}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">
                                        Id
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={sortUsers}>
                                            <option key={1} value={'Sort by u.id asc'}>↗</option>
                                            <option key={2} value={'Sort by u.id desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">
                                        Inserted
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={sortUsers}>
                                            <option key={1} value={'Sort by u.inserted_at asc'}>↗</option>
                                            <option key={2} value={'Sort by u.inserted_at desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">
                                        Name
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={sortUsers}>
                                            <option key={1} value={'Sort by customer_name asc'}>↗</option>
                                            <option key={2} value={'Sort by customer_name desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">
                                        Username
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={sortUsers}>
                                            <option key={1} value={'Sort by u.username asc'}>↗</option>
                                            <option key={2} value={'Sort by u.username desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">
                                        Email
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={sortUsers}>
                                            <option key={1} value={'Sort by u.email_address asc'}>↗</option>
                                            <option key={2} value={'Sort by u.email_address desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">
                                        Authenticated
                                    </TableCell>
                                    <TableCell align="center"> </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell component="th" scope="row" align="center">{row.user_id}</TableCell>
                                        <TableCell align="center">{row.user_inserted_at}</TableCell>
                                        <TableCell align="center">{row.user_first_name} {row.user_last_name}</TableCell>
                                        <TableCell align="center">{row.username}</TableCell>
                                        <TableCell align="center">{row.user_email_address}</TableCell>
                                        <TableCell align="center">{row.user_authenticated}</TableCell>
                                        <TableCell align="center">
                                            <Button variant="light" className={'crud-buttons-style ml-auto'}>
                                                <Link style={{color:'white'}} to={`/backoffice/orders/create`} onClick={() => assignUserToOrder(row)}>
                                                    <img
                                                    src='https://cdn2.iconfinder.com/data/icons/media-controls-5/100/add-512.png'
                                                    alt="AssignUserToOrder"
                                                    className={'image-btnstyle'}
                                                    />
                                                </Link>
                                            </Button>
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
                        pageRangeDisplayed={(pages_count > 5) ? 5 : pages_count}
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

export default UsersList;