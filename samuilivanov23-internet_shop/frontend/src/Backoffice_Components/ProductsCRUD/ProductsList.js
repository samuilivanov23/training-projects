import '../../App.css';
import React from 'react';
import JsonRpcClient from 'react-jsonrpc-client';
import { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
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

function ProductsList (props){

    const [validated, setValidated] = useState(false);
    const [products, set_products] = useState([]);
    const [selected_sorting, set_selected_sorting] = useState('Sort by product_id asc');
    const [pages_count, set_pages_count] = useState(0);
    const [current_page, set_current_page] = useState(0);
    const [sorting_label, set_sorting_label] = useState('product id asc')
    const { employeeInfo } = useSelector(state=>state.employee);
    const dispatch = useDispatch();

    useEffect(() => {
        //current page is 0 when the component first loads
        loadProducts(current_page, selected_sorting);
    }, [])

    const loadProducts = (current_page, selected_sorting) => {
        const django_rpc = new JsonRpcClient({
            endpoint : 'http://127.0.0.1:8000/backoffice/rpc/',
        });

        django_rpc.request(
            'GetProductsBackoffice',
            selected_sorting,
            current_page,
        ).then(function(response){
            response = JSON.parse(response);
            set_products(response['products']);
            set_pages_count(response['pages_count']);
            set_selected_sorting(selected_sorting);

            let ordering_param = selected_sorting.split(" ")[2];
            let ordering_direction = selected_sorting.split(" ")[3];            
            ordering_param = ordering_param.split("_");
            
            set_sorting_label('Ordered by: ' + ordering_param[0] + " " + ordering_param[1] + " " + ordering_direction);

            alert(response['msg']);
        }).catch(function(error){
            alert(error['msg']);
        });
    }

    const getCurrentProduct = (current_product) => {
        dispatch(SetProductToUpdateDetails(
            current_product.id,
            current_product.name,
            current_product.description,
            current_product.count,
            current_product.price,
            current_product.image,
            current_product.manufacturer_id
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
            loadProducts(current_page, selected_sorting);
        }).catch(function(error){
            alert(error['msg']);
        });
    }

    const FilterProducts = (event) => {
        console.log(event);
        const filter = event.target.value;
        loadProducts(current_page, filter);
    }

    const handlePageClick = (products) => {
        let page_number = products.selected;
        loadProducts(page_number, selected_sorting);
        set_current_page(page_number);
        window.scrollTo(0, 0);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const form_data = event.currentTarget;

        if (form_data.checkValidity() === false) {
            alert('Plese fill all input fileds!');
        }
        else{
            console.log('Creating product');
            insertProduct(form_data.name.value,
                        form_data.description.value,
                        form_data.count.value,
                        form_data.price.value,
                        form_data.manufacturer_name.value);
        }

        setValidated(true);
    };

    const useStyles = makeStyles({
        table: {
            minWidth: 650,
        },
    });

    const classes = useStyles();
    
    const createData = (product_id, product_name, product_description, product_count, product_price, product_image, product_manufacturer_name, product_inserted_at) => {
        return { product_id, product_name, product_description, product_count, product_price, product_image, product_manufacturer_name, product_inserted_at };
    }
    
    const generateRows = () => {
        const rows = []
    
        products.forEach(product => {
            rows.push(createData(product.id, product.name, product.description, product.count, product.price, product.image, product.manufacturer_name, product.inserted_at))
        });
    
        return rows;
    }
    
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
                    <Form noValidate validated={validated} onSubmit={handleSubmit} className={'form-center'}>
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            name="name"
                            placeholder="Name"
                            defaultValue=""
                        />
                        <Form.Text> Use characters [A-Z]/[a-z] </Form.Text>
                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                            Please enter Name.
                        </Form.Control.Feedback>
                        <br/>
                        <br/>


                        <Form.Label>Quantity</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            name="count"
                            placeholder="Quantity"
                            defaultValue=""
                        />
                        <Form.Text> Integer </Form.Text>
                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                            Please enter Quantity.
                        </Form.Control.Feedback>
                        <br/>
                        <br/>
        
        
        
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            name="price"
                            placeholder="Price"
                            defaultValue=""
                        />
                        <Form.Text> 2 floating point digits (For instance: 19.99) </Form.Text>
                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                            Please enter Price.
                        </Form.Control.Feedback>
                        <br/>
                        <br/>

                        <Form.Label>Manufacturer name</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            name="manufacturer_name"
                            placeholder="Manufacturer name"
                            defaultValue=""
                        />
                        <Form.Text> Use characters [A-Z]/[a-z] </Form.Text>
                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                            Please enter Manufacturer name.
                        </Form.Control.Feedback>
                        <br/>
                        <br/>
        
                        <Button variant="primary" type="submit">
                            Filter product
                        </Button>
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
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={FilterProducts}>
                                            <option key={1} value={'Sort by product_id asc'}>↗</option>
                                            <option key={2} value={'Sort by product_id desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">
                                        Inserted
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={FilterProducts}>
                                            <option key={1} value={'Sort by inserted_at asc'}>↗</option>
                                            <option key={2} value={'Sort by inserted_at desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">Image</TableCell>
                                    <TableCell align="center">
                                        Name
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={FilterProducts}>
                                            <option key={1} value={'Sort by product_name asc'}>↗</option>
                                            <option key={2} value={'Sort by product_name desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center" style={{maxWidth: "8em"}}>Description</TableCell>
                                    <TableCell align="center">
                                        Quantity in stock
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={FilterProducts}>
                                            <option key={1} value={'Sort by product_count asc'}>↗</option>
                                            <option key={2} value={'Sort by product_count desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">
                                        Price [BGN]
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={FilterProducts}>
                                            <option key={1} value={'Sort by product_price asc'}>↗</option>
                                            <option key={2} value={'Sort by product_price desc'}>↘</option>
                                        </select>
                                    </TableCell>
                                    <TableCell align="center">
                                        Manufacturer
                                        <select style={{marginLeft : '0.5em'}} id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={FilterProducts}>
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