import '../App.css';
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Button } from '../../node_modules/react-bootstrap';
import { Link } from '../../node_modules/react-router-dom';
import JsonRpcClient from '../../node_modules/react-jsonrpc-client/jsonrpcclient';
import { SignIn } from './actions/UserActions';


function Login (props) {
    const [validated, setValidated] = useState(false);

    const signInUser = useSelector(state=>state.signInUser);
    const { userInfo } = signInUser;
    console.log(userInfo);

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
            logInUser(form_data.email_address.value, form_data.password.value);
            console.log(userInfo);
            console.log(props.history.location);
            props.history.push("/products");
            console.log(props.history.location);
        }

        setValidated(true);
    };

    const logInUser = (email_address, password) => {
        var django_rpc = new JsonRpcClient({
            endpoint: 'http://127.0.0.1:8000/shop/rpc/',
        });
      
        django_rpc.request(
            "LoginUser",
            email_address,
            password,
        ).then(function(response){
            let json_response = JSON.parse(response);

            let username = json_response.userInfo.username;
            let user_email_address = json_response.userInfo.email_address;
            let user_cart_id = json_response.userInfo.cart_id;

            dispatch(SignIn(username, user_email_address, user_cart_id));
            alert(json_response['msg'])
        }).catch(function(error){
            console.log(error);
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

                <Button variant="primary" type="submit">
                    Login
                </Button>

                <Link to={'/register'}>
                    Dont have an account?
                </Link>
            </Form>
        </div>
    );
}

export default Login;