const SignIn = (id, username, email_address, cart_id) => async (dispatch) => {
    console.log('SignIn action');
    dispatch({type : 'USER_SIGNIN', data: {id, username, email_address, cart_id}});
}

export {SignIn}