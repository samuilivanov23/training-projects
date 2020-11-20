import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { signInUserReducer } from './reducers/UserReducers';

//Set initial redux state
const userInfo = {
    // id : '',
    // first_name : 'Adam',
    // last_name : 'Nagaiti',
    username : 'init',
    email_address : 'init',
    cart_id : 0,
};

const initial_state = { signInUser : {userInfo} };

const reducer = combineReducers({
    signInUser : signInUserReducer,
});

const store = createStore(
    reducer,
    initial_state,
    applyMiddleware(thunk)
);

export default store;