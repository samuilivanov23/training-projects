function employeeReducer(state = {}, action){
    switch(action.type){
        case 'EMPLOYEE_SIGNIN':
            return { employeeInfo : action.data };

        case 'EMPLOYEE_LOGOUT':
            return {employeeInfo : action.data}
        
        default:
            return state;
    }
};

function employeeUpdateReducer(state = {}, action){
    switch(action.type){
        case 'SET_EMPLOYEE_TO_UPDATE_DETAILS':
            return { employeeToUpdateInfo : action.data};

        default:
            return state;
    }
};

export { employeeReducer, employeeUpdateReducer };