import '../../App.css';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { SetProductDetails } from '../../Components/actions/ProductActions';
import { useHistory } from 'react-router-dom';

function ProductListBackoffice (props) {

    const history = useHistory();
    const dispatch = useDispatch();

    const getCurrentProduct = (current_product) => {
        dispatch(SetProductDetails(current_product['id'],
                                    current_product['name'],
                                    current_product['description'],
                                    current_product['price'],
                                    current_product['selected_count'],
                                    current_product['count'],
                                    current_product['image']));

        history.push(`/backoffice/orders/products/${current_product['id']}`);
    }

    return (
        <div className={"App"} style={{display : 'flex', flexDirection : 'row', flex : 1, flexWrap : 'wrap'}}>
            {props.products.map(product => (
                <div key={product['id']} className={'product-card per-grid-card'}>
                    <Card>
                        <Card.Img variant="top" src={`/images/${product['image']}`} alt={`${product['name']}`}/>
                        <Card.Body>
                            <Card.Title>{product['name']}</Card.Title>

                            <Card.Text style={{position:'relative'}} className={"truncate-overflow"}>{product['description']}</Card.Text>
                            <Card.Text>Price: {product['price']} BGN.</Card.Text>

                            <Button>
                                <Link style={{color:'white'}} to={`/backoffice/orders/products/${product['id']}`} onClick={() => getCurrentProduct(product)}>
                                    Veiw details
                                </Link>
                            </Button>  
                        </Card.Body>
                    </Card>
                </div>
            ))}
        </div>        
    );
}

export default ProductListBackoffice;