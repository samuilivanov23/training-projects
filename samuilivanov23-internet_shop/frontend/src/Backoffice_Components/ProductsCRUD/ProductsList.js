import '../../App.css';
import React from 'react';
import JsonRpcClient from 'react-jsonrpc-client';
import { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Container } from 'react-bootstrap';
import { SetProductToUpdateDetails } from '../../Components/actions/ProductActions';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useHistory } from '../../../node_modules/react-router-dom';

function ProductsList (props){

    const [products, set_products] = useState([]);
    const { employeeInfo } = useSelector(state=>state.employee);
    const dispatch = useDispatch();
    const history = useHistory();

    useEffect(() => {
        loadProducts();
    }, [])

    const loadProducts = () => {
        const django_rpc = new JsonRpcClient({
            endpoint : 'http://127.0.0.1:8000/backoffice/rpc/',
        });

        django_rpc.request(
            'GetProductsBackoffice',
        ).then(function(response){
            //response = JSON.parse(response);
            set_products(response.products);
            console.log(response);
            alert(response.msg);
        }).catch(function(error){
            alert(error['msg']);
        });
    }

    const getCurrentProduct = (current_product) => {
        console.log('testiiiiing');
        dispatch(SetProductToUpdateDetails(
            current_product.id,
            current_product.name,
            current_product.description,
            current_product.count,
            current_product.price,
            current_product.image,
            current_product.manufacturer_id
        ));
    }

    const deleteProduct = (id) => {
        const django_rpc = new JsonRpcClient({
            endpoint : 'http://127.0.0.1:8000/backoffice/rpc/',
        });

        django_rpc.request(
            'DeleteProduct',
            id,
        ).then(function(response){
            response = JSON.parse(response);
            alert(response['msg']);
            loadProducts();
        }).catch(function(error){
            alert(error['msg']);
        });
    }

    if(typeof(products) === 'undefined'){
        return(
            <div>Loading...</div>
        );
    }    
    else{
        return(
            <div className={"App"} style={{display : 'flex', flexDirection : 'row', flex : 1, flexWrap : 'wrap'}}>
                {products.map((product, idx) => (
                    <Card key={idx} style={{ width: '80rem', margin: '1em' }}>
                        <Container style={{ width: '80rem', margin: '1em' }}>
                            <Row>
                                <Col>
                                    <Card.Img className={'product-image-style'} variant="left" src={`/images/${product.image}`} alt={`${product.name}`} />
                                </Col>
                                
                                <Col>
                                    <Card.Title>
                                        <Link style={{'textDecoration' : 'none', 'color' : 'black'}} to={`/shop/products/${product.id}`} onClick={() => getCurrentProduct(product)}>
                                            {product.name}
                                        </Link>
                                    </Card.Title>
                                </Col>
            
                                <Col>
                                    <Card.Text>{product.description}</Card.Text>
                                </Col>

                                <Col>
                                    <Card.Text>Quantity : {product.count}</Card.Text>
                                </Col>

                                <Col>
                                    <Card.Text>{product.manufacturer_name}</Card.Text>
                                </Col>
            
                                <Col>
                                    <p style={{'marginRight' : '1em', 'width' : '12em'}}>Price: {product.price} BGN.</p>
                                </Col>

                                <Col>
                                    {(employeeInfo.permissions.update_perm) 
                                    ?   <Button tyle={{background : '#ebebeb'}} className={'crud-buttons-style ml-auto'}>
                                            <Link style={{color:'white'}} to={`/backoffice/products/update/${product.id}`} onClick={() => getCurrentProduct(product)}>
                                                <img 
                                                src='https://p7.hiclipart.com/preview/9/467/583/computer-icons-tango-desktop-project-download-clip-art-update-button.jpg'
                                                alt="Update product"
                                                className={'image-btnstyle'}
                                                />
                                            </Link>
                                        </Button>
                                    : null
                                    }

                                    {(employeeInfo.permissions.delete_perm)
                                        ?   <Button style={{background : '#ebebeb'}} onClick={() => deleteProduct(product.id)}>
                                                <img 
                                                src='https://image.flaticon.com/icons/png/512/61/61848.png'
                                                alt="Delete"
                                                className={'image-btnstyle'}
                                                />
                                            </Button>
                                        : null
                                    }
                                </Col>
                            </Row>
                        </Container>
                    </Card>
                ))}
            </div>
        );
    }
}

export default ProductsList;