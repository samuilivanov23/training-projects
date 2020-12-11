import '../../App.css';
import React from 'react';
import { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import JsonRpcClient from 'react-jsonrpc-client';
import DatePicker from 'react-date-picker';

function CreateOrder(props){

    const [validated, setValidated] = useState(false);
    const [users, set_users] = useState([])
    const [order_date, set_order_date] = useState(new Date());
    const [selected_user, set_selected_user] = useState(1);
    
    useEffect(()=> {
        loadUsers();
    }, []);

    const loadUsers = () => {
        const django_rpc = new JsonRpcClient({
            endpoint : 'http://127.0.0.1:8000/backoffice/rpc/',
        });

        django_rpc.request(
            'GetUsers',
        ).then(function(response){
            response = JSON.parse(response);
            console.log(response);
            console.log(response['users']);
            set_users(response['users']);
            console.log(response['msg']);
        }).catch(function(error){
            alert(error['msg']);
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const form_data = event.currentTarget;

        if (form_data.checkValidity() === false) {
            alert('Plese fill all input fileds!');
        }
        else{
            console.log('Creating employee');
            
            insertProduct(form_data.name.value,
                        form_data.description.value,
                        form_data.count.value,
                        form_data.price.value,
                        form_data.image_name.value,
                        selected_user);
        }

        setValidated(true);
    };

    const insertProduct = (name, description, count, price, image_name, manufacturer_id) => {
        
        var django_rpc = new JsonRpcClient({
            endpoint: 'http://127.0.0.1:8000/backoffice/rpc/',
        });

        django_rpc.request(
            "CreateProduct",
            name,
            description,
            count,
            price,
            image_name,
            manufacturer_id,
        ).then(function(response){
            response = JSON.parse(response);
            alert(response['msg'])
            
           props.history.push('/backoffice/products');
        }).catch(function(error){
            alert(error['msg']);
        });
    }

    const changeUser = (event) => {
        set_selected_user(event.target.value);
    }

    const generateUserSelectElements = () => {
        const options = [];

        if(users.length != 0){
            users.forEach((user, idx) => {
                options.push(<option key={idx} value={user['id']}> {user['name']} </option>)
            });
        }

        return options;
    }

    if(users.length === 0){
        return(
            <div>Loading...</div>
        );
    }
    else{
        const options = generateUserSelectElements();

        console.log(selected_user);
        return (
            <div className={'form-container'}>
                <DatePicker
                onChange={set_order_date}
                value={order_date}
                />

                <Form noValidate validated={validated} onSubmit={handleSubmit} className={'form-center'}>
                    <DatePicker
                    onChange={set_order_date}
                    value={order_date}
                    />
                    
                    {/* <Form.Label>Price</Form.Label>
                    <Form.Control
                        required
                        type="text"
                        name="price"
                        placeholder="Price"
                        defaultValue=""
                    />
                    <Form.Text> Use characters [A-Z]/[a-z] </Form.Text>
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                        Please enter Price.
                    </Form.Control.Feedback>
                    <br/>
                    <br/>
    
    
    
                    <Form.Label>Customer</Form.Label>
                    <Form.Control
                        required
                        type="text"
                        name="description"
                        placeholder="Description"
                        defaultValue=""
                    />
                    <Form.Text> Use characters [A-Z]/[a-z] </Form.Text>
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                        Please enter Description.
                    </Form.Control.Feedback>
                    <br/>
                    <br/>
    
    
    
                    <Form.Label>Payment Status</Form.Label>
                    <Form.Control
                        required
                        type="text"
                        name="count"
                        placeholder="Quantity"
                        defaultValue=""
                    />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                        Please enter Quantity.
                    </Form.Control.Feedback>
                    <br/>
                    <br/>
    
    
    
                    <Form.Label>Payment date</Form.Label>
                    <Form.Control
                        required
                        type="text"
                        name="price"
                        placeholder="Price"
                        defaultValue=""
                    />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                        Please enter Price.
                    </Form.Control.Feedback>
                    <br/>
                    <br/>

                    <select value={selected_user} onChange={changeUser}>
                        {options}
                    </select>
                    <br/>
                    <br/> */}
    
                    <Button variant="primary" type="submit">
                        Create order
                    </Button>
                </Form>
            </div>
        );
    }
}

export default CreateOrder;