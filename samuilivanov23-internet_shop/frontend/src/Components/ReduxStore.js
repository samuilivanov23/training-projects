import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { signInUserReducer } from './reducers/UserReducers';
import { cartReducer } from './reducers/CartReducers';
import { productReducer } from './reducers/ProductReducers';

//Set initial redux state
const userInfo = {
    username : 'init',
    email_address : 'init',
    cart_id : 0,
};

const cartInfo = [];

const productInfo = {
    id : 0,
    name : 'init',
    description : 'init',
    price : 0,
    selected_count : 0,
    count : 0,
}

const initial_state = { signInUser : {userInfo}, cartProducts : {cartInfo}, productDetails : {productInfo}};

const reducer = combineReducers({
    signInUser : signInUserReducer,
    cartProducts : cartReducer,
    productDetails : productReducer,
});

const store = createStore(
    reducer,
    initial_state,
    applyMiddleware(thunk)
);

export default store;