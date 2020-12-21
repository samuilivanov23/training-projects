import '../../App.css';
import React from 'react';
import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import JsonRpcClient from 'react-jsonrpc-client';

function CreateEmployee(props){

    const [validated, setValidated] = useState(false);
    const [input_fields, set_input_fields] = useState({});
    const [input_errors, set_input_errors] = useState({});

    var permissions_selected = [];

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
        console.log(permissions_selected);
    };

    const clearPermissions = () => {
        permissions_selected = [];
    };

    const checkFormValidation = (event) => {
        let fields = input_fields;
        let errors = {};
        let formIsValid = true;

        //first name validation
        if(!fields["first_name"]){
            formIsValid = false;
            errors["first_name"] = "First name can't be empty";
        }

        if(typeof fields["first_name"] !== "undefined"){
            if(!fields["first_name"].match(/^[a-zA-Z]+$/)){
                formIsValid = false;
                errors["first_name"] = "Last name should contain only letters [a-ZA-Z]."
            }
        }

        //last_name validation
        if(!fields["last_name"]){
            formIsValid = false;
            errors["last_name"] = "Last name can't be empty";
        }

        if(typeof fields["last_name"] !== "undefined"){
            if(!fields["last_name"].match(/^[a-zA-Z]+$/)){
                formIsValid = false;
                errors["last_name"] = "Last name should contain only letters [a-ZA-Z]."
            }
        }

        //email validation
        if(!fields["email_address"]){
            formIsValid = false;
            errors["email_address"] = "Email address can't be empty";
        }

        if(typeof fields["email_address"] !== "undefined"){
            if(!fields["email_address"].match(/^[a-zA-Z0-9]+@(?:[a-zA-Z0-9]+[-_][a-zA-Z0-9]+\.)+[A-Za-z]+$/)){
                formIsValid = false;
                errors["email_address"] = "Email address should be as xxx@xxx.xx"
            }
        }

        //last_name validation
        if(!fields["password"]){
            formIsValid = false;
            errors["password"] = "Password can't be empty";
        }

        if(typeof fields["password"] !== "undefined"){
            if(!fields["password"].match(/^[a-zA-Z0-9]+$/)){
                formIsValid = false;
                errors["password"] = "Last name should contain only letters [a-ZA-Z]."
            }
        }

        //role name validation
        if(!fields["role_name"]){
            formIsValid = false;
            errors["role_name"] = "Role name can't be empty";
        }

        if(typeof fields["role_name"] !== "undefined"){
            if(!fields["role_name"].match(/^[a-zA-Z]+$/)){
                formIsValid = false;
                errors["role_name"] = "Role name should contain only letters [a-ZA-Z]."
            }
        }

        set_input_errors(errors);
        return formIsValid;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if(checkFormValidation()){
            insertEmployee(input_fields["first_name"],
                input_fields["last_name"],
                input_fields["email_address"],
                input_fields["password"],
                input_fields["role_name"],
                permissions_selected);

            alert('Form submitted');
        }
        else{
            alert('Form has errors');
        }
    };

    const handleChange = (event, field) => {
        let fields = input_fields;
        fields[field] = event.target.value;
        set_input_fields(fields);

        console.log(input_fields);
    };

    const insertEmployee = (first_name, last_name, email_address, password, role_name, permissions_selected) => {
        
        var django_rpc = new JsonRpcClient({
            endpoint: 'http://127.0.0.1:8000/backoffice/rpc/',
        });
      
        django_rpc.request(
            "CreateEmployee",
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
    
        options.push(<option key={'1'} value={'create_perm'}>create</option>);
        options.push(<option key={'2'} value={'read_perm'}>read</option>);
        options.push(<option key={'3'} value={'update_perm'}>update</option>);
        options.push(<option key={'4'} value={'delete_perm'}>delete</option>);

        return options;
    }

    const options = generateCountSelectElements();

    return (
        <div className={'form-container'}>
            <Form noValidate validated={validated} onSubmit={handleSubmit} className={'form-center'}>
                <Form.Label>First Name</Form.Label>
                <Form.Control
                    required
                    type="text"
                    name="first_name"
                    placeholder="First name"
                    defaultValue={input_fields["first_name"]}
                    onChange={ (event) => handleChange(event, "first_name")}
                />
                <Form.Text> Use characters [A-Z]/[a-z] </Form.Text>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">
                    Please enter First Name.
                </Form.Control.Feedback>
                <span style={{color: "red"}}>{input_errors["first_name"]}</span>
                <br/>
                <br/>



                <Form.Label>Last Name</Form.Label>
                <Form.Control
                    required
                    type="text"
                    name="last_name"
                    placeholder="Last name"
                    defaultValue={input_fields["last_name"]}
                    onChange={ (event) => handleChange(event, "last_name")}
                    className={'form-control'}
                />
                <Form.Text> Use characters [A-Z]/[a-z] </Form.Text>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">
                    Please enter Last Name.
                </Form.Control.Feedback>
                <span style={{color: "red"}}>{input_errors["last_name"]}</span>
                <br/>
                <br/>


                <Form.Label>Email address</Form.Label>
                <Form.Control
                    required
                    type="text"
                    name="email_address"
                    placeholder="Email address"
                    defaultValue={input_fields["email_address"]}
                    onChange={ (event) => handleChange(event, "email_address")}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">
                    Please enter email address.
                </Form.Control.Feedback>
                <span style={{color: "red"}}>{input_errors["email_address"]}</span>
                <br/>
                <br/>



                <Form.Label>Password</Form.Label>
                <Form.Control
                    required
                    type="password"
                    name="password"
                    placeholder="Password"
                    defaultValue={input_fields["password"]}
                    onChange={ (event) => handleChange(event, "password")}
                />
                <Form.Text> Use characters [A-Z]/[a-z][0-9] </Form.Text>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">
                    Please enter password.
                </Form.Control.Feedback>
                <span style={{color: "red"}}>{input_errors["password"]}</span>
                <br/>
                <br/>



                <Form.Label>Role name</Form.Label>
                <Form.Control
                    required
                    type="role_name"
                    name="role_name"
                    placeholder="Role name"
                    defaultValue={input_fields["role_name"]}
                    onChange={(event) => handleChange(event, "role_name")}
                />
                <Form.Text> Use characters [A-Z]/[a-z] </Form.Text>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">
                    Please enter role name.
                </Form.Control.Feedback>
                <span style={{color: "red"}}>{input_errors["role_name"]}</span>
                <br/>
                <br/>

                <Form.Label>Permissions</Form.Label>
                <select multiple={true} value={permissions_selected} onChange={changeSelectedPermissions}>
                    {options}
                </select>
                <Button style={{marginBottom : '5em', marginLeft : '1em'}}variant="primary" onClick={clearPermissions}>
                    Clear
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