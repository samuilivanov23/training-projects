import '../App.css';
import { Navbar, Nav } from '../../node_modules/react-bootstrap';
import { Link } from '../../node_modules/react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LogoutUser } from './actions/UserActions';

function NavigationBar(props) {
    
    const signInUser = useSelector(state=>state.signInUser);
    const { userInfo } = signInUser;

    const dispatch = useDispatch();

    const logoutUser = () => {
        dispatch(LogoutUser());
        props.history.push('/login');
    }

    const generateLoginLogoutLink = () => {
        if(userInfo.username === 'init' || typeof(userInfo.username) === 'undefined'){
            return <Link className={'nav-link'} to="/login">Login</Link>;
        }
        else{
            return <Link className={'nav-link'} to="/login" onClick={logoutUser}>Logout</Link>;
        }
    }

    const generateCartLink = () => {
        if(userInfo.username !== 'init' && typeof(userInfo.username) !== 'undefined'){
            const elements = []
            elements.push(<Link key={1} className={'nav-link'} to="/cart">Cart</Link>);
            elements.push(<p key={0} style={{'color' : 'white', 'marginTop' : '0.5em'}}> Hello {userInfo.username} </p>);

            return elements;
        }
    }

    const LogInLogoutLink = generateLoginLogoutLink();
    const CartLink = generateCartLink();

    return (
        <Navbar bg="dark" variant="dark">
            <Navbar.Brand to="/">Video Surveillance shop</Navbar.Brand>
            <Nav className="mr-auto">
                <Link className={'nav-link'} to="/products">Products</Link>
                <Link className={'nav-link'} to="/tags">Categories</Link>
            </Nav>
            <Nav className="ml-auto">
                <Link className={'nav-link'} to="/register">Register</Link>
                {LogInLogoutLink}
                {CartLink}
            </Nav>
        </Navbar>
    );
}

export default NavigationBar;