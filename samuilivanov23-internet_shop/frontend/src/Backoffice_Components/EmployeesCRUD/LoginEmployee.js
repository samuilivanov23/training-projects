import '../../App.css';
import React from 'react';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Button } from 'react-bootstrap';
import JsonRpcClient from 'react-jsonrpc-client';
import { SignInEmployee } from '../../Components/actions/EmployeeActions';

function LoginEmployee(props) {
    const [validated, setValidated] = useState(false);

    const { employeeInfo } = useSelector(state=>state.employee);
    console.log(employeeInfo);

    const dispatch = useDispatch();

    const handleSubmit = (event) => {
        const form_data = event.currentTarget;

        if (form_data.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();

            console.log('Not allowing to login');
        }
        else{
            event.preventDefault();
            event.stopPropagation();
            console.log('Allowing to login');

            //TODO: ADD email/password data validation 
            logInEmployee(form_data.email_address.value, form_data.password.value);
        }

        setValidated(true);
    };

    const logInEmployee = (email_address, password) => {
        var django_rpc = new JsonRpcClient({
            endpoint: 'http://127.0.0.1:8000/backoffice/rpc/',
        });
      
        django_rpc.request(
            "LoginEmployee",
            email_address,
            password,
        ).then(function(response){
            response = JSON.parse(response);
            if(response['employeeInfo']['email_address'] !== 'init'){
                dispatch(SignInEmployee(
                    response['employeeInfo']['id'],
                    response['employeeInfo']['email_address'],
                    response['employeeInfo']['permissions']
                ));

                props.history.push('/backoffice');
            }
            alert(response['msg']);
        }).catch(function(error){
            alert(error['msg'])
        });
    }

    return (
        <div className={'form-container'}>
            <Form noValidate validated={validated} onSubmit={handleSubmit} className={'form-center'}>
                <Form.Label>Email address</Form.Label>
                <Form.Control
                    required
                    type="text"
                    name="email_address"
                    placeholder="Email address"
                    defaultValue=""
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">
                    Please enter email address.
                </Form.Control.Feedback>
                <br/>
                <br/>



                <Form.Label>Password</Form.Label>
                <Form.Control
                    required
                    type="password"
                    name="password"
                    placeholder="Password"
                    defaultValue=""
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">
                    Please enter password.
                </Form.Control.Feedback>
                <br/>
                <br/>

                <Button variant="primary" type="submit">
                    Login
                </Button>
            </Form>
        </div>
    );
}

export default LoginEmployee;