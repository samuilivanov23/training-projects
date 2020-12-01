import './App.css';
import React from 'react';
import Home from './Components/Home';
import NavigationBar from './Components/NavigationBar';
import Register from './Components/Register';
import Login from './Components/Login';
import { Route, BrowserRouter as Router } from '../node_modules/react-router-dom';
import CartProductList from './Components/CartProductList';
import ProductDetails from './Components/ProductDetails';
import Confirm from './Components/Confirm';
import LoginEmployee from './Backoffice_Components/LoginEmployee';
import BackofficeHome from './Backoffice_Components/Home';

function App (props) {
  return(
    <div>
      <Router>
        <Route path={"/"} render={(props) => <NavigationBar {...props}/>} />
        <Route exact path={"/products"} render={(props) => <Home {...props} per_page={20}/>} />
        <Route path={"/products/:id"} render={(props) => <ProductDetails {...props} />} />
        <Route path={"/register"} render={(props) => <Register {...props}/>} />
        <Route path={"/login"} render={(props) => <Login {...props} />} />
        <Route path={"/cart"} render={(props) => <CartProductList {...props} />} />
        <Route path={"/confirm/:id"} render={(props) => <Confirm {...props}/>}/>
        
        
        <Route exact path={"/backoffice"} render={(props) => <BackofficeHome {...props}/>} />
        <Route path={"/backoffice/login"} render={(props) => <LoginEmployee {...props}/>} />
      </Router>      
    </div>
  );
}

export default App;