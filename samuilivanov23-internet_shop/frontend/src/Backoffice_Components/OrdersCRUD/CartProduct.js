import '../../App.css';
import React from 'react';
import JsonRpcClient from '../../../node_modules/react-jsonrpc-client/jsonrpcclient';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Row, Col, Container } from '../../../node_modules/react-bootstrap';
import { Link } from '../../../node_modules/react-router-dom';
import { ChangeSelectedCount } from '../../Components/actions/CartActions';
import { SetProductDetails } from '../../Components/actions/ProductActions';

function CartProductBackoffice(props){

    const { employeeInfo } = useSelector(state=>state.employee);
    const dispatch = useDispatch();

    const changeProductSelectCount = (event) => {
        let selected_count = event.target.value;

        var django_rpc = new JsonRpcClient({
            endpoint : 'http://127.0.0.1:8000/shop/rpc/',
        });

        django_rpc.request(
            'ChangeProductSelectedCount',
            props.product_id,
            employeeInfo.cart_id,
            selected_count,
        ).then(function(response){
            response = JSON.parse(response);
            alert(response['msg']);
        }).catch(function(error){
            alert(error['msg']);
        });

        dispatch(ChangeSelectedCount(props.product.id, 
                                        props.product.name, 
                                        props.product.description,
                                        props.product.price,
                                        selected_count,
                                        props.product.count,
                                        props.product.image));
        props.history.push('/shop/cart');
    }

    const getCurrentProduct = (current_product) => {
        dispatch(SetProductDetails(props.product.id, 
                                    props.product.name, 
                                    props.product.description, 
                                    props.product.price, 
                                    props.product.selected_count,
                                    props.product.count,
                                    props.product.image));
        
        props.history.push(`/shop/products/${current_product['id']}`);
    }

    const generateCountSelectElements = (product_count) => {
        const options = [];
    
        for(let i = 1; i <= product_count; i++){
            options.push(<option key={i} value={i}>{i}</option>);
        }

        return options;
    }

    const options = generateCountSelectElements(props.product.count);

    return (
        <Card style={{ width: '60rem', margin: '1em' }}>
            <Container style={{ width: '50rem', height : '10em', margin: '1em' }}>
                <Row>
                    <Col>
                        <Card.Img style={{width : '80%', height : '50%', marginLeft : '10%', marginTop : '5%'}} variant="left" src={`/images/${props.product.image}`} alt={`${props.product.name}`} />
                    </Col>
                    
                    <Col>
                        <Card.Title>
                            <Link style={{'textDecoration' : 'none', 'color' : 'black'}} to={`/shop/products/${props.product.id}`} onClick={() => getCurrentProduct(props.product)}>
                                {props.product.name}
                            </Link>
                        </Card.Title>
                    </Col>

                    <Col>
                        <div style={{'display': 'inline-block', 'width' : '7em'}}>
                            <select id="selectedCount" name={'selected_count'} value={props.product.selected_count} onChange={changeProductSelectCount}>
                                {options}
                            </select>
                            <label>Quantity</label>
                        </div>
                    </Col>

                    <Col>
                        <Card.Text>
                            <Link style={{'textDecoration' : 'none', 'color' : 'black'}} to={`/shop/products/${props.product.id}`} onClick={() => getCurrentProduct(props.product)}>
                                Price {props.product.price}
                            </Link>
                        </Card.Text>
                    </Col>

                    <Col>
                        <p style={{'marginRight' : '1em', 'width' : '12em'}}>Total: {(props.product.selected_count*props.product.price).toFixed(2)} BGN.</p>
                    </Col>
                </Row>
            </Container>
        </Card>
    );
}

export default CartProductBackoffice;