import '../App.css';
import React from 'react';
import { useSelector } from 'react-redux';

function Home(props){

    const { employeeInfo } = useSelector(state=>state.employee);
    console.log(employeeInfo);

    //check if any employee has logged in
    //if not - redirect to LoginEmployee component
    if(employeeInfo.email_address === 'init'){
        alert('Log in as employee');
        props.history.push('/backoffice/login');
    }

    return(
        <div>
            {employeeInfo.email_address}
        </div>
    );

}

export default Home;