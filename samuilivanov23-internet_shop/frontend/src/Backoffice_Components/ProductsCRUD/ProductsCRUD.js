import '../../App.css';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import ProductsList from './ProductsList';

function ProductsCRUD (props) {

    const { employeeInfo } = useSelector(state=>state.employee);
    
    const generateCreateOperation = () => {
        if(employeeInfo.permissions.create_perm){
            return(
                <Button style={{'margin' : '2em'}}>
                    <Link style={{color:'white'}} to={'/backoffice/products/create'}>
                        Create product
                    </Link>
                </Button>
            );
        }
        else {
            return null;
        }
    }

    const generateReadOperation = () => {
        if(employeeInfo.permissions.read_perm){
            //TODO add product list component for the rendering
            return(
                <ProductsList/>
            );
        }
        else{
            return (
                <h3>Not sufficient permissions to view products</h3>
            );
        }
    }
    

    const isCreateAvaliable = generateCreateOperation();
    const isReadAvailable = generateReadOperation();
    
    return(
        <div>
            {isCreateAvaliable}
            {isReadAvailable}
        </div>
    );
}

export default ProductsCRUD;