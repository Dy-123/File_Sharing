import { useState } from "react";

function Login(props){
    const [mail,setMail] = useState("");
    const [password,setPassword] = useState("");
    const [matchPassword,setMatchPassword] = useState("");
    const [loginState,setLoginState] = useState(true);
    const [otp,setOtp] = useState("");
    const [sentOtpDisable,setSentOtpDiable] = useState(true);
    const [msg,setMsg] = useState("");

    const emailChange = (e) => {
        setMail(e.target.value);
        setSentOtpDiable(true);
    }

    const sendOtpEvent = async () => {

        const params = new URLSearchParams();
        params.append("mail",mail);

        if(mail===""){
            setMsg("Enter a valid mail id");
        }else{

            setMsg("Requesting OTP");
            const f = await fetch(process.env.REACT_APP_OTP + `?${params.toString()}`);
            if(f.ok){
                setSentOtpDiable(false);
                setMsg("OTP send successfully");
            }else{
                console.log(f);
                setMsg("Invalid mail");
            }
        }
    }

    const loginEvent = async () => {

        const form = new FormData();
        form.append("mail",mail);
        form.append("password",password);

        if(mail===""){
            setMsg("Enter email id");
        }else if(password===""){
            setMsg("Enter Password");
        }else if(mail!=="" && password!==""){

            const req = await fetch(process.env.REACT_APP_LOGIN,{method:'POST', body: form, credentials: 'include'});   // include for cross origin request(different url for frontend(3000) and backend server(5000))
            if(req.status===404){
                setMsg("User not found");
            }else if(req.status===401){
                setMsg("Wrong password");
            }else if(req.status===500){
                setMsg("Server error");
            }else{
                setMsg("Login Successfull");
                closeModal();
            }

        }

    }

    const resetSignupEvent = async () => {
        const form = new FormData();
        form.append("mail",mail);
        form.append("password",password);
        form.append("otpValue",otp);

        if(mail===""){
            setMsg("Enter mail id");
        }else if(password===""){
            setMsg("Enter Password");
        }else if(matchPassword===""){
            setMsg("Enter Match Password");
        }else if(otp===""){
            setMsg("Enter OTP");
        }else if(password!==matchPassword){
            setMsg("Password Mismatch");
        }else if(mail!=="" && password!=="" && otp!=="" && password===matchPassword){
            const req = await fetch(process.env.REACT_APP_RESET_SIGNUP, {method:"POST",body: form, credentials: 'include'});
            if(req.status===401){
                setMsg("Wrong OTP");
            }else if(req.status===500){
                setMsg("Server error");
            }else{
                setMsg("Register/Reset Successfull");
                closeModal();
            }
        }
    }

    const closeModal = () => {
        props.setLoginResetDisable(true);
    }

    return (
        <div className="login">  
            <div style={{width:"300px", backgroundColor:"white"}}>
                <button onClick={closeModal} style={{border: "none", marginLeft:"277px", marginBottom:"20px", color: "red", fontWeight:"bold", outline:"none"}}>X</button>
                <div style={{'marginBottom':'5px'}}>
                    <button style={{'width':'137px', 'marginRight':'2px', marginLeft:"10px"}} type="button" className={`btn ${loginState===true ? 'btn-secondary' : 'btn-light'}`} onClick={(e) => {setLoginState(true); setMsg("")}}>Login</button>
                    <button style={{'width':'137px', 'marginLeft':'2px'}} type="button" className={`btn ${!loginState===true ? 'btn-secondary' : 'btn-light'}`} onClick={(e) => {setLoginState(false); setMsg("")}}>Signup</button>
                </div>

                {loginState === true ?  
                (<div className="login-signup-card">

                    <div className="input-container">
                        <div className="did-floating-label-content">
                            <input className="did-floating-input" style={{minWidth:"250px"}} type="email" placeholder=" " onChange={emailChange}></input>
                            <label className="did-floating-label">E-mail</label>
                        </div>
                    </div>

                    <div className="input-container">
                        <div className="did-floating-label-content">
                            <input className="did-floating-input" style={{minWidth:"250px"}} placeholder=" " type="password" onChange={(e) => setPassword(e.target.value)}></input>
                            <label className="did-floating-label">Password</label>
                        </div>
                    </div>

                    <button type="button" className="btn btn-primary" onClick={loginEvent}>Login</button>
                </div>) : 
                (<div className="login-signup-card">

                    <div className="input-container">
                        <div className="did-floating-label-content">
                            <input className="did-floating-input" style={{minWidth:"250px"}} type="email" placeholder=" " onChange={emailChange}></input>
                            <label className="did-floating-label">E-mail</label>
                        </div>
                    </div>

                    <div className="input-container">
                        {!sentOtpDisable===true ? <></> :
                            <button class="btn btn-outline-secondary" type="button" onClick={sendOtpEvent}>Send OTP</button>
                        }

                        {sentOtpDisable===true ? (<></>) :
                        (<>

                            {/* <label style={{'marginLeft':'6px'}}>OTP</label>
                            <input style={{'marginLeft':'7px', 'width':'152px'}} type="number" onChange={(e) => setOtp(e.target.value)}></input> */}

                            <div className="input-container">
                                <div className="did-floating-label-content">
                                    <input className="did-floating-input" style={{minWidth:"250px"}} placeholder=" " type="number" onChange={(e) => setOtp(e.target.value)}></input>
                                    <label className="did-floating-label">OTP</label>
                                </div>
                            </div>
                        </>)}

                    </div>

                    <div className="input-container">
                        <div className="did-floating-label-content">
                            <input className="did-floating-input" style={{minWidth:"250px"}} placeholder=" " type="password" onChange={(e) => setPassword(e.target.value)}></input>
                            <label className="did-floating-label">Password</label>
                        </div>
                    </div>

                    <div className="input-container">
                        <div className="did-floating-label-content">
                            <input className="did-floating-input" style={{minWidth:"250px"}} placeholder=" " type="password" onChange={(e) => setMatchPassword(e.target.value)}></input>
                            <label className="did-floating-label">Confirm Password</label>
                        </div>
                    </div>


                    <button type="button" className="btn btn-primary" onClick={resetSignupEvent}>Signup / Reset</button>
                </div>)}

                <div>
                    <p className="loginErrTxt">{msg}</p>
                </div>
            </div>
        </div>
    );
}

export default Login;