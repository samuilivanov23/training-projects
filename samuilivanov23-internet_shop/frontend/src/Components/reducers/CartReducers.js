function cartReducer(state = {}, action){
    switch(action.type){
        case 'ADD_ALL_PRODUCTS_TO_CART':
            return {cartInfo : action.data};

        case 'ADD_PRODUCT_TO_CART':
            return {cartInfo : [...state.cartInfo, action.data]};

        default:
            return state;
    }
}

export { cartReducer }