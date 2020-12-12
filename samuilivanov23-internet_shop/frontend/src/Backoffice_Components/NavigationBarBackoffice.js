import '../App.css';
import { Navbar, Nav, Dropdown } from '../../node_modules/react-bootstrap';
import { Link } from '../../node_modules/react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LogoutEmployee } from '../Components/actions/EmployeeActions';

function NavigationBarBackoffice(props) {
    
    const { employeeInfo } = useSelector(state=>state.employee);
    console.log(employeeInfo);

    const dispatch = useDispatch();

    const logoutEmployee = () => {
        dispatch(LogoutEmployee());
        props.history.push('/backoffice/login');
    }

    const generateLoginLogoutLink = () => {
        if(employeeInfo.email_address === 'init' || typeof(employeeInfo.email_address) === 'undefined'){
            return <Link className={'nav-link'} to="/backoffice/login">Login</Link>;
        }
        else{
            return <Link className={'nav-link'} to="/backoffice/login" onClick={logoutEmployee}>Logout</Link>;
        }
    }

    const Welcome = () => {
        if(employeeInfo.email_address !== 'init' && typeof(employeeInfo.email_address) !== 'undefined'){
            return <p key={0} style={{'color' : 'white', 'marginTop' : '0.5em'}}> Hello {employeeInfo.email_address} </p>;
        }
    }

    const LogInLogoutLink = generateLoginLogoutLink();
    const welcome = Welcome();

    return (
        <Navbar bg="dark" variant="dark">
            <Navbar.Brand to="/">Video Surveillance backoffice</Navbar.Brand>
            <Nav className="mr-auto">
                <Dropdown>
                    <Dropdown.Toggle variant="info" id="dropdown-basic">
                        Menu
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item as={Link} to="/backoffice/products" >Products</Dropdown.Item>
                        <Dropdown.Item as={Link} to="/backoffice/employees">Employees</Dropdown.Item>
                        <Dropdown.Item as={Link} to="/backoffice/orders">Orders</Dropdown.Item>
                        <Dropdown.Item as={Link} to="/backoffice/roles">Roles</Dropdown.Item>
                        <Dropdown.Item as={Link} to="/backoffice/roles">Manufacturers</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </Nav>
            <Nav className="ml-auto">
                {LogInLogoutLink}
                {welcome}
            </Nav>
        </Navbar>
    );
}

export default NavigationBarBackoffice;