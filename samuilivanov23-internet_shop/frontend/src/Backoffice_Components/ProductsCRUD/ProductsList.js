import '../../App.css';
import React from 'react';
import JsonRpcClient from 'react-jsonrpc-client';
import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { SetProductToUpdateDetails } from '../../Components/actions/ProductActions';
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
    const { employeeInfo } = useSelector(state=>state.employee);
    const dispatch = useDispatch();

    useEffect(() => {
        loadProducts();
    }, [])

    const loadProducts = () => {
        const django_rpc = new JsonRpcClient({
            endpoint : 'http://127.0.0.1:8000/backoffice/rpc/',
        });

        django_rpc.request(
            'GetProductsBackoffice',
        ).then(function(response){
            //response = JSON.parse(response);
            set_products(response.products);
            alert(response.msg);
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
            loadProducts();
        }).catch(function(error){
            alert(error['msg']);
        });
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
      
    if(typeof(products) === 'undefined'){
        return(
            <div>Loading...</div>
        );
    }    
    else{
        const rows = generateRows();

        return(
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
        );
    }
}

export default ProductsList;