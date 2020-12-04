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

const SetEmployeeToUpdateDetails = (first_name, last_name, email_address, role_name, permissions) => async(dispatch) => {
    console.log('SetEmployeeToUpdateDetails action');
    
    dispatch( { type : 'SET_EMPLOYEE_TO_UPDATE_DETAILS', 
                data : {
                    first_name, 
                    last_name, 
                    email_address, 
                    role_name, 
                    permissions
    }});
};

export { SignInEmployee, LogoutEmployee, SetEmployeeToUpdateDetails };