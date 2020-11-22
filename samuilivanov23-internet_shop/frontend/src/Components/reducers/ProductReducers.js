function productReducer(state = {}, action){
    switch(action.type){
        case 'SET_PRODUCT_DETAILS':
            return { productInfo : action.data };
        default:
            return state;
    }
}

export { productReducer }