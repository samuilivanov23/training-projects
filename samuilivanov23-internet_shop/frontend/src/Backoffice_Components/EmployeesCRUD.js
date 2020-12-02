import '../App.css';
import { useSelector } from 'react-redux';
import { Link } from '../../node_modules/react-router-dom';
import { Button } from '../../node_modules/react-bootstrap';
import EmployeesList from './EmployeesList';

function EmployeesCRUD (props) {

    const { employeeInfo } = useSelector(state=>state.employee);
    
    const generateCreateOperation = () => {
        if(employeeInfo.permissions.create){
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
        if(employeeInfo.permissions.read){
            //TODO add employee list component for the rendering
            return(
                <EmployeesList/>
            );
        }
        else{
            return (
                <h3>Not sufficient permissions to see employees</h3>
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