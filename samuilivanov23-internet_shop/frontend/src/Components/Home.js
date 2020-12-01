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
      selected_sorting : 'Sort by name asc',
    }
  };

  loadInitialProductsList(offset, products_per_page){
    var django_rpc = new JsonRpcClient({
      endpoint: 'http://127.0.0.1:8000/shop/rpc/',
    });

    const home_component = this;

    django_rpc.request(
      "GetProducts",
      offset,
      products_per_page,
    ).then(function(response){
      let products_list = JSON.parse(response);
      
      home_component.setState({
        products : products_list['data'],
        pages_count : products_list['pages_count']
      });

      console.log("state:");
      console.log(home_component.state);
    }).catch(function(error){
      console.log(error);
    });
  }

  loadProductsPerPage(offset, products_per_page, selected_sorting){
    const filter = selected_sorting;

    const django_rpc = new JsonRpcClient({
        endpoint: "http://127.0.0.1:8000/shop/rpc/filters",
    });

    const home_component = this;

    django_rpc.request(
        'FilterProducts',
        filter,
        offset,
        products_per_page,
    ).then(function(response){
        response = JSON.parse(response);

        home_component.setState({
          products : response['data'],
          pages_count : response['pages_count'],
          selected_sorting : filter,
        });

    }).catch(function(error){
        alert(error['msg']);
    });
  }

  componentDidUpdate() {
    window.scrollTo(0, 0);
  }

  componentDidMount(){
    console.log("state:");
    this.loadInitialProductsList(0, this.props.per_page);
    console.log(this.state)
  }

  FilterProducts = (event) => {
    const filter = event.target.value;

    const django_rpc = new JsonRpcClient({
        endpoint: "http://127.0.0.1:8000/shop/rpc/filters",
    });

    const home_component = this;

    django_rpc.request(
        'FilterProducts',
        filter,
        this.state.offset,
        this.props.per_page,
    ).then(function(response){
        response = JSON.parse(response);

        home_component.setState({
          products : response['data'],
          pages_count : response['pages_count'],
          selected_sorting : filter,
        });

        alert(response['msg']);
    }).catch(function(error){
        alert(error['msg']);
    });

    console.log(this.props);
  }

  handlePageClick = (products) => {
    let selected = products.selected;
    console.log(selected);
    let new_offset = Math.ceil(selected * this.props.per_page);

    this.setState({offset : new_offset}, () => {
      this.loadProductsPerPage(new_offset, this.props.per_page, this.state.selected_sorting);
    })
  }

  render(){
    const GenerateSortFilters = () => {
      const options = []

      options.push(<option key={1} value={'Sort by name asc'}> Sort by name (asc)</option>);
      options.push(<option key={2} value={'Sort by name desc'}> Sort by name (desc)</option>);
      options.push(<option key={3} value={'Sort by price asc'}> Sort by price (asc)</option>);
      options.push(<option key={4} value={'Sort by price desc'}> Sort by price (desc)</option>);
      
      return options;
    }

    const options = GenerateSortFilters();

    if(!this.state.products.length){
      return <div>Loading...</div>
    }

    return (
      <section className={"product-list-container"}>

        <div className={"menu-section"}>
          <p>Categories / filters</p>
        </div>

        <div className={"products-section"}>
          <div>
            <div className={'sort-filter'}>
                <select id="SortFilter" name={'sort_filter'} value={this.state.selected_sorting} onChange={this.FilterProducts}>
                    {options}
                </select>
                <label style={{marginLeft:'1em'}}>Select filter</label>
            </div>
          </div>

          <div className={"App"} style={{display : 'flex', flexDirection : 'row', flex : 1, flexWrap : 'wrap'}}>
            <ProductList {...this.props} products={this.state.products}/>
          </div>

          <ReactPaginate
              previousLabel={'← Previous'}
              nextLabel={'Next →'}
              pageCount={this.state.pages_count}
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
      </section>
    );
  }
}

export default Home;