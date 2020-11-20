const SignIn = (username, email_address, cart_id) => async (dispatch) => {
    console.log('SignIn action');
    console.log(email_address);
    dispatch({type : 'USER_SIGNIN', data: {username, email_address, cart_id}});
}

export {SignIn}