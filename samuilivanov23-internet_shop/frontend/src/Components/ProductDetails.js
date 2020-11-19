import '../App.css';
import React from 'react';
import {Card, Button } from '../../node_modules/react-bootstrap';
import PropTypes from '../../node_modules/prop-types';
import JsonRpcClient from '../../node_modules/react-jsonrpc-client/jsonrpcclient'

class ProductDetails extends React.Component {

    static propTypes = {
        product: PropTypes.object.isRequired,
    };

    constructor(props){
        super(props);

        this.state = {
            in_stock : '',
            selected_count : 1,
        }
    }

    checkProductInStock(product){
        if(product['count'] > 0){
            this.setState({
                in_stock : 'In stock'
            });
        }
        else{
            this.setState({
                in_stock : 'Out of stock'
            });
        }
    }

    generateCountSelectElements(product_count){
        const options = [];

        for(let i = 1; i <= product_count; i++){
            options.push(<option key={i} value={i}>{i}</option>);
        }

        return options;
    }

    componentDidMount(){
        this.checkProductInStock(this.props.product);

    }

    changeProductSelectCount = (event) => {
        this.setState({ 
            selected_count: event.target.value
        });
    }

    addProductToCart = (product_id, selected_count, product_count) => {
        var django_rpc = new JsonRpcClient({
            endpoint: 'http://127.0.0.1:8000/shop/rpc/',
        });
      
        django_rpc.request(
            "AddProductToCart",
            product_id,
            selected_count,
            product_count,
        ).then(function(response){
            let json_response = JSON.parse(response);
            console.log(json_response);
        }).catch(function(error){
            console.log(error);
        });
    }

    render(){
        const options = this.generateCountSelectElements(this.props.product['count']);

        return (
            <div>
                <Card style={{ width: '36rem' }}>
                    <Card.Body>
                        <Card.Title>Name: {this.props.product['name']}</Card.Title>
                        <Card.Text>Description: {this.props.product['description']}</Card.Text>
                        <Card.Text>Price: {this.props.product['price']} lv.</Card.Text>
                        <Card.Text>{this.state.in_stock}</Card.Text>
                        
                        <select style={{marginRight : '1em'}} name={'selected_count'} value={this.state.selected_count} onChange={this.changeProductSelectCount}>
                            {options}
                        </select>
                        
                        <Button onClick={() => this.addProductToCart(this.props.product['id'], this.state.selected_count, this.props.product['count'])}>
                            Add to cart
                        </Button>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}

export default ProductDetails;