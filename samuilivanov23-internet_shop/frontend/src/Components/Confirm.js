import '../App.css';
import JsonRpcClient from '../../node_modules/react-jsonrpc-client/jsonrpcclient';
import { Link } from '../../node_modules/react-router-dom';
import { Button } from '../../node_modules/react-bootstrap';


function Confirm (props) {
    
    const sendVerificationEmail = () => {
        var django_rpc = new JsonRpcClient({
            endpoint: 'http://127.0.0.1:8000/shop/rpc/',
        });

        django_rpc.request(
            'SendVerificationEmail',
            localStorage.getItem('user_email_address'),
        ).then(function(response){
            response = JSON.parse(response);
            alert(response['msg']);

            if(response['msg'] === 'Email send successfully'){
                localStorage.setItem('user_token', response['token']);
                props.history.push('/shop/login');
            }
        }).catch(function(error){
            alert(error['msg']);
        });
    }

    const checkEmailValidity = () => {
        var django_rpc = new JsonRpcClient({
            endpoint: 'http://127.0.0.1:8000/shop/rpc/',
        });
        
        django_rpc.request(
            'CheckEmailValidity',
            localStorage.getItem('user_token'),
        ).then(function(response){
            response = JSON.parse(response);
            alert(response['msg']);

            if(response['msg'] === 'Virification successfull'){
                props.history.push('/shop/login');
                localStorage.setItem('verified', 'true');
            }
            else if(response['msg'] === 'Verification link has expired'){
                sendVerificationEmail();
                alert('Check your mail to for the new link');
            }

        }).catch(function(error){
            alert(error['msg']);
        });
    }

    return(
        <div>
            <Button style={{'margin' : '2em'}}>
                <Link style={{color:'white'}} to={'/shop/login'} onClick={() => checkEmailValidity()}>
                    Verify email
                </Link>
            </Button>
        </div>
    );
}

export default Confirm;