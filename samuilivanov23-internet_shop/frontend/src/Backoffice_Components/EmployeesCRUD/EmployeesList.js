import '../../App.css';
import React from 'react';
import JsonRpcClient from 'react-jsonrpc-client';
import { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import { SetEmployeeToUpdateDetails } from '../../Components/actions/EmployeeActions';
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

function EmployeesList (props){

    const [employees, set_employees] = useState([]);
    const { employeeInfo } = useSelector(state=>state.employee);
    const dispatch = useDispatch();

    useEffect(() => {
        loadEmployees();
    }, [])

    const loadEmployees = () => {
        const django_rpc = new JsonRpcClient({
            endpoint : 'http://127.0.0.1:8000/backoffice/rpc/',
        });

        django_rpc.request(
            'GetEmployees',
        ).then(function(response){
            console.log(response);
            response = JSON.parse(response);
            console.log(response['employees']);
            set_employees(response['employees']);
            alert(response['msg']);
        }).catch(function(error){
            alert(error['msg']);
        });
    }

    const getCurrentEmployee = (current_employee) => {

        var permission_list = []
        Object.keys(current_employee['permissions']).forEach(permission => {
            console.log(current_employee['permissions'][permission]);
            console.log(permission);
            if(current_employee['permissions'][permission]){
                permission_list.push(permission);
            }
        });

        var permission_dict = {}
        permission_list.forEach(permission => {
            permission_dict[permission] = true;
        });

        dispatch(SetEmployeeToUpdateDetails(
            current_employee['first_name'],
            current_employee['last_name'],
            current_employee['email_address'],
            current_employee['role_name'],
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
            loadEmployees();
        }).catch(function(error){
            alert(error['msg']);
        });
    }

    const useStyles = makeStyles({
        table: {
            minWidth: 650,
        },
    });

    const classes = useStyles();
    
    const createData = (employee_id, employee_name, employee_email_address, employee_role_name) => {
        return { employee_id, employee_name, employee_email_address, employee_role_name };
    }

    const generateRows = () => {
        const rows = []
    
        employees.forEach(employee => {
            employees.push(createData(employee['id'], employee['first_name'] + ' ' + employee['last_name'], employee['email_address'], employee['role_name']))
        });
    
        return rows;
    }
      
    const rows = generateRows();

    if(typeof(employees) === 'undefined'){
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
                            <TableCell align="center">Name</TableCell>
                            <TableCell align="center">Email</TableCell>
                            <TableCell align="center">Role</TableCell>
                            <TableCell align="center"> </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, idx) => (
                            <TableRow key={idx}>
                                <TableCell component="th" scope="row">{row.employee_name}</TableCell>
                                <TableCell align="center">{row.employee_email_address}</TableCell>
                                <TableCell align="center">{row.employee_role_name}</TableCell>
                                <TableCell align="center">
                                    {(employeeInfo.permissions.update_perm) 
                                    ?   <Button className={'crud-buttons-style ml-auto'}>
                                            <Link style={{color:'white'}} to={`/backoffice/employees/update/${row.employee_id}`} onClick={() => getCurrentEmployee(row)}>
                                                Update employee
                                            </Link>
                                        </Button>
                                    : null
                                    }

                                    {(employeeInfo.permissions.delete_perm)
                                        ?   <Button className={'crud-buttons-style'} onClick={() => deleteEmployee(row.employee_id)}>
                                                Delete employee
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

export default EmployeesList;