const SignIn = (id, first_name, last_name, email_address) => (dispatch) => {
    console.log('SignIn action');
    console.log(id, first_name, last_name, email_address);
    dispatch({type : 'USER_SIGNIN', data: {id, first_name, last_name, email_address}});
}

export {SignIn}