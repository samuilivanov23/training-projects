import '../App.css';
import React from 'react';
import {Card, Button } from '../../node_modules/react-bootstrap';
import PropTypes from '../../node_modules/prop-types';

export default class ProductList extends React.Component {

    static propTypes = {
        products: PropTypes.array.isRequired,
    };

    render(){
        if(!this.props.products.length){
            return <div>Did not fetch products</div>
        }

        return (
            <div className={"App"} style={{display : 'flex', flexDirection : 'row', flex : 1, flexWrap : 'wrap'}}>
            {this.props.products.map(product => (
                <div key={product['id']} className={'product-card'}>
                    <Card style={{ width: '18rem' }}>
                        <Card.Body>
                            <Card.Title>{product['name']}</Card.Title>
                            <Card.Text>{product['description']}</Card.Text>
                            <Button variant="primary">Go somewhere</Button>
                        </Card.Body>
                    </Card>
                </div>
            ))}
            </div>
        );
    }
}