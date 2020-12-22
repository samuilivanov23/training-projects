import { useHistory } from '../../node_modules/react-router-dom';


function PrivateReroute(){
    const history = useHistory();
    console.log(history);
    
    console.log(history.location.pathname);
    console.log(history.location.pathname.indexOf("/shop/confirm/"));

    if(!(history.location.pathname.indexOf("/shop/confirm/") >= 0)) {
        history.push('/shop/products');
    }

    return(
        null
    );
}

export default PrivateReroute;