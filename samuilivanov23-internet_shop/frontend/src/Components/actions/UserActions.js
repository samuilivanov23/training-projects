const SignIn = (id, username, email_address, cart_id) => async (dispatch) => {
    console.log('SignIn action');
    dispatch({type : 'USER_SIGNIN', data: {id, username, email_address, cart_id}});
}

const LogoutUser = () => async (dispatch) => {
    console.log('LogoutUser action');

    //Set initial redux state
    const userInfo = {
        id : 0,
        username : 'init',
        email_address : 'init',
        cart_id : 0,
    };

    dispatch({type : 'USER_LOGOUT', data : { userInfo }});
}

export { SignIn, LogoutUser }