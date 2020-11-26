function cartReducer(state = {}, action){
    switch(action.type){
        case 'ADD_ALL_PRODUCTS_TO_CART':
            return {cartInfo : action.data};

        case 'ADD_PRODUCT_TO_CART':
            return {cartInfo : [...state.cartInfo, action.data]};

        case 'CHANGE_SELECTED_COUNT':
            const changed_product = action.data;
            return {cartInfo : state.cartInfo.map(p => p.id === changed_product.id?changed_product:p)}

        case 'EMPTY_CAR':
            return {cartInfo : action.data}
        
        default:
            return state;
    }
}

export { cartReducer }