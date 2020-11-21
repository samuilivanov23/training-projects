function AllCartProductsReducer(state = {}, action){
    switch(action.type){
        case 'ADD_ALL_PRODUCTS_TO_CART':
            return {cartInfo : action.data};

        case 'ADD_PRODUCT_TO_CART':
            const product_to_add = action.data;
            console.log('action data');
            console.log(action.data);
            console.log('state');
            console.log(state.cartInfo);
            // const check_product_added = state.cartInfo.cart_products_data.find(p=>p.product_id === product_to_add.product_id);
            
            // //To not add the product when it is alreadid in the cart
            // if(check_product_added){
            //     return state;
            // }

            return {cartInfo : [...state.cartInfo, product_to_add]};

        default:
            return state;
    }
}

export { AllCartProductsReducer }