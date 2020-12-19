const SetProductDetails = (id, name, description, price, selected_count, count, image) => async(dispatch)  => {
    console.log('SetProductDetails action');
    dispatch({type : 'SET_PRODUCT_DETAILS', data : { id, name, description, price, selected_count, count, image }});
}

const SetSelectedCount = (selected_count) => async(dispatch) => {
    console.log('SetSelectedCount action');
    selected_count = parseInt(selected_count);
    dispatch({type : 'SET_SELECTED_COUNT', data: {selected_count}});
}

const SetProductToUpdateDetails = (id, name, description, count, price, image,  manufacturer_name, manufacturer_id) => async(dispatch) => {
    console.log('SetProductToUpdateDetails action');
    dispatch({type : 'SET_PRODUCT_TO_UPDATE_DETAILS', data : {id, name, description, count, price, image, manufacturer_name, manufacturer_id}});
}

export { SetProductDetails, SetSelectedCount, SetProductToUpdateDetails }