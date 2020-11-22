const SetProductDetails = (id, name, description, price, selected_count, count) => async(dispatch)  => {
    console.log('SetProductDetails action');
    dispatch({type : 'SET_PRODUCT_DETAILS', data : { id, name, description, price, selected_count, count }});
}

export { SetProductDetails }