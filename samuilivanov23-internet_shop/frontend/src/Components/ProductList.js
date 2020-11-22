import '../App.css';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Button } from '../../node_modules/react-bootstrap';
import { BrowserRouter as Router, Switch, Route, Link } from '../../node_modules/react-router-dom';
import { SetProductDetails } from './actions/ProductActions';


function ProductList (props) {
    const dispatch = useDispatch();

    const getCurrentProduct = (current_product) => {
        dispatch(SetProductDetails(current_product['id'], 
                                    current_product['name'], 
                                    current_product['description'], 
                                    current_product['price'], 
                                    current_product['selected_count'],
                                    current_product['count']));
        
        props.history.push(`/products/${current_product['id']}`);
    }

    return (
        <Router>
            <div className={"App"} style={{display : 'flex', flexDirection : 'row', flex : 1, flexWrap : 'wrap'}}>
                {props.products.map(product => (
                    <div key={product['id']} className={'product-card'}>
                        <Card style={{ width: '18rem' }}>
                            <Card.Body>
                                <Card.Title>Name: {product['name']}</Card.Title>

                                <Card.Text>Description: {product['description']}</Card.Text>
                                <Card.Text>Price: {product['price']} BGN.</Card.Text>

                                <Button>
                                    <Link style={{color:'white'}} to={`/products/${product['id']}`} onClick={() => getCurrentProduct(product)}>
                                        Veiw details
                                    </Link>
                                </Button>             
                            </Card.Body>
                        </Card>
                    </div>
                ))}
            </div>
        </Router>
    );
}

export default ProductList;