import '../App.css';
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Button } from '../../node_modules/react-bootstrap';
import JsonRpcClient from '../../node_modules/react-jsonrpc-client/jsonrpcclient';

function CreateEmployee(props){

    const [validated, setValidated] = useState(false);
    //const [permissions_selected, set_permissions_selected] = useState([]);
    var permissions_selected = [];

    const changeSelectedPermissions = (event) => {
        if(!permissions_selected.includes(event.target.value)){
            //add permission
            console.log('not');
            permissions_selected.push(event.target.value);
        }
        else{
            //remove permission
            console.log('in');
            if(permissions_selected.length === 1){
                permissions_selected.pop();
            }
            else{
                const index = permissions_selected.indexOf(event.target.value);
                if(index >= -1 ){ // => the element exists  
                    permissions_selected.splice(index, 1);
                }
            }
        }
        console.log(permissions_selected);
    };

    const clearPermissions = () => {
        alert('test');
        permissions_selected = [];
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const form_data = event.currentTarget;

        console.log(form_data.create.value);

        // if (form_data.checkValidity() === false) {
        //     alert('Plese fill all input fileds!');
        // }
        // else{
        //     console.log('Creating employee');
            
        //     insertEmployee(form_data.first_name.value,
        //                 form_data.last_name.value,
        //                 form_data.email_address.value,
        //                 form_data.password.value,
        //                 form_data.role_name.value,
        //                 permissions_selected);
        // }

        setValidated(true);  
    };

    const insertEmployee = (first_name, last_name, email_address, password, role_name, permissions_selected) => {
        var django_rpc = new JsonRpcClient({
            endpoint: 'http://127.0.0.1:8000/shop/rpc/',
        });
      
        django_rpc.request(
            "CreateUser",
            first_name,
            last_name,
            email_address,
            password,
            role_name,
            permissions_selected,
        ).then(function(response){
            response = JSON.parse(response);
            alert(response['msg'])
            
            props.history.push('/backoffice/employees');

        }).catch(function(error){
            alert(error['msg'])
        });
    }

    const generateCountSelectElements = () => {
        const options = [];
    
        options.push(<option key={'1'} value={'create'}>create</option>);
        options.push(<option key={'2'} value={'read'}>read</option>);
        options.push(<option key={'3'} value={'update'}>update</option>);
        options.push(<option key={'4'} value={'delete'}>delete</option>);

        return options;
    }

    const options = generateCountSelectElements();

    console.log(permissions_selected);

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



                <Form.Label>Role name</Form.Label>
                <Form.Control
                    required
                    type="role_name"
                    name="role_name"
                    placeholder="Role name"
                    defaultValue=""
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">
                    Please enter role name.
                </Form.Control.Feedback>
                <br/>
                <br/>


                <Form.Check name="create" label="create" type={"checkbox"}/>
                <Form.Check name="read" label="read" type={"checkbox"}/>
                <Form.Check name="update" label="update" type={"checkbox"}/>
                <Form.Check name="delete" label="delete" type={"checkbox"}/>



                <select multiple={true} value={permissions_selected} onChange={changeSelectedPermissions}>
                    {options}
                </select>
                <Button style={{marginBottom : '5em', marginLeft : '1em'}}variant="primary" onClick={clearPermissions}>
                    Create employee
                </Button>
                <br/>
                <br/>

                <Button variant="primary" type="submit">
                    Create employee
                </Button>
            </Form>
        </div>
    );
}

export default CreateEmployee;