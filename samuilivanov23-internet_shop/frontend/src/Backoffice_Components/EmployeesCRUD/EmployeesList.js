import '../../App.css';
import React from 'react';
import JsonRpcClient from 'react-jsonrpc-client';
import { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import { SetEmployeeToUpdateDetails } from '../../Components/actions/EmployeeActions';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

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

        console.log('here');
        console.log(permission_list);
        var permission_dict = {}
        permission_list.forEach(permission => {
            permission_dict[permission] = true;
        });

        console.log('here 222');
        console.log(permission_dict);

        dispatch(SetEmployeeToUpdateDetails(
            current_employee['first_name'],
            current_employee['last_name'],
            current_employee['email_address'],
            current_employee['role_name'],
            permission_dict,
        ));
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