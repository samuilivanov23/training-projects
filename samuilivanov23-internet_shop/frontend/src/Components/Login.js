import '../App.css';
import React from 'react';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Button } from '../../node_modules/react-bootstrap';
import { Link } from '../../node_modules/react-router-dom';
import JsonRpcClient from '../../node_modules/react-jsonrpc-client/jsonrpcclient';
import { SignIn } from './actions/UserActions';
import { AllCartProducts } from './actions/CartActions';


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
            response = JSON.parse(response);      
            if(response['userInfo']['username'] !== 'init'){
                dispatch(SignIn(response['userInfo']['id'],
                    response['userInfo']['username'],
                    response['userInfo']['email_address'], 
                    response['userInfo']['cart_id']));

                dispatch(AllCartProducts(response['cart_products']));
                props.history.push('/shop/products');
            }

            alert(response['msg'])
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

                <Link to={'/shop/register'}>
                    Dont have an account?
                </Link>
            </Form>
        </div>
    );
}

export default Login;