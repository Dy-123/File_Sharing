var router = require('express').Router();

router.get("/",async (req,res)=>{

    console.log("Log out requet received");
  
    // From express documentation of res.clearCookie: Web browsers and other compliant clients will only clear 
    // the cookie if the given options is identical to those given to res.cookie(), excluding expires and maxAge.
    if(req.cookies!==undefined && req.cookies.pass!==undefined){
  
      const cookieOptions = {
        httpOnly: true,
        expires: new Date(0)
      }
      res.clearCookie('pass',cookieOptions);
      res.clearCookie('mail',{expires: new Date(0)});
  
    }else{
      if(req.cookies!==undefined){
        res.clearCookie('mail',{expires: new Date(0)});
      }
    }
    res.send("Logout successfull");
  
});

module.exports = router;