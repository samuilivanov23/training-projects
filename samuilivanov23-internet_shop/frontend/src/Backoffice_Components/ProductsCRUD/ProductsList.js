import '../../App.css';
import React from 'react';
import JsonRpcClient from 'react-jsonrpc-client';
import { useState, useEffect, useRef } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { SetProductToUpdateDetails } from '../../Components/actions/ProductActions';
import ReactPaginate from '../../../node_modules/react-paginate'
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import Table from '@material-ui/core/Table';
import { makeStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

function ProductsList (props){

    const [validated, setValidated] = useState(false);
    const formRef = useRef(null);
    const [products, set_products] = useState([]);
    const [selected_sorting, set_selected_sorting] = useState('Sort by product_id asc');
    const [pages_count, set_pages_count] = useState(0);
    const [current_page, set_current_page] = useState(0);
    const [sorting_label, set_sorting_label] = useState('product id asc')
    const [quantity_slider, set_quantity_slider] = useState([]);
    const [price_slider, set_price_slider] = useState([]);
    const [max_quantity, set_max_quantity] = useState(0);
    const [max_price, set_max_price] = useState(0);
    const [product_id, set_product_id] = useState(null);
    const [product_name, set_product_name] = useState('');
    const [manufacturer_name, set_manufacturer_name] = useState('');
    const { employeeInfo } = useSelector(state=>state.employee);
    const dispatch = useDispatch();

    useEffect(() => {
        //current page is 0 when the component first loads
        loadProducts(current_page, selected_sorting, []); // empty array -> no filtering params
    }, [])

    const loadProducts = (current_page, selected_sorting, filtering_params) => {
        const django_rpc = new JsonRpcClient({
            endpoint : 'http://127.0.0.1:8000/backoffice/rpc/',
        });

        django_rpc.request(
            'GetProductsBackoffice',
            selected_sorting,
            current_page,
            filtering_params,
        ).then(function(response){
            response = JSON.parse(response);
            set_products(response['products']);
            set_pages_count(response['pages_count']);
            set_selected_sorting(selected_sorting);

            if(!(Array.isArray(price_slider) && price_slider.length)){
                set_price_slider([0, response['max_price']]);
            }

            if(!(Array.isArray(quantity_slider) && quantity_slider.length)){
                set_quantity_slider([0, response['max_quantity_instock']]);
            }

            set_max_quantity(response['max_quantity_instock'])
            set_max_price(response['max_price']);

            let ordering_param = selected_sorting.split(" ")[2];
            let ordering_direction = selected_sorting.split(" ")[3];            
            ordering_param = ordering_param.split("_");
            
            set_sorting_label('Ordered by: ' + ordering_param[0] + " " + ordering_param[1] + " " + ordering_direction);
        }).catch(function(error){
            alert(error['msg']);
        });
    }

    const getCurrentProduct = (current_product) => {
        console.log(current_product);
        
        dispatch(SetProductToUpdateDetails(
            current_product.product_id,
            current_product.product_name,
            current_product.product_description,
            current_product.product_count,
            current_product.product_price,
            current_product.product_image,
            current_product.product_manufacturer_name,
            current_product.product_manufacturer_id
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
            loadProducts(current_page, selected_sorting, []);
        }).catch(function(error){
            alert(error['msg']);
        });
    }

    const sortProducts = (event) => {
        const sort_filter = event.target.value;
        loadProducts(current_page, sort_filter, [
            product_id,
            product_name,
            quantity_slider,
            price_slider,
            manufacturer_name
        ]);
    };

    const handleQuantitySliderChange = (event, newValue) => {
        set_quantity_slider(newValue);
    };

    const handlePriceSliderChange = (event, newValue) => {
        set_price_slider(newValue);
    };

    const handleFiltering = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const form_data = event.currentTarget;

        if (form_data.checkValidity() === false) {
            alert('Plese fill the input fileds!');
        }
        else{
            set_product_id(form_data.id.value);
            set_product_name(form_data.name.value);
            set_manufacturer_name(form_data.manufacturer_name.value);

            loadProducts(current_page, selected_sorting, [
                form_data.id.value,
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
        set_product_name('');
        set_manufacturer_name('');

        loadProducts(current_page, selected_sorting, []) // empty array -> no filtering params
    };

    const handlePageClick = (products) => {
        let page_number = products.selected;
        loadProducts(page_number, selected_sorting, [
            product_id,
            product_name,
            quantity_slider,
            price_slider,
            manufacturer_name
        ]);
        set_current_page(page_number);
        window.scrollTo(0, 0);
    };

    const useStyles = makeStyles({
        table: {
            minWidth: 650,
        },
    });

    const classes = useStyles();
    
    const createData = (product_id, product_name, product_description, product_count, product_price, product_image, product_manufacturer_name, product_manufacturer_id, product_inserted_at) => {
        return { product_id, product_name, product_description, product_count, product_price, product_image, product_manufacturer_name, product_manufacturer_id, product_inserted_at };
    };
    
    const generateRows = () => {
        const rows = []
    
        products.forEach(product => {
            rows.push(createData(product['id'], product['name'], product['description'], product['count'], product['price'], product['image'], product['manufacturer_name'], product['manufacturer_id'], product['inserted_at']))
        });
    
        return rows;
    };
    
    if(typeof(products) === 'undefined'){
        return(
            <div>Loading...</div>
        );
    }    
    else{
        const rows = generateRows();

        return(
            <div>
                <div>
                    <Form ref={formRef} noValidate validated={validated} onSubmit={handleFiltering} style={{marginBottom : '2em', marginLeft : '2em'}}>
                        <Row>
                            <Col>
                                <Form.Label>Id</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="id"
                                    placeholder="Id"
                                    defaultValue=""
                                />
                                <Form.Text> Use characters [0-9] </Form.Text>
                            </Col>

                            <Col>
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    defaultValue=""
                                />
                                <Form.Text> Use characters [A-Z]/[a-z] </Form.Text>
                            </Col>

                            <Col>
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
                            </Col>

                            <Col>
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
                            </Col>

                            <Col>
                                <Form.Label>Manufacturer name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="manufacturer_name"
                                    placeholder="Manufacturer name"
                                    defaultValue=""
                                />
                                <Form.Text> Use characters [A-Z]/[a-z] </Form.Text>
                            </Col>

                            <Col>
                                <Button variant="primary" type="submit" className={'filter-button-center'}>
                                    Filter product
                                </Button>

                                <Button variant="primary" className={'filter-button-center'} onClick={clearFilters}>
                                    Clear
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </div>
                
                <div>
                   <h5 style={{textAlign : 'center'}}>{sorting_label}</h5>
                </div>

                <div>
                    <TableContainer component={Paper}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">
                                        Id
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={sortProducts}>
                                            <option key={1} value={'Sort by product_id asc'}>↗</option>
                                            <option key={2} value={'Sort by product_id desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">
                                        Inserted
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={sortProducts}>
                                            <option key={1} value={'Sort by inserted_at asc'}>↗</option>
                                            <option key={2} value={'Sort by inserted_at desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">Image</TableCell>
                                    <TableCell align="center">
                                        Name
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={sortProducts}>
                                            <option key={1} value={'Sort by product_name asc'}>↗</option>
                                            <option key={2} value={'Sort by product_name desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center" style={{maxWidth: "8em"}}>Description</TableCell>
                                    <TableCell align="center">
                                        Quantity in stock
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={sortProducts}>
                                            <option key={1} value={'Sort by product_count asc'}>↗</option>
                                            <option key={2} value={'Sort by product_count desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">
                                        Price [BGN]
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={sortProducts}>
                                            <option key={1} value={'Sort by product_price asc'}>↗</option>
                                            <option key={2} value={'Sort by product_price desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">
                                        Manufacturer
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={sortProducts}>
                                            <option key={1} value={'Sort by manufacturer_name asc'}>↗</option>
                                            <option key={2} value={'Sort by manufacturer_name desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center"> </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell component="th" scope="row" align="center">{row.product_id}</TableCell>     
                                        <TableCell align="center">{row.product_inserted_at}</TableCell>     
                                        <TableCell align="center">
                                            <img
                                            src={`/images/${row.product_image}`} alt={`${row.product_name}`}
                                            alt="Product image"
                                            className={'product-image-style'}
                                            />
                                        </TableCell>
                                        
                                        <TableCell align="center">{row.product_name}</TableCell>
                                        <TableCell align="center" style={{maxWidth: "8em"}}>{row.product_description}</TableCell>
                                        <TableCell align="center">{row.product_count}</TableCell>
                                        <TableCell align="center">{row.product_price}</TableCell>
                                        <TableCell align="center">{row.product_manufacturer_name}</TableCell>
                                        <TableCell align="center">
                                        {(employeeInfo.permissions.update_perm) 
                                            ?   <Button variant="light" className={'crud-buttons-style ml-auto'}>
                                                    <Link style={{color:'white'}} to={`/backoffice/products/update/${row.product_id}`} onClick={() => getCurrentProduct(row)}>
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
                                                ?   <Button variant="light" onClick={() => deleteProduct(row.product_id)}>
                                                        <img 
                                                        src='https://icon-library.com/images/delete-icon-png/delete-icon-png-4.jpg'
                                                        alt="Delete product"
                                                        className={'image-btnstyle'}
                                                        />
                                                    </Button>
                                                : null
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>

                <div>
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
            </div>
        );
    }
}

export default ProductsList;