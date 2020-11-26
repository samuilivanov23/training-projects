function signInUserReducer(state = {}, action){
    switch(action.type){
        case 'USER_SIGNIN':
            return {userInfo : action.data};
        
        case 'USER_LOGOUT':
            return {userInfo : action.data.userInfo};

        default:
            return state;
    }
}

export {signInUserReducer}