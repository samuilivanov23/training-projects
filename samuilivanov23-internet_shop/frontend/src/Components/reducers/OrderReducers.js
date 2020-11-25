function orderReducer(state = {}, action){
    switch(action.type){
        case 'ADD_ORDER_DATA':
            return { orderInfo : action.data};
        default:
            return state;
    }
}

export { orderReducer }