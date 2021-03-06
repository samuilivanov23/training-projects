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
import Payment from './Components/Payment';
import ProductsCRUD from './Backoffice_Components/ProductsCRUD/ProductsCRUD';
import CreateProduct from './Backoffice_Components/ProductsCRUD/CreateProduct';
import UpdateProduct from './Backoffice_Components/ProductsCRUD/UpdateProduct';
import OrdersCRUD from './Backoffice_Components/OrdersCRUD/OrdersCRUD';
import CreateOrder from './Backoffice_Components/OrdersCRUD/CreateOrder';
import ProductDetailsBackoffice from './Backoffice_Components/OrdersCRUD/ProductDetailsBackoffice';
import CartProductListBackoffice from './Backoffice_Components/OrdersCRUD/CartProductListBackOffice';
import ChooseProductsBackoffice from './Backoffice_Components/OrdersCRUD/ChooseProductsBackoffice';
import UsersList from './Backoffice_Components/OrdersCRUD/ChooseOrderCustomer';

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
      <Route path={"/shop/payment"} render={(props) => <Payment {...props} />} />


      <Route path={"/backoffice"} render={(props) => <NavigationBarBackoffice {...props}/>} />
      <Route exact path={"/backoffice"} render={(props) => <BackofficeHome {...props}/>} />
      <Route path={"/backoffice/login"} render={(props) => <LoginEmployee {...props}/>} />
      <Route path={"/backoffice/cart"} render={(props) => <CartProductListBackoffice {...props}/>} />
      <Route exact path={"/backoffice/employees"} render={(props) => <EmployeesCRUD {...props}/>} />
      <Route path={"/backoffice/employees/create"} render={(props) => <CreateEmployee {...props}/>} />
      <Route path={"/backoffice/employees/update/:id"} render={(props) => <UpdateEmployee {...props}/>} />   
      <Route exact path={"/backoffice/products"} render={(props) => <ProductsCRUD {...props}/>} />
      <Route path={"/backoffice/products/create"} render={(props) => <CreateProduct {...props}/>} />
      <Route path={"/backoffice/products/update/:id"} render={(props) => <UpdateProduct {...props}/>} />
      <Route exact path={"/backoffice/orders"} render={(props) => <OrdersCRUD {...props}/>} />
      <Route exact path={"/backoffice/orders/products"} render={(props) => <ChooseProductsBackoffice {...props} per_page={20}/>} />
      <Route path={"/backoffice/orders/choose-customer"} render={(props) => <UsersList {...props}/>} />
      <Route path={"/backoffice/orders/products/:id"} render={(props) => <ProductDetailsBackoffice {...props}/>} />
      <Route path={"/backoffice/orders/create"} render={(props) => <CreateOrder {...props}/>} />
    </div>
  );
}

export default App;