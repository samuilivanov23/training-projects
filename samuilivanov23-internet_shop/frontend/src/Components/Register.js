import '../App.css';
import React from 'react';
import { useState } from 'react';
import { Form, InputGroup, Button } from '../../node_modules/react-bootstrap';
import JsonRpcClient from '../../node_modules/react-jsonrpc-client/jsonrpcclient';

function Register (props) {

    const [validated, setValidated] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        const form_data = event.currentTarget;

        if (form_data.checkValidity() === false) {
            alert('Plese fill all input fileds!');
        }
        else{
            console.log('Allowing to register');
            
            if(form_data.password.value === form_data.confirm_password.value){
                console.log('Adding user');
                insertUser(form_data.first_name.value,
                           form_data.last_name.value,
                           form_data.username.value,
                           form_data.email_address.value,
                           form_data.password.value);
            }
            else {
                alert('Passwords must match');
            }
        }

        setValidated(true);  
    };

    const insertUser = (first_name, last_name, username, email_address, password) => {
        var django_rpc = new JsonRpcClient({
            endpoint: 'http://127.0.0.1:8000/shop/rpc/',
        });
      
        django_rpc.request(
            "RegisterUser",
            first_name,
            last_name,
            username,
            email_address,
            password,
        ).then(function(response){
            response = JSON.parse(response);
            alert(response['msg'])

            localStorage.setItem('verified', 'false');
            localStorage.setItem('user_email_address', email_address);
            
            if(response['msg'] === 'Email send successfully'){
                localStorage.setItem('user_token', response['token']);
                props.history.push('/shop/login');
            }
        }).catch(function(error){
            alert(error['msg'])
        });
    }

    return (
        <div className={'form-container'}>
            <Form noValidate validated={validated} onSubmit={handleSubmit} className={'form-center'}>
                <Form.Label>First Name</Form.Label>
                <Form.Control
                    required
                    type="text"
                    name="first_name"
                    placeholder="First name"
                    defaultValue=""
                />
                <Form.Text> Use characters [A-Z]/[a-z] </Form.Text>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">
                    Please enter First Name.
                </Form.Control.Feedback>
                <br/>
                <br/>



                <Form.Label>Last Name</Form.Label>
                <Form.Control
                    required
                    type="text"
                    name="last_name"
                    placeholder="Last name"
                    defaultValue=""
                />
                <Form.Text> Use characters [A-Z]/[a-z] </Form.Text>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">
                    Please enter Last Name.
                </Form.Control.Feedback>
                <br/>
                <br/>



                <Form.Label>Username</Form.Label>
                <InputGroup>
                    <InputGroup.Prepend>
                        <InputGroup.Text id="inputGroupPrepend">@</InputGroup.Text>
                    </InputGroup.Prepend>

                    <Form.Control
                        required
                        type="text"
                        name="username"
                        placeholder="Username"
                        aria-describedby="inputGroupPrepend"
                        defaultValue=""
                    />
                </InputGroup>
                <Form.Text> Use characters [A-Z]/[a-z]/[0-9]. Also accepted are: '. _' </Form.Text>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">
                    Please enter a username.
                </Form.Control.Feedback>
                <br/>
                <br/>



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



                <Form.Label>Confirm password</Form.Label>
                <Form.Control
                    required
                    type="password"
                    name="confirm_password"
                    placeholder="Confirm password"
                    defaultValue=""
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">
                    Please enter confirm password.
                </Form.Control.Feedback>
                <br/>
                <br/>

                <Button variant="primary" type="submit">
                    Register
                </Button>
            </Form>
        </div>
    );
}

export default Register;