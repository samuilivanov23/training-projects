import './App.css';
import React from 'react';
import { useSelector } from 'react-redux'
import Home from './Components/Home';
import NavigationBar from './Components/NavigationBar';
import Register from './Components/Register';
import Login from './Components/Login';
import { Route, BrowserRouter as Router } from '../node_modules/react-router-dom';
import CartProductList from './Components/CartProductList';

function App (props) {
  return(
    <div>
      <Router>
        <Route path={"/"} render={(props) => <NavigationBar/>} />
        <Route path={"/products"} render={(props) => <Home per_page={20}/>} />
        <Route path={"/register"} render={(props) => <Register {...props}/>} />
        <Route path={"/login"} render={(props) => <Login {...props} />} />
        <Route path={"/cart"} render={(props) => <CartProductList {...props} />} />
      </Router>      
    </div>
  );
}

export default App;