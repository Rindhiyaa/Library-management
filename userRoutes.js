const express=require("express");
const userRoutes=express.Router();
const User=require("../Models/user");
userRoutes.get("/Login", (req, res) => {
   res.render("login", { title: "Login" });
});

userRoutes.post("/Login", async (req, res) => {
   const { id, password } = req.body;
   try {
       const user = await User.findOne({ id, password });
       if (user) {
           req.session.user = user; 
           res.redirect("/Profile"); 
       } else {
           res.send("Invalid login credentials");
       }
   } catch (error) {
       console.log(error);
       res.status(500).send("An error occurred during login");
   }
});

userRoutes.get("/Register",(req,res)=>{
    res.render("register",{
        title:"Register"
    })
})
userRoutes.post("/Register",async(req,res)=>{
    let data=await req.body;
     const user=new User({
        userType:data.userType,
        name:data.name,
        id:data.id,
        password:data.password
     })
     try{
        user.save();
        res.redirect("/");
     }catch(err){
        console.log(err);
        res.status(500).send("Error registering user");
     }
     
})


module.exports=userRoutes