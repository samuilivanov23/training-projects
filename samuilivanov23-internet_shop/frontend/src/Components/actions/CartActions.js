const AllCartProducts = (cart_products_data) => async (dispatch) => {
    console.log('AllCartProducts action');
    dispatch({type : 'ADD_ALL_PRODUCTS_TO_CART', data: cart_products_data});
}

const AddProductToCart = (id, name, description, price, selected_count, count, image) => async (dispatch) => {
    console.log('AddProductToCart action');
    
    selected_count = parseInt(selected_count);
    dispatch( { type : 'ADD_PRODUCT_TO_CART', 
                data: {
                    id, 
                    name, 
                    description, 
                    price, 
                    selected_count,
                    count,
                    image
                }
    });
}

const ChangeSelectedCount = (id, name, description, price, selected_count, count, image) => async(dispatch) => {
    console.log('ChangeSelectedCount action');

    selected_count = parseInt(selected_count);
    dispatch({type : 'CHANGE_SELECTED_COUNT', data : {id, name, description, price, selected_count, count, image}});
}

export { AllCartProducts, AddProductToCart, ChangeSelectedCount }