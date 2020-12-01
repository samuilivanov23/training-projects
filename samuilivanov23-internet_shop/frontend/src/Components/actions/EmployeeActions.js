const SignInEmployee = (id, email_address, role_id) => async (dispatch) => {
    console.log('SignInEmployee action');
    dispatch({type : 'EMPLOYEE_SIGNIN', data : {id, email_address, role_id}});
}

export { SignInEmployee };