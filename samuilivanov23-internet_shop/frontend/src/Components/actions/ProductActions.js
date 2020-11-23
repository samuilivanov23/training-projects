const SetProductDetails = (id, name, description, price, selected_count, count) => async(dispatch)  => {
    console.log('SetProductDetails action');
    dispatch({type : 'SET_PRODUCT_DETAILS', data : { id, name, description, price, selected_count, count }});
}

const SetSelectedCount = (selected_count) => async(dispatch) => {
    console.log('SetSelectedCount action');
    dispatch({type : 'SET_SELECTED_COUNT', data: {selected_count}});
}

export { SetProductDetails, SetSelectedCount }