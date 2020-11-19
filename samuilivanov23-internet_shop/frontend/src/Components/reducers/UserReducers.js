function signInUserReducer(state = {}, action){
    switch(action.type){
        case 'USER_SIGNIN':
            return {userInfo : action.data};
        default:
            return state;
    }
}

export {signInUserReducer}