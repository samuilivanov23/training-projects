import '../../App.css';
import React from 'react';
import JsonRpcClient from 'react-jsonrpc-client'
import ReactPaginate from 'react-paginate'
import { useState, useEffect, useRef } from 'react';
import ProductsListBackoffice from './ProductsListBackoffice';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import { Form, Button, Row, Col } from 'react-bootstrap';

function ChooseProductsBackoffice(props) {

    const [validated, setValidated] = useState(false);
    const formRef = useRef(null);
    const [pages_count, set_pages_count] = useState(0);
    const [products, set_products] = useState([]);
    const [selected_sorting, set_selected_sorting] = useState('Sort by product_name asc');
    const [current_page, set_current_page] = useState(0);
    const [quantity_slider, set_quantity_slider] = useState([]);
    const [price_slider, set_price_slider] = useState([]);
    const [max_quantity, set_max_quantity] = useState(0);
    const [max_price, set_max_price] = useState(0);
    const [product_id, set_product_id] = useState(null);
    const [product_name, set_products_name] = useState('');
    const [manufacturer_name, set_manufacturer_name] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
        loadProducts(current_page, selected_sorting, []); // empty array -> no filtering params
    }, []);

    const loadProducts = (current_page, selected_sorting, filtering_params) => {
        var django_rpc = new JsonRpcClient({
            endpoint: 'http://127.0.0.1:8000/shop/rpc/',
        });

        django_rpc.request(
            "GetProducts",
            selected_sorting,
            current_page,
            filtering_params,
        ).then(function(response){
            response = JSON.parse(response);

            console.log(response);

            set_products(response['products']);
            set_pages_count(response['pages_count']);
            set_selected_sorting(selected_sorting);

            if(!(Array.isArray(price_slider) && price_slider.length)){
                set_price_slider([0, response['max_price']]);
            }

            if(!(Array.isArray(quantity_slider) && quantity_slider.length)){
                set_quantity_slider([0, response['max_quantity_instock']]);
            }

            set_max_quantity(response['max_quantity_instock']);
            set_max_price(response['max_price']);
        }).catch(function(error){
            console.log(error['msg']);
        });
    };

    const sortProducts = (event) => {
        const sort_filter = event.target.value;
        loadProducts(current_page, sort_filter, [
            product_id,
            product_name,
            quantity_slider,
            price_slider,
            manufacturer_name,
        ]);
    };

    const handleQuantitySliderChange = (event, newValue) => {
        set_quantity_slider(newValue);
    }

    const handlePriceSliderChange = (event, newValue) => {
        set_price_slider(newValue);
    }

    const handleFiltering = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const form_data = event.currentTarget;
        console.log(form_data);
        console.log(form_data.name.value);

        if(form_data.checkValidity() === false){
            alert('Please fill the input fields');
        }
        else{
            set_products_name(form_data.name.value);
            set_manufacturer_name(form_data.manufacturer_name.value);

            loadProducts(current_page, selected_sorting, [
                product_id,
                form_data.name.value,
                quantity_slider,
                price_slider,
                form_data.manufacturer_name.value
            ]);
        }

        setValidated(true);
    };

    const clearFilters = () => {
      formRef.current.reset();
      
      setValidated(false);
      set_quantity_slider([0, max_quantity]);
      set_price_slider([0, max_price]);
      set_product_id(null);
      set_products_name('');
      set_manufacturer_name('');
      
      loadProducts(current_page, selected_sorting, []); // empty array -> no filtering params
    };

    const handlePageClick = (products) => {
        let page_number = products.selected;
        loadProducts(page_number, selected_sorting, [
            product_id,
            product_name,
            quantity_slider,
            price_slider,
            manufacturer_name,
        ]);

        set_current_page(page_number);
        window.scrollTo(0, 0);
    };

    const GenerateSortFilters = () => {
        const options = []

        options.push(<option key={1} value={'Sort by product_name asc'}> Sort by name (asc)</option>);
        options.push(<option key={2} value={'Sort by product_name desc'}> Sort by name (desc)</option>);
        options.push(<option key={3} value={'Sort by product_price asc'}> Sort by price (asc)</option>);
        options.push(<option key={4} value={'Sort by product_price desc'}> Sort by price (desc)</option>);

        return options;
    };

    const options = GenerateSortFilters();

    if(!products.length){
        return <div>Loading...</div>
    }
    else{
        return (
            <section className={"product-list-container"}>
      
                <div className={"menu-section"}>
                    <Form ref={formRef} noValidate validated={validated} onSubmit={handleFiltering} style={{marginBottom : '2em', marginLeft : '2em'}}>
                        <Row>
                            <Col>
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    defaultValue=""
                                />
                                <Form.Text> Use characters [A-Z]/[a-z] </Form.Text>


                                <Typography id="discrete-slider-small-steps" gutterBottom>
                                    Quantity
                                </Typography>
                                <Slider
                                    value={quantity_slider}
                                    min={0}
                                    max={max_quantity}
                                    onChange={handleQuantitySliderChange}
                                    valueLabelDisplay="auto"
                                    aria-labelledby="range-slider"
                                />


                                <Typography id="discrete-slider-small-steps" gutterBottom>
                                    Price [BGN]
                                </Typography>
                                <Slider
                                    value={price_slider}
                                    min={0}
                                    step={0.01}
                                    max={max_price}
                                    onChange={handlePriceSliderChange}
                                    valueLabelDisplay="auto"
                                    aria-labelledby="range-slider"
                                />


                                <Form.Label>Manufacturer name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="manufacturer_name"
                                    placeholder="Manufacturer name"
                                    defaultValue=""
                                />
                                <Form.Text> Use characters [A-Z]/[a-z] </Form.Text>


                                <Button variant="primary" type="submit" style={{marginLeft : '15%', marginTop : '1em'}}>
                                    Filter product
                                </Button>

                                <Button variant="primary" style={{marginLeft : '25%', marginTop : '1em'}} onClick={clearFilters}>
                                    Clear
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </div>
      
              <div className={"products-section"}>
                <div>
                  <div className={'sort-filter'}>
                      <select id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={sortProducts}>
                          {options}
                      </select>
                      <label style={{marginLeft:'1em'}}>Select filter</label>
                  </div>
                </div>
      
                <div className={"App"} style={{display : 'flex', flexDirection : 'row', flex : 1, flexWrap : 'wrap'}}>
                  <ProductsListBackoffice {...props} products={products}/>
                </div>
      
                <ReactPaginate
                    previousLabel={'← Previous'}
                    nextLabel={'Next →'}
                    pageCount={pages_count}
                    pageRangeDisplayed={(pages_count > 5) ? 5 : pages_count}
                    onPageChange={handlePageClick}
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

export default ChooseProductsBackoffice;