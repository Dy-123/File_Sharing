import { useState } from "react";

function Login(){
    const [mail,setMail] = useState("");
    const [password,setPassword] = useState("");
    const [matchPassword,setMatchPassword] = useState("");
    const [loginState,setLoginState] = useState(true);
    const [otp,setOtp] = useState("");
    const [sentOtpDisable,setSentOtpDiable] = useState(true);

    const sendOtpEvent = async () => {

        setSentOtpDiable(false);

        const params = new URLSearchParams();
        params.append("mail",mail);

        if(mail!==""){
            const f = await fetch(process.env.REACT_APP_OTP + `?${params.toString()}`);
            if(f.ok){
                console.log("Otp generated successfully");
            }else{
                console.log("Error in generating otp",f.statusText);
            }
        }
    }

    const loginEvent = async () => {

        const form = new FormData();
        form.append("mail",mail);
        form.append("password",password);

        if(mail!=="" && password!==""){
            const req = await fetch(process.env.REACT_APP_LOGIN,{method:'POST', body: form});
            if(req.status===404){
                console.log("User not found");
            }else if(req.status===401){
                console.log("Wrong password");
            }else if(req.status===500){
                console.log("Server error");
            }else{
                console.log("Login Successfull");
            }
        }

    }

    const resetSignupEvent = async () => {
        const form = new FormData();
        form.append("mail",mail);
        form.append("password",password);
        form.append("otpValue",otp);
        if(mail!=="" && password!=="" && otp!==""){
            const req = await fetch(process.env.REACT_APP_RESET_SIGNUP, {method:"POST",body: form});
            if(req.status===401){
                console.log();
            }else if(req.status===500){
                console.log("Server error");
            }else{
                console.log("Register/Reset Successfull");
            }
        }
    }

    const closeButton = () => {
        
    }

    return (
        <div className="login">  
            <div>
                <button onClick={closeButton} style={{border: "none", marginLeft:"285px", marginBottom:"20px", color: "red", fontWeight:"bold", outline:"none"}}>X</button>
                <div style={{'marginBottom':'5px'}}>
                    <button style={{'width':'137px', 'marginRight':'2px'}} type="button" className={`btn ${loginState===true ? 'btn-secondary' : 'btn-light'}`} onClick={(e) => setLoginState(true)}>Login</button>
                    <button style={{'width':'137px', 'marginLeft':'2px'}} type="button" className={`btn ${!loginState===true ? 'btn-secondary' : 'btn-light'}`} onClick={(e) => setLoginState(false)}>Signup</button>
                </div>

                {loginState === true ?  
                (<div>
                    <div>
                        <label >E-mail</label>
                        <input style={{'marginLeft':'43px'}} type="email" onChange={(e) => setMail(e.target.value)}></input>
                    </div>
                    <div>
                        <label>Password</label>
                        <input style={{'marginLeft':'21px'}} type="password" onChange={(e) => setPassword(e.target.value)}></input>
                    </div>
                    <button style={{'marginLeft':'110px','marginTop':'10px'}} type="button" className="btn btn-primary" onClick={loginEvent}>Login</button>
                </div>) : 
                (<div>
                    <div>
                        <label>E-mail</label>
                        <input style={{'marginLeft':'44px'}} type="email" onChange={(e) => setMail(e.target.value)}></input>
                    </div>

                    <div>
                        <button style={{'width':'85px', 'textAlign':'left'}} type="button" className="btn-primary" onClick={sendOtpEvent}>Send OTP</button>
                    
                        {sentOtpDisable===true ? (<></>) :
                        (<>
                            <label style={{'marginLeft':'4px'}}>OTP</label>
                            <input style={{'marginLeft':'7px', 'width':'152px'}} type="number" onChange={(e) => setOtp(e.target.value)}></input>
                        </>)}
                    </div>

                    <div>
                        <label>Password</label>
                        <input style={{'marginLeft':'22px'}} type="password" onChange={(e) => setPassword(e.target.value)}></input>
                    </div>
                    <div>
                        <label>Match Pass</label>
                        <input style={{'marginLeft':'10px'}} type="password" onChange={(e) => setMatchPassword(e.target.value)}></input>
                    </div>
                    <button style={{'marginLeft':'71px','marginTop':'10px'}} type="button" className="btn btn-primary" onClick={resetSignupEvent}>Sign Up / Reset</button>
                </div>)}
            </div>
        </div>
    );
}

export default Login;