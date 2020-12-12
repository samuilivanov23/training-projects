import '../../App.css';
import React from 'react';
import JsonRpcClient from 'react-jsonrpc-client';
import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
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

    const [products, set_products] = useState([]);
    const [selected_sorting, set_selected_sorting] = useState('Sort by p.name asc');
    const [pages_count, set_pages_count] = useState(0);
    const [current_page, set_current_page] = useState(0);
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
        const filter = event.target.value;
        loadProducts(current_page, filter);
    }

    const handlePageClick = (products) => {
        let page_number = products.selected;
        loadProducts(page_number, selected_sorting);
        set_current_page(page_number);
        window.scrollTo(0, 0);
    }

    const useStyles = makeStyles({
        table: {
            minWidth: 650,
        },
    });

    const classes = useStyles();
    
    const createData = (product_id, product_name, product_description, product_count, product_price, product_image, product_manufacturer_name) => {
        return { product_id, product_name, product_description, product_count, product_price, product_image, product_manufacturer_name };
    }
    
    const generateRows = () => {
        const rows = []
    
        products.forEach(product => {
            rows.push(createData(product.id, product.name, product.description, product.count, product.price, product.image, product.manufacturer_name))
        });
    
        return rows;
    }

    const GenerateSortFilters = () => {
        const options = []
  
        options.push(<option key={1} value={'Sort by p.name asc'}> Sort by name (asc)</option>);
        options.push(<option key={2} value={'Sort by p.name desc'}> Sort by name (desc)</option>);
        options.push(<option key={3} value={'Sort by p.price asc'}> Sort by price (asc)</option>);
        options.push(<option key={4} value={'Sort by p.price desc'}> Sort by price (desc)</option>);
        options.push(<option key={5} value={'Sort by p.count asc'}> Sort by quantity (asc)</option>);
        options.push(<option key={6} value={'Sort by p.count desc'}> Sort by quantity (desc)</option>);
        options.push(<option key={7} value={'Sort by m.name asc'}> Sort by manufacturer name (asc)</option>);
        options.push(<option key={8} value={'Sort by m.name desc'}> Sort by manufacturer name (desc)</option>);
        
        return options;
    }
    
    if(typeof(products) === 'undefined'){
        return(
            <div>Loading...</div>
        );
    }    
    else{
        const rows = generateRows();
        const sorting_options = GenerateSortFilters();

        return(
            <div>
                <div>
                    <select id="SortFilter" name={'sort_filter'} value={selected_sorting} onChange={FilterProducts}>
                        {sorting_options}
                    </select>
                </div>

                <div>
                    <TableContainer component={Paper}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Image</TableCell>
                                    <TableCell align="center">Name</TableCell>
                                    <TableCell align="center">Description</TableCell>
                                    <TableCell align="center">Quantity in stock</TableCell>
                                    <TableCell align="center">Price [BGN]</TableCell>
                                    <TableCell align="center">Manufacturer</TableCell>
                                    <TableCell align="center"> </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell align="center">
                                            <img 
                                            src={`/images/${row.product_image}`} alt={`${row.product_name}`}
                                            alt="Product image"
                                            className={'product-image-style'}
                                            />
                                        </TableCell>
                                        
                                        <TableCell component="th" scope="row" align="center">{row.product_name}</TableCell>
                                        <TableCell align="center">{row.product_description}</TableCell>
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