import './App.css';
import React from 'react';
import Home from './Components/Home';
import NavigationBar from './Components/NavigationBar';
import NavigationBarBackoffice from './Backoffice_Components/NavigationBarBackoffice';
import Register from './Components/Register';
import Login from './Components/Login';
import { Route } from '../node_modules/react-router-dom';
import CartProductList from './Components/CartProductList';
import ProductDetails from './Components/ProductDetails';
import Confirm from './Components/Confirm';
import LoginEmployee from './Backoffice_Components/EmployeesCRUD/LoginEmployee';
import BackofficeHome from './Backoffice_Components/Home';
import PrivateReroute from './Components/PrivateReroute';
import EmployeesCRUD from './Backoffice_Components/EmployeesCRUD/EmployeesCRUD';
import CreateEmployee from './Backoffice_Components/EmployeesCRUD/CreateEmployee';
import UpdateEmployee from './Backoffice_Components/EmployeesCRUD/UpdateEmployee';

function App (props) {

  return(
    <div>
      <PrivateReroute {...props}/>
      <Route path={"/shop"} render={(props) => <NavigationBar {...props}/>} />
      <Route exact path={"/shop/products"} render={(props) => <Home {...props} per_page={20}/>} />
      <Route path={"/shop/products/:id"} render={(props) => <ProductDetails {...props} />} />
      <Route path={"/shop/register"} render={(props) => <Register {...props}/>} />
      <Route path={"/shop/login"} render={(props) => <Login {...props} />} />
      <Route path={"/shop/cart"} render={(props) => <CartProductList {...props} />} />
      <Route path={"/shop/confirm/:id"} render={(props) => <Confirm {...props}/>}/>


      <Route path={"/backoffice"} render={(props) => <NavigationBarBackoffice {...props}/>} />
      <Route exact path={"/backoffice"} render={(props) => <BackofficeHome {...props}/>} />
      <Route path={"/backoffice/login"} render={(props) => <LoginEmployee {...props}/>} />
      <Route exact path={"/backoffice/employees"} render={(props) => <EmployeesCRUD {...props}/>} />
      <Route path={"/backoffice/employees/create"} render={(props) => <CreateEmployee {...props}/>} />
      <Route path={"/backoffice/employees/update/:id"} render={(props) => <UpdateEmployee {...props}/>} />   
    </div>
  );
}

export default App;