import { useState } from 'react';
import LoginModal from '../modals/LoginModal';
import '../App.css';

function Header(){
    const [loginResetDisable,setLoginResetDisable] = useState(true);

    const loginClickEvent = () => {
        setLoginResetDisable(false);
    }

    return (
        <>
            <div className="header">
                <h1>FILE SHARING</h1>
                <button onClick={loginClickEvent} type="button" className="btn btn-light ">Log in</button>
                {!loginResetDisable && <LoginModal setLoginResetDisable={setLoginResetDisable} />}
            </div>
        </>
    );
}

export default Header;