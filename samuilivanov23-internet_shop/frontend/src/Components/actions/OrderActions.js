const AddOrderData = (order_data) => async (dispatch) => {
    console.log('AddOrderData action');

    dispatch({'type' : 'ADD_ORDER_DATA', data : order_data});
}

export { AddOrderData }