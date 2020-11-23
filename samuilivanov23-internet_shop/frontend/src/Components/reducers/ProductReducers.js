function productReducer(state = {}, action){
    switch(action.type){
        case 'SET_PRODUCT_DETAILS':
            return { productInfo : action.data };
        
        case 'SET_SELECTED_COUNT':
            let new_product_details = state.productInfo;
            new_product_details.selected_count = action.data.selected_count;
            return {productInfo : new_product_details};

        default:
            return state;
    }
}

export { productReducer }