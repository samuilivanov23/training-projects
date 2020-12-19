import '../../App.css';
import React from 'react';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { Form, Button } from '../../../node_modules/react-bootstrap';
import JsonRpcClient from '../../../node_modules/react-jsonrpc-client/jsonrpcclient';
import { useHistory } from '../../../node_modules/react-router-dom';

function UpdateEmployee (props) {

    const [validated, setValidated] = useState(false);
    const history = useHistory();

    const { employeeToUpdateInfo } = useSelector(state=>state.employeeToUpdate);

    var permissions_selected = Object.keys(employeeToUpdateInfo.permissions);
    console.log(employeeToUpdateInfo);
    console.log(permissions_selected);

    const changeSelectedPermissions = (event) => {
        if(!permissions_selected.includes(event.target.value)){
            //add permission
            permissions_selected.push(event.target.value);
        }
        else{
            //remove permission
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
        console.log('change');
        console.log(permissions_selected);
    };

    const clearPermissions = () => {
        permissions_selected = [];
        console.log('clear');
        console.log(permissions_selected);
    };


    const handleSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const form_data = event.currentTarget;
        const employee_to_update_id = parseInt(history.location.pathname.slice(-1));

        if (form_data.checkValidity() === false) {
            alert('Plese fill all input fileds!');
        }
        else{            
            updateEmployee(employee_to_update_id,
                        form_data.first_name.value,
                        form_data.last_name.value,
                        form_data.email_address.value,
                        form_data.password.value,
                        form_data.role_name.value,
                        permissions_selected);
        }

        setValidated(true);  
    };

    const updateEmployee = (id, first_name, last_name, email_address, password, role_name, permissions) => {
        var django_rpc = new JsonRpcClient({
            endpoint : 'http://127.0.0.1:8000/backoffice/rpc/',
        });

        django_rpc.request(
            "UpdateEmployee",
            id,
            first_name,
            last_name,
            email_address,
            password,
            role_name,
            permissions,
        ).then(function(response){
            response = JSON.parse(response);
            alert(response['msg'])
            props.history.push('/backoffice/employees');
        }).catch(function(error){
            alert(error['msg']);
        });
    }

    const generateCountSelectElements = () => {
        const options = [];
    
        options.push(<option key={'1'} value={'create_perm'}>create</option>);
        options.push(<option key={'2'} value={'read_perm'}>read</option>);
        options.push(<option key={'3'} value={'update_perm'}>update</option>);
        options.push(<option key={'4'} value={'delete_perm'}>delete</option>);

        return options;
    }

    const options = generateCountSelectElements();

    return (
        <div>
            <div>
                <h1 style={{marginLeft : '40%'}}>Edit Employee {employeeToUpdateInfo.first_name}</h1>
            </div>

            <div className={'form-container'}>
                <Form noValidate validated={validated} onSubmit={handleSubmit} className={'form-center'}>
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="first_name"
                        placeholder="First name"
                        defaultValue={employeeToUpdateInfo.first_name}
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
                        type="text"
                        name="last_name"
                        placeholder="Last name"
                        defaultValue={employeeToUpdateInfo.last_name}
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
                        type="text"
                        name="email_address"
                        placeholder="Email address"
                        defaultValue={employeeToUpdateInfo.email_address}
                    />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                        Please enter email address.
                    </Form.Control.Feedback>
                    <br/>
                    <br/>



                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        name="password"
                        placeholder="Password"
                        defaultValue=""
                    />
                    <br/>
                    <br/>



                    <Form.Label>Role name</Form.Label>
                    <Form.Control
                        type="text"
                        name="role_name"
                        placeholder="Role name"
                        defaultValue={employeeToUpdateInfo.role_name}
                    />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                        Please enter role name.
                    </Form.Control.Feedback>
                    <br/>
                    <br/>

                    <select multiple={true} value={permissions_selected} onChange={changeSelectedPermissions}>
                        {options}
                    </select>
                    <Button style={{marginBottom : '5em', marginLeft : '1em'}}variant="primary" onClick={clearPermissions}>
                        Clear
                    </Button>
                    <br/>
                    <br/>

                    <Button variant="primary" type="submit">
                        Update employee
                    </Button>
                </Form>
            </div>
        </div>
    );
}

export default UpdateEmployee;