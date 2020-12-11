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
                <Button variant="info" style={{'margin' : '2em'}}>
                    <Link style={{color:'white'}} to={'/backoffice/products/create'}>
                        <img 
                        src='https://cdn2.iconfinder.com/data/icons/media-controls-5/100/add-512.png'
                        alt="Create product"
                        className={'image-btnstyle'}
                        />
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