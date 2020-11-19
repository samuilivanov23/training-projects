import '../App.css';
import React from 'react';
import { useState } from 'react';
import { Form, InputGroup, Button } from '../../node_modules/react-bootstrap';



function Register () {

    const [validated, setValidated] = useState(false);

    const handleSubmit = (event) => {
        const form_data = event.currentTarget;

        if (form_data.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();

            console.log('Not allowing to register');
        }
        else{
            console.log('Allowing to register');

            console.log(form_data.password.value);
            console.log(form_data.confirm_password.value);
            
            if(form_data.password.value === form_data.confirm_password.value){
                //ADD user
                console.log('Adding user');
            }
            else {
                event.preventDefault();
                event.stopPropagation();    
                alert('Passwords must match');
            }
        }

        setValidated(true);  
    };

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
                    type="text"
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
                    type="text"
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