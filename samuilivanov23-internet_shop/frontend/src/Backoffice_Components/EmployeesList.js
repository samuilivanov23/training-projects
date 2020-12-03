import '../App.css';
import React from 'react';
import JsonRpcClient from '../../node_modules/react-jsonrpc-client/jsonrpcclient';
import { useState, useEffect } from 'react';
import { Card, Button } from '../../node_modules/react-bootstrap';
//import { SetEmployeeDetails } from '../Components/actions/SetEmployeeDetails';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from '../../node_modules/react-router-dom';

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
            response = JSON.parse(response);
            set_employees(response['employees']);
            console.log(response);
            alert(response['msg']);
        }).catch(function(error){
            alert(error['msg'])
        });
    }

    const getCurrentEmployee = (current_employee) => {
        //dispatch action

        // dispatch(SetEmployeeDetails(
        //     current_employee['first_name'],
        //     current_employee['last_name'],
        //     current_employee['email_address'],
        //     current_employee['password'],
        //     current_employee['role_name']
        // ));
    }

    const deleteEmployee = (employeeToDelete) => {
        console.log('delete employee method');

        // django_rpc = new JsonRpcClient({
        //     endpoint : 'http://127.0.0.1:8000/backoffice/rpc/',
        // });

        // dhango_rpc.request(
        //     'DeleteEmployee',
        //     employeeToDelete,
        // ).then(function(response){
        //     alert(response['msg']);
        // }).cath(function(error){
        //     alert(error['msg']);
        // });
    }

    if(typeof(employees) === 'undefined'){
        return(
            <div>Loading...</div>
        );
    }    
    else{
        return(
            <div className={"App"} style={{display : 'flex', flexDirection : 'row', flex : 1, flexWrap : 'wrap'}}>
                {employees.map((employee, idx) => (
                    <Card key={idx} className={'employee-card'}>
                        <Card.Body>
                            <Card.Title>{ employee['first_name'] } { employee['last_name'] }</Card.Title>
                            <Card.Text>{ employee['email_address'] }</Card.Text>

                            {(employeeInfo.permissions.update) 
                                ?   <Button className={'crud-buttons-style'}>
                                        <Link style={{color:'white'}} to={`/backoffice/employees/update/${employee['id']}`} onClick={() => getCurrentEmployee(employee)}>
                                            Update employee
                                        </Link>
                                    </Button>
                                : null
                            }

                            {(employeeInfo.permissions.delete)
                                ?   <Button className={'crud-buttons-style'} onClick={() => deleteEmployee(employee)}>
                                        Delete employee
                                    </Button>
                                : null

                            } 
                        </Card.Body>
                    </Card>
                ))}
            </div>
        );
    }
}

export default EmployeesList;