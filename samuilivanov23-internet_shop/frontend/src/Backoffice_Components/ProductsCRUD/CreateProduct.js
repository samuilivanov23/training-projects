import '../../App.css';
import React from 'react';
import { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import JsonRpcClient from 'react-jsonrpc-client';

function CreateProduct(props){

    const [validated, setValidated] = useState(false);
    const [manufacturers, set_manufacturers] = useState([])
    const [selected_manufacturer, set_selected_manufacturer] = useState(1);
    
    useEffect(()=> {
        loadManufacturers();
    }, []);

    const loadManufacturers = () => {
        const django_rpc = new JsonRpcClient({
            endpoint : 'http://127.0.0.1:8000/backoffice/rpc/',
        });

        django_rpc.request(
            'GetManufacturers',
        ).then(function(response){
            response = JSON.parse(response);
            console.log(response);
            console.log(response['manufacturers']);
            set_manufacturers(response['manufacturers']);
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
            console.log('Creating product');
            insertProduct(form_data.name.value,
                        form_data.description.value,
                        form_data.count.value,
                        form_data.price.value,
                        form_data.image_name.value,
                        selected_manufacturer);
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

    const changeManufacturer = (event) => {
        set_selected_manufacturer(event.target.value);
    }

    const generateManufacturerSelectElements = () => {
        const options = [];

        if(manufacturers.length != 0){
            manufacturers.forEach((manufacturer, idx) => {
                options.push(<option key={idx} value={manufacturer['id']}> {manufacturer['name']} </option>)
            });
        }

        return options;
    }

    if(manufacturers.length === 0){
        return(
            <div>Loading...</div>
        );
    }
    else{
        const options = generateManufacturerSelectElements();

        console.log(selected_manufacturer);
        return (
            <div className={'form-container'}>
                <Form noValidate validated={validated} onSubmit={handleSubmit} className={'form-center'}>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        required
                        type="text"
                        name="name"
                        placeholder="Name"
                        defaultValue=""
                    />
                    <Form.Text> Use characters [A-Z]/[a-z] </Form.Text>
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                        Please enter Name.
                    </Form.Control.Feedback>
                    <br/>
                    <br/>
    
    
    
                    <Form.Label>Description</Form.Label>
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
    
    
    
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                        required
                        type="text"
                        name="count"
                        placeholder="Quantity"
                        defaultValue=""
                    />
                    <Form.Text> Integer </Form.Text>
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                        Please enter Quantity.
                    </Form.Control.Feedback>
                    <br/>
                    <br/>
    
    
    
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                        required
                        type="text"
                        name="price"
                        placeholder="Price"
                        defaultValue=""
                    />
                    <Form.Text> 2 floating point digits (For instance: 19.99) </Form.Text>
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                        Please enter Price.
                    </Form.Control.Feedback>
                    <br/>
                    <br/>
    
    
    
                    <Form.Label>Image</Form.Label>
                    <Form.Control
                        required
                        type="text"
                        name="image_name"
                        placeholder="Image"
                        defaultValue=""
                    />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                        Please enter Image.
                    </Form.Control.Feedback>
                    <br/>
                    <br/>


                    <Form.Label>Manufacturer</Form.Label>
                    <select value={selected_manufacturer} onChange={changeManufacturer}>
                        {options}
                    </select>
                    <br/>
                    <br/>
    
                    <Button variant="primary" type="submit">
                        Create product
                    </Button>
                </Form>
            </div>
        );
    }
}

export default CreateProduct;