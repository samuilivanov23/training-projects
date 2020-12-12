import '../../App.css';
import React from 'react';
import JsonRpcClient from 'react-jsonrpc-client';
import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
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

    const [employees, set_employees] = useState([]);
    const [selected_sorting, set_selected_sorting] = useState('Sort by customer_name asc');
    const [pages_count, set_pages_count] = useState(0);
    const [current_page, set_current_page] = useState(0);
    const { employeeInfo } = useSelector(state=>state.employee);
    const dispatch = useDispatch();

    useEffect(() => {
        loadEmployees(current_page, selected_sorting);
    }, [])

    const loadEmployees = (current_page, selected_sorting) => {
        const django_rpc = new JsonRpcClient({
            endpoint : 'http://127.0.0.1:8000/backoffice/rpc/',
        });

        django_rpc.request(
            'GetEmployees',
            selected_sorting,
            current_page,
        ).then(function(response){
            response = JSON.parse(response);
            set_employees(response['employees']);
            set_pages_count(response['pages_count']);
            set_selected_sorting(selected_sorting);
            alert(response['msg']);
        }).catch(function(error){
            alert(error['msg']);
        });
    }

    const getCurrentEmployee = (current_employee) => {

        var permission_list = []
        Object.keys(current_employee.employee_permissions).forEach(permission => {
            console.log(current_employee.employee_permissions[permission]);
            console.log(permission);
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
    }

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
            loadEmployees(current_page, selected_sorting);
        }).catch(function(error){
            alert(error['msg']);
        });
    }

    const FilterProducts = (event) => {
        const filter = event.target.value;
        loadEmployees(current_page, filter);
    }

    const handlePageClick = (employee) => {
        let page_number = employee.selected;
        loadEmployees(page_number, selected_sorting);
        set_current_page(page_number);
        window.scrollTo(0, 0);
    }

    const useStyles = makeStyles({
        table: {
            minWidth: 650,
        },
    });

    const classes = useStyles();
    
    const createData = (employee_id, employee_first_name, employee_last_name, employee_email_address, employee_role_name, employee_permissions) => {
        return { employee_id, employee_first_name, employee_last_name, employee_email_address, employee_role_name, employee_permissions };
    }

    const generateRows = () => {
        const rows = []
        
        console.log(employees);

        employees.forEach(employee => {
            rows.push(createData(employee['id'], employee['first_name'], employee['last_name'], employee['email_address'], employee['role_name'], employee['permissions']))
        });
    
        return rows;
    }

    const GenerateSortFilters = () => {
        const options = []
  
        options.push(<option key={1} value={'Sort by customer_name asc'}> Sort by name (asc)</option>);
        options.push(<option key={2} value={'Sort by customer_name desc'}> Sort by name (desc)</option>);
        options.push(<option key={3} value={'Sort by e.email_address asc'}> Sort by email (asc)</option>);
        options.push(<option key={4} value={'Sort by e.email_address desc'}> Sort by email (desc)</option>);
        options.push(<option key={7} value={'Sort by r.name asc'}> Sort by role (asc)</option>);
        options.push(<option key={8} value={'Sort by r.name desc'}> Sort by role (desc)</option>);
        
        return options;
    } 

    if(typeof(employees) === 'undefined'){
        return(
            <div>Loading...</div>
        );
    }    
    else{
        const rows = generateRows();
        const sorting_options = GenerateSortFilters();

        return(
            <div>
                <div>
                    <select id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={FilterProducts}>
                        {sorting_options}
                    </select>
                </div>

                <div>
                    <TableContainer component={Paper}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Name</TableCell>
                                    <TableCell align="center">Email</TableCell>
                                    <TableCell align="center">Role</TableCell>
                                    <TableCell align="center"> </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell component="th" scope="row" align="center">{row.employee_first_name} {row.employee_last_name}</TableCell>
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