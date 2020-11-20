const AllCartProducts = (cart_id, cart_products_data) => async (dispatch) => {
    console.log('AllCartProducts action');
    console.log(cart_id);
    console.log(cart_products_data);
    dispatch({type : 'ADD_ALL_PRODUCTS_TO_CART', data: {cart_id, cart_products_data}});
}

export {AllCartProducts}