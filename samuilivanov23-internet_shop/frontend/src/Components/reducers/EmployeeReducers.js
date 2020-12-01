function employeeReducer(state = [], action){
    switch(action.type){
        case 'EMPLOYEE_SIGNIN':
            return { employeeInfo : action.data };
        
        default:
            return state;

    }
}

export { employeeReducer };