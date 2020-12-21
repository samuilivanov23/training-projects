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

function userBackofficeOrderReducer(state = {}, action){
    switch(action.type){
        case 'ASSIGN_USER_BACKOFFICE_ORDER':
            return {userBackofficeInfo : action.data}
        
        default:
            return state;
    }
}

export {signInUserReducer, userBackofficeOrderReducer }