import '../../App.css';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import EmployeesList from './EmployeesList';

function EmployeesCRUD (props) {

    const { employeeInfo } = useSelector(state=>state.employee);
    
    const generateCreateOperation = () => {
        if(employeeInfo.permissions.create_perm){
            return(
                <Button style={{'margin' : '2em'}}>
                    <Link style={{color:'white'}} to={'/backoffice/employees/create'}>
                        Create employee
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
                <EmployeesList/>
            );
        }
        else{
            return (
                <h3>Not sufficient permissions to view employees</h3>
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

export default EmployeesCRUD;