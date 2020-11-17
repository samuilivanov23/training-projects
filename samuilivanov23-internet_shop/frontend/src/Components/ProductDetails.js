import '../App.css';
import React from 'react';
import {Card, Button } from '../../node_modules/react-bootstrap';
import PropTypes from '../../node_modules/prop-types';
import {BrowserRouter as Router, Switch, Route, Link} from '../../node_modules/react-router-dom'

class ProductDetails extends React.Component {

    static propTypes = {
        product: PropTypes.object.isRequired,
    };

    constructor(props){
        super(props);

        this.state = {
            in_stock : '',
            selectedCount : 0,
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
        console.log('current product count');
        console.log(event.target.value);

        this.setState({ 
            selectedCount: event.target.value
        });
    }

    render(){
        const options = this.generateCountSelectElements(this.props.product['count']);
        console.log(options);

        return (
            <div>
                <Card style={{ width: '36rem' }}>
                    <Card.Body>
                        <Card.Title>Name: {this.props.product['name']}</Card.Title>
                        <Card.Text>Description: {this.props.product['description']}</Card.Text>
                        <Card.Text>Price: {this.props.product['price']} lv.</Card.Text>
                        <Card.Text>{this.state.in_stock}</Card.Text>
                        
                        <select name={'selected_count'} value={this.state.selectedCount} onChange={this.changeProductSelectCount}>
                            {options}
                        </select>
                        
                        <Button onClick={() => this.addProductToCart(this.props.product)}>
                            Add to cart
                        </Button>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}

export default ProductDetails;