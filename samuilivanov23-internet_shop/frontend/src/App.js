import './App.css';
import React from 'react';
import JsonRpcClient from '../node_modules/react-jsonrpc-client/jsonrpcclient'
import ReactPaginate from '../node_modules/react-paginate'
import PropTypes from '../node_modules/prop-types'
import ProductList from './Components/ProductList'

class App extends React.Component{

  static propTypes = {
    perPage: PropTypes.number.isRequired,
  };

  constructor(props){
    super(props);

    this.state = {
      products: [],
      offset : 0,
      pageCount : 90,
    }
  }

  loadProductsList(offset){
    var django_rpc = new JsonRpcClient({
      endpoint: 'http://127.0.0.1:8000/shop/rpc/',
    });

    var appComponent = this;

    django_rpc.request(
      "GetProducts",
      offset,
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

  componentDidMount(){
    this.loadProductsList(0);
  }

  handlePageClick = (products) => {
    let selected = products.selected;
    let new_offset = Math.ceil(selected * this.props.perPage);

    this.setState({offset : new_offset}, () => {
      this.loadProductsList(new_offset);
    })
  }

  render(){
    if(!this.state.products.length){
      return <div>Did not fetch products</div>
    }

    return (
      <div>
        <div className={"App"} style={{display : 'flex', flexDirection : 'row', flex : 1, flexWrap : 'wrap'}}>
          <ProductList products={this.state.products}/>
        </div>
        
        <ReactPaginate
            previousLabel={'previous'}
            nextLabel={'next'}
            breakLabel={'...'}
            breakClassName={'break-me'}
            pageCount={this.state.pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={this.handlePageClick}
            containerClassName={'pagination'}
            subContainerClassName={'pages pagination'}
            activeClassName={'active'}
        />
      </div>
    );
  }
}

export default App;