import ReactDOM from "react-dom";
import Login from "../components/Login";

function LoginModal(props){
    return ReactDOM.createPortal(<Login setLoginResetDisable={props.setLoginResetDisable}/>, document.getElementById("loginModal"));
}

export default LoginModal;