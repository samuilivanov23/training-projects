const AllCartProducts = (cart_products_data) => async (dispatch) => {
    console.log('AllCartProducts action');
    dispatch({type : 'ADD_ALL_PRODUCTS_TO_CART', data: cart_products_data});
}

const AddProductToCart = (id, name, description, price, selected_count) => async (dispatch) => {
    console.log('AddProductToCart action');

    dispatch( { type : 'ADD_PRODUCT_TO_CART', 
                data: {
                    id, 
                    name, 
                    description, 
                    price, 
                    selected_count
                }
    });
}

export { AllCartProducts, AddProductToCart }