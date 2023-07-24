import { useEffect, useState } from 'react';
import LoginModal from '../modals/LoginModal';
import '../App.css';

function Header(){
    const [loginResetDisable,setLoginResetDisable] = useState(true);
    const [showLoginOption,setShowLoginOption] = useState(true);

    const loginClickEvent = () => {
        setLoginResetDisable(false);
    }

    useEffect(()=>{

        if(document.cookie!==''){
            const cookieString = document.cookie;
            const cookies = cookieString.split(';');

            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                const cookieName = cookie.split('=')[0];    // [cookieName, cookieValue] = cookie.split('=');

                if (cookieName === 'mail') {
                    setShowLoginOption(false);
                }
            }
        }
    },[loginResetDisable]);

    const logoutClickEvent = async () => {
        await fetch(process.env.REACT_APP_LOGOUT, {credentials: 'include'});
        console.log(document.cookie);
        if(document.cookie===''){              // If all cookies are cleared for website then only logout
            setShowLoginOption(true);
        }
    }

    return (
        <>
            <div className="header">
                <h1>FILE SHARING</h1>
                {showLoginOption===true ?
                <button onClick={loginClickEvent} type="button" className="btn btn-light ">Log in</button> :
                <button onClick={logoutClickEvent} type="button" className="btn btn-light ">Log out</button>}
                {!loginResetDisable && <LoginModal setLoginResetDisable={setLoginResetDisable} />}
            </div>
        </>
    );
}

export default Header;