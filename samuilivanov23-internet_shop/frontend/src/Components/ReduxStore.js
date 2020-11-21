import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { signInUserReducer } from './reducers/UserReducers';
import { AllCartProductsReducer } from './reducers/CartReducers';

//Set initial redux state
const userInfo = {
    username : 'init',
    email_address : 'init',
    cart_id : 0,
};

const cartInfo = []

const initial_state = { signInUser : {userInfo}, cartProducts : {cartInfo}};

const reducer = combineReducers({
    signInUser : signInUserReducer,
    cartProducts : AllCartProductsReducer,
});

const store = createStore(
    reducer,
    initial_state,
    applyMiddleware(thunk)
);

export default store;