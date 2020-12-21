import '../../App.css';
import React from 'react';
import JsonRpcClient from 'react-jsonrpc-client';
import { useState, useEffect, useRef } from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import { SetEmployeeToUpdateDetails } from '../../Components/actions/EmployeeActions';
import { useSelector, useDispatch } from 'react-redux';
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

function EmployeesList (props){

    const [validated, setValidated] = useState(false);
    const formRef = useRef(null);
    const [employees, set_employees] = useState([]);
    const [selected_sorting, set_selected_sorting] = useState('Sort by employee_id asc');
    const [pages_count, set_pages_count] = useState(0);
    const [current_page, set_current_page] = useState(0);
    const [sorting_label, set_sorting_label] = useState('employee id asc')
    const [employee_id, set_employee_id] = useState(null);
    const [employee_first_name, set_employee_first_name] = useState('');
    const [employee_last_name, set_employee_last_name] = useState('');
    const [employee_email_address, set_employee_email_address] = useState('');
    const [employee_role, set_employee_role] = useState('');
    const { employeeInfo } = useSelector(state=>state.employee);
    const dispatch = useDispatch();

    useEffect(() => {
        loadEmployees(current_page, selected_sorting, []); // empty array -> no filtering params
    }, [])

    const loadEmployees = (current_page, selected_sorting, filtering_params) => {
        const django_rpc = new JsonRpcClient({
            endpoint : 'http://127.0.0.1:8000/backoffice/rpc/',
        });

        django_rpc.request(
            'GetEmployees',
            selected_sorting,
            current_page,
            filtering_params
        ).then(function(response){
            response = JSON.parse(response);
            set_employees(response['employees']);
            set_pages_count(response['pages_count']);
            set_selected_sorting(selected_sorting);

            let ordering_param = selected_sorting.split(" ")[2];
            let ordering_direction = selected_sorting.split(" ")[3];            
            ordering_param = ordering_param.split("_");
            
            set_sorting_label('Ordered by: ' + ordering_param[0] + " " + ordering_param[1] + " " + ordering_direction);
        }).catch(function(error){
            alert(error['msg']);
        });
    };

    const getCurrentEmployee = (current_employee) => {

        var permission_list = []
        Object.keys(current_employee.employee_permissions).forEach(permission => {
            if(current_employee.employee_permissions[permission]){
                permission_list.push(permission);
            }
        });

        var permission_dict = {}
        permission_list.forEach(permission => {
            permission_dict[permission] = true;
        });

        dispatch(SetEmployeeToUpdateDetails(
            current_employee.employee_first_name,
            current_employee.employee_last_name,
            current_employee.employee_email_address,
            current_employee.employee_role_name,
            permission_dict,
        ));
    };

    const deleteEmployee = (id) => {
        const django_rpc = new JsonRpcClient({
            endpoint : 'http://127.0.0.1:8000/backoffice/rpc/',
        });

        django_rpc.request(
            'DeleteEmployee',
            id,
        ).then(function(response){
            response = JSON.parse(response);
            alert(response['msg']);
            loadEmployees(current_page, selected_sorting, [
                parseInt(employee_id),
                employee_first_name,
                employee_last_name,
                employee_email_address,
                employee_role
            ]);
        }).catch(function(error){
            alert(error['msg']);
        });
    };

    const sortEmployees = (event) => {
        const filter = event.target.value;
        loadEmployees(current_page, filter, [
            parseInt(employee_id),
            employee_first_name,
            employee_last_name,
            employee_email_address,
            employee_role
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
            set_employee_id(form_data.id.value);
            set_employee_first_name(form_data.first_name.value);
            set_employee_last_name(form_data.last_name.value);
            set_employee_email_address(form_data.email_address.value);
            set_employee_role(form_data.role_name.value);

            loadEmployees(current_page, selected_sorting, [
                parseInt(form_data.id.value),
                form_data.first_name.value,
                form_data.last_name.value,
                form_data.email_address.value,
                form_data.role_name.value
            ]);
        }
        
        setValidated(true);
    };

    const clearFilters = () => {
        formRef.current.reset();
        setValidated(false);
        
        set_employee_id(null);
        set_employee_first_name('');
        set_employee_last_name('');
        set_employee_email_address('');
        set_employee_role('');
        
        loadEmployees(current_page, selected_sorting, []) // empty array -> no filtering params
    };

    const handlePageClick = (employee) => {
        let page_number = employee.selected;
        loadEmployees(page_number, selected_sorting, [
            parseInt(employee_id),
            employee_first_name,
            employee_last_name,
            employee_email_address,
            employee_role
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
    
    const createData = (employee_id, employee_first_name, employee_last_name, employee_email_address, employee_role_name, employee_permissions, employee_inserted_at) => {
        return { employee_id, employee_first_name, employee_last_name, employee_email_address, employee_role_name, employee_permissions, employee_inserted_at };
    }

    const generateRows = () => {
        const rows = []

        employees.forEach(employee => {
            rows.push(createData(employee['id'], employee['first_name'], employee['last_name'], employee['email_address'], employee['role_name'], employee['permissions'], employee['inserted_at']))
        });
    
        return rows;
    };

    if(typeof(employees) === 'undefined'){
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
                                <Form.Label>Role</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="role_name"
                                    placeholder="Role"
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
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={sortEmployees}>
                                            <option key={1} value={'Sort by employee_id asc'}>↗</option>
                                            <option key={2} value={'Sort by employee_id desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">
                                        Inserted
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={sortEmployees}>
                                            <option key={1} value={'Sort by inserted_at asc'}>↗</option>
                                            <option key={2} value={'Sort by inserted_at desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">
                                        Name
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={sortEmployees}>
                                            <option key={1} value={'Sort by customer_name asc'}>↗</option>
                                            <option key={2} value={'Sort by customer_name desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">
                                        Email
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={sortEmployees}>
                                            <option key={1} value={'Sort by email_address asc'}>↗</option>
                                            <option key={2} value={'Sort by email_address desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">
                                        Role
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={sortEmployees}>
                                            <option key={1} value={'Sort by role_name asc'}>↗</option>
                                            <option key={2} value={'Sort by role_name desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center"> </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell component="th" scope="row" align="center">{row.employee_id}</TableCell>
                                        <TableCell align="center">{row.employee_inserted_at}</TableCell>
                                        <TableCell align="center">{row.employee_first_name} {row.employee_last_name}</TableCell>
                                        <TableCell align="center">{row.employee_email_address}</TableCell>
                                        <TableCell align="center">{row.employee_role_name}</TableCell>
                                        <TableCell align="center">
                                            {(employeeInfo.permissions.update_perm)
                                            ?   <Button variant="light" className={'crud-buttons-style ml-auto'}>
                                                    <Link style={{color:'white'}} to={`/backoffice/employees/update/${row.employee_id}`} onClick={() => getCurrentEmployee(row)}>
                                                        <img
                                                        src='https://p7.hiclipart.com/preview/9/467/583/computer-icons-tango-desktop-project-download-clip-art-update-button.jpg'
                                                        alt="Update employee"
                                                        className={'image-btnstyle'}
                                                        />
                                                    </Link>
                                                </Button>
                                            : null
                                            }

                                            {(employeeInfo.permissions.delete_perm)
                                                ?   <Button variant="light" className={'crud-buttons-style'} onClick={() => deleteEmployee(row.employee_id)}>
                                                        <img 
                                                        src='https://icon-library.com/images/delete-icon-png/delete-icon-png-4.jpg'
                                                        alt="Delete employee"
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

export default EmployeesList;