const SignInEmployee = (id, email_address, permissions) => async (dispatch) => {
    console.log('SignInEmployee action');
    dispatch({type : 'EMPLOYEE_SIGNIN', data : {id, email_address, permissions}});
}

const LogoutEmployee = () => async (dispatch) => {
    console.log("LogoutEmployee action");
    
    const employeeInfo = {
        id : 0,
        email_address : 'init',
        permissions : {},
    };

    dispatch({type : 'EMPLOYEE_LOGOUT', data : { employeeInfo }});
}

export { SignInEmployee, LogoutEmployee };