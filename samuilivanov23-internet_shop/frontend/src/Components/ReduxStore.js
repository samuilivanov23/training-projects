import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { signInUserReducer } from './reducers/UserReducers';
import { cartReducer } from './reducers/CartReducers';
import { productReducer, productUpdateReducer } from './reducers/ProductReducers';
import { orderReducer } from './reducers/OrderReducers';
import { employeeReducer, employeeUpdateReducer } from './reducers/EmployeeReducers';

//Set initial redux state
const userInfo = {
    id : 0,
    username : 'init',
    email_address : 'init',
    cart_id : 0,
};

const employeeInfo = {
    id : 0,
    email_address : 'init',
    permissions : {},
};

const employeeToUpdateInfo = {
    first_name : 'init',
    last_name : 'init',
    email_address : 'init',
    role_name : 'init',
    permissions : {},
};

const cartInfo = [];

const productInfo = {
    id : 0,
    name : 'init',
    description : 'init',
    price : 0,
    selected_count : 0,
    count : 0,
    image : 'init'
};

const productToUpdateInfo = {
    name : 'init',
    description : 'init',
    count : 0,
    price : 0,
    image : 'init',
    manufacturer_id : 0
}

const orderInfo = {
    id : 0,
    user_id : 0,
    total_price : 0,
    products : []
};

const initial_state = { 
    signInUser : {userInfo}, 
    employee : {employeeInfo}, 
    employeeToUpdate : {employeeToUpdateInfo}, 
    cartProducts : {cartInfo}, 
    productDetails : {productInfo},
    productToUpdate : {productToUpdateInfo},
    orderProducts : {orderInfo}
};

const reducer = combineReducers({
    signInUser : signInUserReducer,
    employee : employeeReducer,
    employeeToUpdate : employeeUpdateReducer,
    cartProducts : cartReducer,
    productDetails : productReducer,
    productToUpdate : productUpdateReducer,
    orderProducts : orderReducer,
});

const store = createStore(
    reducer,
    initial_state,
    applyMiddleware(thunk)
);

export default store;