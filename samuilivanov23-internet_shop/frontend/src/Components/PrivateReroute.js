import { useHistory } from '../../node_modules/react-router-dom';


function PrivateReroute(){
    const history = useHistory();
    console.log(history);
    history.push('/shop/products');

    return(
        null
    );
}

export default PrivateReroute;