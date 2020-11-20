function AllCartProductsReducer(state = {}, action){
    switch(action.type){
        case 'ADD_ALL_PRODUCTS_TO_CART':
            return {cartInfo : action.data};
        default:
            return state;
    }
}

export {AllCartProductsReducer}