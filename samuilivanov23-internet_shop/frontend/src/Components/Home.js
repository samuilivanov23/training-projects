import '../App.css';
import React from 'react';
import JsonRpcClient from '../../node_modules/react-jsonrpc-client/jsonrpcclient'
import ReactPaginate from '../../node_modules/react-paginate'
import PropTypes from '../../node_modules/prop-types'
import ProductList from './ProductList'

class Home extends React.Component{

  static propTypes = {
    per_page: PropTypes.number.isRequired,
  };

  constructor(props){
    super(props);

    this.state = {
      products: [],
      offset : 0,
      page_count : 50, // ISSUE (hardcoded for testing purposes) : must not be hardcoded
    }
  };

  loadProductsList(offset, products_per_page){
    var django_rpc = new JsonRpcClient({
      endpoint: 'http://127.0.0.1:8000/shop/rpc/',
    });

    var home_component = this;

    django_rpc.request(
      "GetProducts",
      offset,
      products_per_page,
    ).then(function(response){
      let products_list = JSON.parse(response);
      console.log(products_list['data']);
      
      home_component.setState({
        products : products_list['data']
      });

      console.log("state:");
      console.log(home_component.state);
    }).catch(function(error){
      console.log(error);
    });
  }

  componentDidUpdate() {
    window.scrollTo(0, 0);
  }

  componentDidMount(){
    console.log("state:");
    this.loadProductsList(0, this.props.per_page);
    console.log(this.state)
  }

  handlePageClick = (products) => {
    let selected = products.selected;
    console.log(selected);
    let new_offset = Math.ceil(selected * this.props.per_page);

    this.setState({offset : new_offset}, () => {
      this.loadProductsList(new_offset, this.props.per_page);
    })
  }

  render(){
    if(!this.state.products.length){
      return <div>Loading...</div>
    }

    return (
      <div>
        <div className={"App"} style={{display : 'flex', flexDirection : 'row', flex : 1, flexWrap : 'wrap'}}>
          <ProductList {...this.props} products={this.state.products}/>
        </div>

        <ReactPaginate
            previousLabel={'← Previous'}
            nextLabel={'Next →'}
            pageCount={this.state.page_count}
            pageRangeDisplayed={5}
            onPageChange={this.handlePageClick}
            breakClassName={'page-item'}
            breakLinkClassName={'page-link'}
            containerClassName={'pagination'}
            pageClassName={'page-item'}
            pageLinkClassName={'page-link'}
            previousClassName={'page-item'}
            previousLinkClassName={'page-link'}
            nextClassName={'page-item'}
            nextLinkClassName={'page-link'}
            activeClassName={'active'}
        />
      </div>
    );
  }
}

export default Home;