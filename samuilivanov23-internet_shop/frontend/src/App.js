import './App.css';
import React from 'react';
import JsonRpcClient from '../node_modules/react-jsonrpc-client/jsonrpcclient'
import {Card, Button } from '../node_modules/react-bootstrap'

class App extends React.Component{
  constructor(props){
    super(props);

    this.state = {
      products: []
    }
  }

  async componentDidMount(){
    var api = new JsonRpcClient({
      endpoint: 'http://127.0.0.1:8000/shop/rpc/',
    });

    var appComponent = this;

    api.request(
      "GetProducts",
    ).then(function(response){
      let products_list = JSON.parse(response);
      console.log(products_list['data']);
      
      appComponent.setState({
        products : products_list['data']
      });

      console.log("state:");
      console.log(appComponent.state);
    });
  }

  render(){
    if(!this.state.products.length){
      return <div>Did not fetch products</div>
    }

    return (
      <div className={"App"} style={{display : 'flex', flexDirection : 'row', flex : 1, flexWrap : 'wrap'}}>
        {this.state.products.map(product => (
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

export default App;