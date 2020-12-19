import '../../App.css';
import React from 'react';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { Form, Button } from '../../../node_modules/react-bootstrap';
import JsonRpcClient from '../../../node_modules/react-jsonrpc-client/jsonrpcclient';
import { useHistory } from '../../../node_modules/react-router-dom';

function UpdateProduct (props) {

    const [validated, setValidated] = useState(false);
    const history = useHistory();
    const { productToUpdateInfo } = useSelector(state =>state.productToUpdate);
    const [manufacturers, set_manufacturers] = useState([])
    const [selected_manufacturer, set_selected_manufacturer] = useState(productToUpdateInfo.manufacturer_id);

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
            set_manufacturers(response['manufacturers']);
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
            updateProduct(productToUpdateInfo.id,
                        form_data.name.value,
                        form_data.description.value,
                        form_data.count.value,
                        form_data.price.value,
                        form_data.image.value,
                        selected_manufacturer);
        }

        setValidated(true);
    };

    const updateProduct = (id, name, description, count, price, image, manufacturer_id) => {
        var django_rpc = new JsonRpcClient({
            endpoint : 'http://127.0.0.1:8000/backoffice/rpc/',
        });

        django_rpc.request(
            "UpdateProduct",
            id,
            name,
            description,
            count,
            price,
            image,
            manufacturer_id,
        ).then(function(response){
            response = JSON.parse(response);
            alert(response['msg'])
            history.push('/backoffice/products');
        }).catch(function(error){
            alert(error['msg']);
        });
    }

    const changeManufacturer = (event) => {
        set_selected_manufacturer(event.target.value);
    }

    const generateManufacturerSelectElements = () => {
        const options = [];

        options.push(<option key={-1} value={productToUpdateInfo.manufacturer_id}> {productToUpdateInfo.manufacturer_name} </option>);

        if(manufacturers.length !== 0){
            manufacturers.forEach((manufacturer, idx) => {
                if(manufacturer['id'] !== productToUpdateInfo.manufacturer_id){
                    options.push(<option key={idx} value={manufacturer['id']}> {manufacturer['name']} </option>)
                }
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

        return (
            <div>
                <div>
                    <h1 style={{marginLeft : '40%'}}>Edit Product {productToUpdateInfo.name}</h1>
                </div>

                <div className={'form-container'}>
                    <Form noValidate validated={validated} onSubmit={handleSubmit} className={'form-center'}>
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            placeholder="Name"
                            defaultValue={productToUpdateInfo.name}
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
                            type="text"
                            name="description"
                            placeholder="Description"
                            defaultValue={productToUpdateInfo.description}
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
                            type="text"
                            name="count"
                            placeholder="Quantity"
                            defaultValue={productToUpdateInfo.count}
                        />
                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                            Please enter Quantity.
                        </Form.Control.Feedback>
                        <br/>
                        <br/>
        
        
        
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                            type="text"
                            name="price"
                            placeholder="Price"
                            defaultValue={productToUpdateInfo.price}
                        />
                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                            Please enter Price.
                        </Form.Control.Feedback>
                        <br/>
                        <br/>
        
        
        
                        <Form.Label>Image</Form.Label>
                        <Form.Control
                            type="text"
                            name="image"
                            placeholder="Image"
                            defaultValue={productToUpdateInfo.image}
                        />
                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                            Please enter Image.
                        </Form.Control.Feedback>
                        <br/>
                        <br/>


                        <select value={selected_manufacturer} onChange={changeManufacturer}>
                            {options}
                        </select>
                        <br/>
                        <br/>
        
                        <Button variant="primary" type="submit">
                            Update product
                        </Button>
                    </Form>
                </div>
            </div>
        );
    }
}

export default UpdateProduct;