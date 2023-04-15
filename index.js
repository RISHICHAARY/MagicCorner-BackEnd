const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');

require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST)

let mailTransporter = nodemailer.createTransport(
    {
        service : "gmail",
        auth : {
            user : "magiccornerin@gmail.com",
            pass : process.env.GMAIL
        }
    }
);

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect( process.env.MONGO , 
{
    useNewUrlParser:true,
});

const user_model = require('./models/user_model');
const product_model = require('./models/product_model');
const order_model = require('./models/orders_model');
const enrollment_model = require('./models/enrollment_model');
const offer_model = require('./models/Offers_model');
const workshop_model = require('./models/workshops_model');
const admin_model = require('./models/admin_model');
const question_model = require('./models/qustion_model');
const contact_query_model = require('./models/contact_query');
const review_model = require('./models/Review_model');
const category_model = require('./models/Category_model');

//-------------------------------------------------------------------Password_Mailer--------------------------------------------------------------

app.put('/PasswordMailer' , async (req , res) => {
    if(req.body.type == 'user'){
        await user_model.find({email : req.body.email}, (err , result) => {
            if(err){console.log(err);}
            let details = {
                from :"magiccornerin@gmail.com",
                to: req.body.email,
                subject : "Password of your magic corner account.",
                text : "Hi "+result[0].full_name+","+"."+result[0].password+" is your Password."
            };
            mailTransporter.sendMail( details , (err) =>{
                if(err){
                    console.log(err);
                }
            } )
            res.send("Done");
        }).clone();
    }
    else{
        await admin_model.find({email : req.body.email}, (err , result) => {
            if(err){console.log(err);}
            let details = {
                from :"magiccornerin@gmail.com",
                to: req.body.email,
                subject : "Password of your magic corner account.",
                text : "Hi "+result[0].full_name+","+"."+result[0].password+" is your Password."
            };
            mailTransporter.sendMail( details , (err) =>{
                if(err){
                    console.log(err);
                }
            } )
            res.send("Done");
        }).clone();
    }
});
//------------------------------------------------------------------Payment----------------------------------------------------------------------

app.post("/payment", async (req, res) => {

	let { amount, id } = req.body
	try {
		const payment = await stripe.paymentIntents.create({
			amount,
			currency: "INR",
			description: req.body.name,
			payment_method: id,
			confirm: true,
		})
		res.json({
			message: "Payment successful",
			success: true
		})
	} catch (error) {
		console.log("Error", error)
		res.json({
			message: "Payment failed",
			success: false
		})
	}
})

//------------------------------------------------------------------Add_Offers--------------------------------------------------------------------

app.put("/addOffers" , async (req , res)=>{
    const Offer = new offer_model({
        name : req.body.name,
        min_price : req.body.min,
        discount : req.body.discount,
        method : req.body.type,
    });
    try{
        await Offer.save();
        res.send("Done");
    }
    catch{
        console.log("Error");
    }
});

app.put("/addReview" , async (req , res)=>{
    const Review = new review_model({
        name : req.body.name,
        loc : req.body.loc,
        rev : req.body.rev,
        rating : req.body.rating,
    });
    try{
        await Review.save();
        res.send("Done");
    }
    catch{
        console.log("Error");
    }
});

app.put("/addCategory" , async (req , res)=>{
    const Category = new category_model({
        name : req.body.name,
        image : req.body.img,
    });
    try{
        await Category.save();
        res.send("Done");
    }
    catch{
        console.log("Error");
    }
});

//----------------------------------------------------------------Delete_Offer-------------------------------------------------------------------

app.put("/deleteOffers" , (req , res)=>{
    offer_model.deleteOne({_id : req.body.id} , (err , result)=>{
        if(err){console.log(err)}
        res.send("Done");
    });
});

//------------------------------------------------------------------Get_Offers-------------------------------------------------------------------

app.get("/getOffers" ,async (req , res) => {
    await offer_model.find((err , result)=>{
        if(err){console.log(err)}
        res.send(result)
    }).sort({min_price : -1}).clone();
});

app.get("/getReview" ,async (req , res) => {
    await review_model.find((err , result)=>{
        if(err){console.log(err)}
        res.send(result);
    }).clone();
});

app.get("/getCategory" ,async (req , res) => {
    await category_model.find((err , result)=>{
        if(err){console.log(err)}
        res.send(result);
    }).clone();
});

//------------------------------------------------------------------Add_Orders--------------------------------------------------------------------

app.put("/addOrder" , async ( req , res )=>{
    const order = new order_model({
        name : req.body.name,
        mobile : req.body.mobile,
        email : req.body.email,
        products : req.body.products,
        payment_mode : req.body.pm,
        status : "ORDERED",
        total : req.body.total,
        stotal : req.body.sTotal,
        discount : req.body.discount,
        address : req.body.address,
    });
    try{
        var order_id = "";
        await order.save();
        order_model.find((err , result)=>{
            if(err){console.log(err)}
            order_id = result[Object.keys(result).length-1]._id;
            if(req.body.type == "user"){
                user_model.updateOne({_id : req.body.id} , {$push : {orders : order_id} , $set : {"on_cart.id" : [] , "on_cart.cuz" : [] , "on_cart.quant" : []}} , (err , result ) =>{
                    if(err){console.log(err)}
                    let details = {
                        from :"magiccornerin@gmail.com",
                        to: req.body.email,
                        subject : "Magic Corner Order Confirmation",
                        text : "Hi!! your order has been placed successfully. Further information's will be sent in fore coming mails."
                    };
                    mailTransporter.sendMail( details , (err) =>{
                        if(err){
                            console.log(err);
                        }
                    })
                    res.send("Done");
                })
            }
            else{
                admin_model.updateOne({_id : req.body.id} , {$push : {orders : order_id} , $set : {"on_cart.id" : [] , "on_cart.cuz" : [] , "on_cart.quant" : []}} , (err , result ) =>{
                    if(err){console.log(err)}
                    let details = {
                        from :"magiccornerin@gmail.com",
                        to: req.body.email,
                        subject : "Magic Corner Order Confirmation",
                        text : "Hi!! your order has been placed successfully. Further information's will be sent in fore coming mails."
                    };
                    mailTransporter.sendMail( details , (err) =>{
                        if(err){
                            console.log(err);
                        }
                    })
                    res.send("Done");
                    }
                )
            }
        })
    }catch(err){
        console.log(err);
    }
});

//--------------------------------------------------------------Add_Enrollments-----------------------------------------------------------------

app.put("/addEnrollment" , async ( req , res )=>{
    const order = new enrollment_model({
        name : req.body.name,
        mobile : req.body.mobile,
        email : req.body.email,
        wn : req.body.wn,
        total : req.body.total,
    });
    try{
        var order_id = "";
        await order.save();
        enrollment_model.find((err , result)=>{
            if(err){console.log(err)}
            order_id = result[Object.keys(result).length-1]._id;
            if(req.body.type == "user"){
                user_model.updateOne({_id : req.body.id} , {$push : {workshops : order_id}} , (err , result ) =>{
                    if(err){console.log(err)}
                        let details = {
                            from :"magiccornerin@gmail.com",
                            to: req.body.email,
                            subject : "Magic Corner workshop enrollment Confirmation",
                            text : "Hi!! "+ req.body.name +" you have been successfully enrolled to the workshop '"+ req.body.wn +"'. Further information's will be sent in following watsapp group : "+req.body.wg+" ."
                        };
                        mailTransporter.sendMail( details , (err) =>{
                            if(err){
                                console.log(err);
                            }
                        })
                        res.send("Done");
                    })
                }
            else{
                admin_model.updateOne({_id : req.body.id} , {$push : {workshops : order_id}} , (err , result ) =>{
                    if(err){console.log(err)}
                    let details = {
                        from :"magiccornerin@gmail.com",
                        to: req.body.email,
                        subject : "Magic Corner workshop enrollment Confirmation",
                        text : "Hi!! "+ req.body.name +" you have been successfully enrolled to the workshop '"+ req.body.wn +"'. Further information's will be sent in following watsapp group : "+req.body.wg+" ."
                    };
                    mailTransporter.sendMail( details , (err) =>{
                        if(err){
                            console.log(err);
                        }
                    })
                    res.send("Done");
                })
                    }
                })
    }catch(err){
        console.log(err);
    }
});

//---------------------------------------------------------------Update_Orders-------------------------------------------------------------------

app.put("/updateOrder" , (req , res)=>{
    order_model.updateOne({_id : req.body.id} , {$set : {status : req.body.status}} , (err , result)=>{
        if(err){console.log(err)}
        res.send(result);
    });
});

//---------------------------------------------------------------get_User_Orders----------------------------------------------------------------

app.put("/userOrders" , (req , res)=>{
    order_model.find({_id : {$in : req.body.id}} , (err , result)=>{
        if(err){console.log(err)}
        res.send(result);
    })
})

//---------------------------------------------------------------get_User_Workshops----------------------------------------------------------------

app.put("/userWorkshops" , (req , res)=>{
    enrollment_model.find({_id : {$in : req.body.id}} , (err , result)=>{
        if(err){console.log(err)}
        res.send(result);
    })
})

//-----------------------------------------------------------------Get_Orders---------------------------------------------------------------------

app.get("/getOrders" , (req , res) => {
    order_model.find( { status : {$ne : "CLOSED"} },(err , result)=>{
        if(err){console.log(err)}
        res.send(result);
    }).sort({status:-1})
})

//-----------------------------------------------------------------Get_Enrollments---------------------------------------------------------------------

app.get("/getEnrollments" , (req , res) => {
    enrollment_model.find((err , result)=>{
        if(err){console.log(err)}
        res.send(result);
    }).sort({wn:1})
})

//-----------------------------------------------------------------Delete_Orders------------------------------------------------------------------

app.put("/deleteOrder" , (req , res) => {
    order_model.updateOne({_id : req.body.id} , {status : "CLOSED"} , (err , result)=>{
        if(err){console.log(err)}
        res.send("Done");
    })
});

//------------------------------------------------------------------OTP_Mailer---------------------------------------------------------------------

app.put('/OtpMailer' , async (req , res) => {
    if(req.body.type == 'user'){
        await user_model.find({email : req.body.email}, (err , result) => {
            if(err){console.log(err);}
            let details = {
                from :"magiccornerin@gmail.com",
                to: req.body.email,
                subject : "OTP To verify your magic corner account.",
                text : "Hi "+result[0].full_name+", Use "+req.body.otp+" To get your Magic Corner Account Password."
            };
            mailTransporter.sendMail( details , (err) =>{
                if(err){
                    console.log(err);
                }
            })
            res.send("Done");
        }).clone();
    }
    else{
        await admin_model.find({email : req.body.email}, (err , result) => {
            if(err){console.log(err);}
            let details = {
                from :"magiccornerin@gmail.com",
                to: req.body.email,
                subject : "OTP To verify your magic corner account.",
                text : "Hi "+result[0].full_name+", Use "+req.body.otp+" To get your Magic Corner Account Password."
            };
            mailTransporter.sendMail( details , (err) =>{
                if(err){
                    console.log(err);
                }
            })
            res.send("Done");
        }).clone();
    }
})

//--------------------------------------------------------------------User_Mailer----------------------------------------------------------------------

app.post('/userMailer' , (req , res ) => {
    let details = {
        from :"magiccornerin@gmail.com",
        to: req.body.mail,
        subject : "OTP To verify your magic corner account.",
        text : "Hi "+req.body.name+","+" Welcome To Magic Corner. Use "+req.body.otp+" To validate your Magic Corner Account. Once Validated You can start using your account after getting a confirmation mail from us."
    };
    mailTransporter.sendMail( details , (err) =>{
        if(err){
            console.log(err);
        }
    } )
});

//--------------------------------------------------------------------Admin_Mailer----------------------------------------------------------------------

app.post('/adminMailer' , (req , res ) => {
    let details = {
        from :"magiccornerin@gmail.com",
        to: "rishichaary1903@gmail.com",
        subject : "OTP To verify your magic corner account.",
        text :"Use "+req.body.otp+" To make Mr/Mrs : "+req.body.name+" as Magic Corner Admin.1"
    };
    mailTransporter.sendMail( details , (err) =>{
        if(err){
            console.log(err);
        }
    } )
});

//---------------------------------------------------------------Create_User-----------------------------------------------------------------------

app.put("/addUser" , async (req,res) => {
    const user = new user_model({
        image : req.body.image_url,
        full_name : req.body.name ,
        email : req.body.email ,
        password : req.body.password ,
        mobile_no : req.body.mobile ,
        gender : req.body.gender ,
        age : req.body.age ,
        dob : req.body.dob ,
        "address.house_no" : req.body.house ,
        "address.street" : req.body.street ,
        "address.area" : req.body.area ,
        "address.city" : req.body.city ,
        "address.state" : req.body.state ,
        "address.pin_code" : req.body.pincode ,
    });
    try{
        var mail = req.body.email;
        await user.save();
        let details = {
            from :"magiccornerin@gmail.com",
            to: mail,
            subject : "Magic Corner Account Established",
            text : "Hi!! "+req.body.name+", You have dived into the world of handmade things. Start Enjoying Your Shopping."
        };
        mailTransporter.sendMail( details , (err) =>{
            if(err){
                console.log(err);
            }
        } )
        res.send("Done");
    }catch(err){
        console.log(err);
    }
});

//---------------------------------------------------------------Create_Admin-----------------------------------------------------------------------

app.put("/addAdmin" , async (req,res) => {
    const user = new admin_model({
        image : req.body.image_url,
        full_name : req.body.name ,
        email : req.body.email ,
        password : req.body.password ,
        mobile_no : req.body.mobile ,
        gender : req.body.gender ,
        age : req.body.age ,
        dob : req.body.dob ,
        "address.house_no" : req.body.house ,
        "address.street" : req.body.street ,
        "address.area" : req.body.area ,
        "address.city" : req.body.city ,
        "address.state" : req.body.state ,
        "address.pin_code" : req.body.pincode ,
    });
    try{
        var mail = req.body.email;
        await user.save();
        let details = {
            from :"magiccornerin@gmail.com",
            to: mail,
            subject : "Magic Corner Account Confirmation.",
            text : "Hi!! "+req.body.name+", You have dived into the world of handmade things. Start Enjoying Your Shopping."
        };
        mailTransporter.sendMail( details , (err) =>{
            if(err){
                console.log(err);
            }
        } )
        res.send("Done");
    }catch(err){
        console.log(err);
    }
});

//---------------------------------------------------------------Create_Product--------------------------------------------------------------------

app.put("/addProduct" , async (req , res) => {
    const Product = new product_model(
        {
            image :req.body.image_url,
            name : req.body.name,
            description : req.body.description,
            newprice : req.body.newprice,
            oldprice : req.body.oldprice,
            category : req.body.category,
            tags : req.body.tags,
            status : req.body.state,
            length : req.body.length,
            width : req.body.breath,
            height : req.body.height,
            extras : req.body.infos,
            cod : req.body.cod,
        }
    );
    try{
        await Product.save();
        res.send("Done");
    }catch(err){
        console.log(err);
    }
});

//------------------------------------------------------------Add_Workshop------------------------------------------------------------------------

app.put("/addWorkshop" , async (req , res) => {
    const Workshop = new workshop_model(
        {
            image :req.body.image_url,
            name : req.body.name,
            description : req.body.description,
            newprice : req.body.newprice,
            oldprice : req.body.oldprice,
            watsapp_grp : req.body.watsapp_grp,
        }
    );
    try{
        await Workshop.save();
        res.send("Done");
    }catch(err){
        console.log(err);
    }
});

//------------------------------------------------------------All_Featured_Products------------------------------------------------------------------------

app.get("/getAllFeaturedProducts" , ( req , res ) => {
    product_model.find({status: "ON" }, (err , result) => {
        if(err){
            console.log(err);
        }
        res.send(result);
    });
});

//-------------------------------------------------------------All_Products----------------------------------------------------------------------

app.get("/getAllWorkshops" , ( req , res ) => {
    workshop_model.find({ name : {$ne : null} }, (err , result) => {
        if(err){
            console.log(err);
        }
        res.send(result);
    });
});

//--------------------------------------------------------------All_Users-------------------------------------------------------------------------

app.get("/allUsers" , ( req , res ) => {
    user_model.find({projection : {email : true} } , (err , result) => {
        if(err){
            console.log(err);
        }
        res.send(result);
    });
});

//--------------------------------------------------------------All_Admins-------------------------------------------------------------------------

app.get("/allAdmins" , ( req , res ) => {
    admin_model.find({projection : {email : true} } , (err , result) => {
        if(err){
            console.log(err);
        }
        res.send(result);
    });
});

//-----------------------------------------------------------Select_Products----------------------------------------------------------------------
app.put("/getProducts" , (req , res) => {
        Selected_Product_Category = req.body.Category;
        Selected_Product_Tag = req.body.Tag;
        if(Selected_Product_Category == "All"){Selected_Product_Category = null}
        if(Selected_Product_Tag == "All"){Selected_Product_Tag = null}
        if(Selected_Product_Category  != null && Selected_Product_Tag != null){
            product_model.find({category : Selected_Product_Category , tags : Selected_Product_Tag} ,(err , result) =>{
                if(err){
                    console.log(err);
                }
                else{
                    res.json(result);
                }
            });
        }
        else if(Selected_Product_Category != null && Selected_Product_Tag == null ){
            product_model.find({category : Selected_Product_Category} ,(err , result) =>{
                if(err){
                    console.log(err);
                }
                else{
                    res.json(result);
                }
            });
        }
        else if(Selected_Product_Tag != null && Selected_Product_Category == null){
            console.log(Selected_Product_Tag);
            product_model.find({tags : Selected_Product_Tag} ,(err , result) =>{
                if(err){
                    console.log(err);
                }
                else{
                    console.log(result);
                    res.json(result);
                }
            });
        }
        else{
            product_model.find({ name : {$ne : null} }, (err , result) => {
                if(err){
                    console.log(err);
                }
                res.send(result);
            });
        }
    }
);

app.put("/getProductsSPA" , (req , res) => {
    Selected_Product_Category = req.body.Category;
    Selected_Product_Tag = req.body.Tag;
    if(Selected_Product_Category == "All"){Selected_Product_Category = null}
    if(Selected_Product_Tag == "All"){Selected_Product_Tag = null}
    if(Selected_Product_Category  != null && Selected_Product_Tag != null){
        product_model.find({category : Selected_Product_Category , tags : Selected_Product_Tag} ,(err , result) =>{
            if(err){
                console.log(err);
            }
            else{
                res.json(result);
            }
        }).sort({newprice : 1});
    }
    else if(Selected_Product_Category != null && Selected_Product_Tag == null ){
        product_model.find({category : Selected_Product_Category} ,(err , result) =>{
            if(err){
                console.log(err);
            }
            else{
                res.json(result);
            }
        }).sort({newprice : 1});
    }
    else if(Selected_Product_Tag != null && Selected_Product_Category == null){
        console.log(Selected_Product_Tag);
        product_model.find({tags : Selected_Product_Tag} ,(err , result) =>{
            if(err){
                console.log(err);
            }
            else{
                console.log(result);
                res.json(result);
            }
        }).sort({newprice : 1});
    }
    else{
        product_model.find({ name : {$ne : null} }, (err , result) => {
            if(err){
                console.log(err);
            }
            res.send(result);
        }).sort({newprice : 1});
    }
}
);

app.put("/getProductsSPD" , (req , res) => {
    Selected_Product_Category = req.body.Category;
    Selected_Product_Tag = req.body.Tag;
    if(Selected_Product_Category == "All"){Selected_Product_Category = null}
    if(Selected_Product_Tag == "All"){Selected_Product_Tag = null}
    if(Selected_Product_Category  != null && Selected_Product_Tag != null){
        product_model.find({category : Selected_Product_Category , tags : Selected_Product_Tag} ,(err , result) =>{
            if(err){
                console.log(err);
            }
            else{
                res.json(result);
            }
        }).sort({newprice : -1});
    }
    else if(Selected_Product_Category != null && Selected_Product_Tag == null ){
        product_model.find({category : Selected_Product_Category} ,(err , result) =>{
            if(err){
                console.log(err);
            }
            else{
                res.json(result);
            }
        }).sort({newprice : -1});
    }
    else if(Selected_Product_Tag != null && Selected_Product_Category == null){
        console.log(Selected_Product_Tag);
        product_model.find({tags : Selected_Product_Tag} ,(err , result) =>{
            if(err){
                console.log(err);
            }
            else{
                console.log(result);
                res.json(result);
            }
        }).sort({newprice : -1});
    }
    else{
        product_model.find({ name : {$ne : null} }, (err , result) => {
            if(err){
                console.log(err);
            }
            res.send(result);
        }).sort({newprice : -1});
    }
}
);

app.put("/getProductsSNA" , (req , res) => {
    Selected_Product_Category = req.body.Category;
    Selected_Product_Tag = req.body.Tag;
    if(Selected_Product_Category == "All"){Selected_Product_Category = null}
    if(Selected_Product_Tag == "All"){Selected_Product_Tag = null}
    if(Selected_Product_Category  != null && Selected_Product_Tag != null){
        product_model.find({category : Selected_Product_Category , tags : Selected_Product_Tag} ,(err , result) =>{
            if(err){
                console.log(err);
            }
            else{
                res.json(result);
            }
        }).sort({name : 1});
    }
    else if(Selected_Product_Category != null && Selected_Product_Tag == null ){
        product_model.find({category : Selected_Product_Category} ,(err , result) =>{
            if(err){
                console.log(err);
            }
            else{
                res.json(result);
            }
        }).sort({name : 1});
    }
    else if(Selected_Product_Tag != null && Selected_Product_Category == null){
        console.log(Selected_Product_Tag);
        product_model.find({tags : Selected_Product_Tag} ,(err , result) =>{
            if(err){
                console.log(err);
            }
            else{
                console.log(result);
                res.json(result);
            }
        }).sort({name : 1});
    }
    else{
        product_model.find({ name : {$ne : null} }, (err , result) => {
            if(err){
                console.log(err);
            }
            res.send(result);
        }).sort({name : 1});
    }
}
);

app.put("/getProductsSND" , (req , res) => {
    Selected_Product_Category = req.body.Category;
    Selected_Product_Tag = req.body.Tag;
    if(Selected_Product_Category == "All"){Selected_Product_Category = null}
    if(Selected_Product_Tag == "All"){Selected_Product_Tag = null}
    if(Selected_Product_Category  != null && Selected_Product_Tag != null){
        product_model.find({category : Selected_Product_Category , tags : Selected_Product_Tag} ,(err , result) =>{
            if(err){
                console.log(err);
            }
            else{
                res.json(result);
            }
        }).sort({name : -1});
    }
    else if(Selected_Product_Category != null && Selected_Product_Tag == null ){
        product_model.find({category : Selected_Product_Category} ,(err , result) =>{
            if(err){
                console.log(err);
            }
            else{
                res.json(result);
            }
        }).sort({name : -1});
    }
    else if(Selected_Product_Tag != null && Selected_Product_Category == null){
        console.log(Selected_Product_Tag);
        product_model.find({tags : Selected_Product_Tag} ,(err , result) =>{
            if(err){
                console.log(err);
            }
            else{
                console.log(result);
                res.json(result);
            }
        }).sort({name : -1});
    }
    else{
        product_model.find({ name : {$ne : null} }, (err , result) => {
            if(err){
                console.log(err);
            }
            res.send(result);
        }).sort({name : -1});
    }
}
);

//---------------------------------------------------------------Select_Users----------------------------------------------------------------------

app.post("/getUsers" , (req , res) => {
    const Selected_User_Data = req.body.name;
} );

app.get("/getUsers" , (req , res) => {
    user_model.findOne({full_name : Selected_User_Data} , (err , result) =>{
        if(err){
            console.log(err);
        }
        else{
            res.send(result);
        }
    } );
});

//--------------------------------------------------------------Update_Product-------------------------------------------------------------------

app.put("/updateProducts" , async (req , res) => {
    try{
        var newDescription = req.body.description;
        var newNewPrice = req.body.newprice;
        var newOldPrice = req.body.oldprice;
        var newCategory = req.body.category;
        var newTags = req.body.tags;
        var newStatus = req.body.state;
        var newLength = req.body.length;
        var newWidth = req.body.breath;
        var newHeight = req.body.height;
        var newCOD = req.body.cod;
        var newInfos = req.body.infos;
        if(newDescription != null){
            await product_model.updateOne({_id : req.body.id} , {$set : {description : newDescription}});
        }
        if(newNewPrice != 0){
            await product_model.updateOne({_id : req.body.id} , {$set : {newprice : newNewPrice}});
        }
        if(newOldPrice != 0){
            await product_model.updateOne({_id : req.body.id} , {$set : {oldprice : newOldPrice}});
        }
        if(newCategory != null){
            await product_model.updateOne({_id : req.body.id} , {$set : {category : newCategory}});
        }
        if(newTags != null){
            await product_model.updateOne({_id : req.body.id} , {$set : {tags : newTags}});
        }
        if(newStatus != null){await product_model.updateOne({_id : req.body.id} , {$set : {status : newStatus}});}
        if(newLength != null){await product_model.updateOne({_id : req.body.id} , {$set : {length : newLength}});}
        if(newHeight != null){await product_model.updateOne({_id : req.body.id} , {$set : {height : newHeight}});}
        if(newWidth != null){await product_model.updateOne({_id : req.body.id} , {$set : {width: newWidth}});}
        if(newCOD != null){await product_model.updateOne({_id : req.body.id} , {$set : {cod : newCOD}});}
        if(newInfos != null){await product_model.updateOne({_id : req.body.id} , {$set : {extras : newInfos}});}
        res.send("Done");

    }catch(err){
        console.log(err);
    } 
} );

//--------------------------------------------------------------Update_Workshop-------------------------------------------------------------------

app.put("/UpdateWorkshops" , async (req , res) => {
    try{
        var newDescription = req.body.description;
        var newNewPrice = req.body.newprice;
        var newOldPrice = req.body.oldprice;
        var newwg = req.body.wg;
        if(newDescription != null){
            await workshop_model.updateOne({_id : req.body.id} , {$set : {description : newDescription}});
        }
        if(newNewPrice != 0){
            await workshop_model.updateOne({_id : req.body.id} , {$set : {newprice : newNewPrice}});
        }
        if(newOldPrice != 0){
            await workshop_model.updateOne({_id : req.body.id} , {$set : {oldprice : newOldPrice}});
        }
        if(newwg != null){
            await workshop_model.updateOne({_id : req.body.id} , {$set : {watsapp_grp : newwg}});
        }
        res.send("Done");
    }catch(err){
        console.log(err);
    } 
} );

//----------------------------------------------------------------------------Delete_Product--------------------------------------------------------------------------

app.put("/DeleteProduct" , async (req , res) => {
    await product_model.deleteOne({_id : req.body.id} , (err , result) => {
        if(err){console.log(err);}
        res.send("Done");
    }).clone();
})

//---------------------------------------------------------------------------Delete_Workshop-------------------------------------------------------

app.put("/DeleteWorkshop" , async (req , res) => {
    await workshop_model.deleteOne({_id : req.body.id} , (err , result) => {
        if(err){console.log(err);}
        res.send("Done");
    }).clone();
})

//---------------------------------------------------------------------------Delete_User-------------------------------------------------------

app.post("/DeleteUser" , async (req , res) => {
    await user_model.deleteOne({email : req.body.email});
});

//-------------------------------------------------------------------------Add_to_Cart-------------------------------------------------------------

app.put("/addToCart" , async(req , res) => {
    if(req.body.type == "user"){
        await user_model.updateOne({email:req.body.user , _id:req.body.id} , {$push : {"on_cart.id" : req.body.product_id}});
        await user_model.updateOne({email:req.body.user , _id:req.body.id} , {$push : {"on_cart.cuz" : req.body.cuz}});
        await user_model.updateOne({email:req.body.user , _id:req.body.id} , {$push : {"on_cart.quant" : req.body.quant}});
        res.send("Done");
    }
    else{
        await admin_model.updateOne({email:req.body.user , _id:req.body.id} , {$push : {"on_cart.id" : req.body.product_id}});
        await admin_model.updateOne({email:req.body.user , _id:req.body.id} , {$push : {"on_cart.cuz" : req.body.cuz}});
        await admin_model.updateOne({email:req.body.user , _id:req.body.id} , {$push : {"on_cart.quant" : req.body.quant}});
        res.send("Done");
    }
});

//---------------------------------------------------------------------Add_to_Wish_List----------------------------------------------------------

app.put("/addToWishList" , async(req , res) => {
    if(req.body.type == "user"){
        await user_model.updateOne({email:req.body.user , _id:req.body.id} , {$push : {wishlist : req.body.product_id}} , (err , result)=>{
            if(err){console.log(err);}
            res.send("Done");
        }).clone();
    }
    else{
        await admin_model.updateOne({email:req.body.user , _id:req.body.id} , {$push : {wishlist : req.body.product_id}} , (err,result) =>{
            res.send("Done");
        }).clone();
    }
});

//-------------------------------------------------------------------------Selected_Products--------------------------------------------------------

app.put("/getSelectedProducts" , (req,res) => {
    product_model.find({_id:{$in:req.body.id.id}} , (err , result) => {
        if(err){
            console.log(err);
        }
        res.send(result);
    }).clone()
})

app.put("/getSelectedProductss" , (req,res) => {
    product_model.find({_id:{$in:req.body.id}} , (err , result) => {
        if(err){
            console.log(err);
        }
        res.send(result);
    }).clone()
})

//--------------------------------------------------------------------------Get_Cart_List----------------------------------------------------------

app.put("/getCart" , (req , res) => {
    if(req.body.type == "user"){
        user_model.find({_id:req.body.id} , (err , result) => {
            if(err){console.log(err);}
            res.send(result);
        }).clone()
    }
    else{
        admin_model.find({_id:req.body.id} , (err , result) => {
            if(err){console.log(err);}
            res.send(result);
        }).clone()
    }
});

//----------------------------------------------------------------------------Delete_Cart---------------------------------------------------------

app.put("/deleteMe" , (req , res)=>{
    if(req.body.type === "user"){
        user_model.updateOne({_id:req.body.id} , {$set:{"on_cart.id":req.body.file.id,"on_cart.cuz":req.body.file.cuz,"on_cart.quant":req.body.file.quant}} , (err , result)=>{
            if(err){console.log(err)}
            res.send("Done");
        })
    }
    else{
        admin_model.updateOne({_id:req.body.id} , {$set:{on_cart:req.body.file}} , (err , result)=>{
            if(err){console.log(err)}
            res.send("Done");
        })
    }
});

//------------------------------------------------------------------------Delete_WishList---------------------------------------------------------

app.put("/deleteWishList" , (req , res)=>{
    if(req.body.type === "user"){
        user_model.updateOne({_id:req.body.id} , {$set:{wishlist:req.body.file}} , (err , result)=>{
            if(err){console.log(err)}
            res.send("Done");
        })
    }
    else{
        admin_model.updateOne({_id:req.body.id} , {$set:{wishlist:req.body.file}} , (err , result)=>{
            if(err){console.log(err)}
            res.send("Done");
        })
    }
});

//---------------------------------------------------------------Search---------------------------------------------------------------------------

app.put("/getSearch" , async (req , res) => {
    await product_model.find({name : {$regex : '.*' + req.body.name+'.*'}} , (err , result) => {
        if(err){console.log(err)}
        res.send(result);
    }).clone()
})

//---------------------------------------------------------------All_Products--------------------------------------------------------------------

app.get("/getAllProducts" , async(req , res) => {
    await product_model.find((err , result) => {
        if(err){console.log(err)}
        res.send(result);
    }).clone()
})

//-------------------------------------------------------------Selected_WorkShops----------------------------------------------------------------

app.put("/getSelectedWorkShops" , async (req , res) => {
    await workshop_model.find({_id : req.body.id} , (err , result) => {
        if(err){console.log(err)}
        res.send(result);
    }).clone();
})

//------------------------------------------------------------Add_Query--------------------------------------------------------------------------

app.put("/addQuery" , async (req , res) => {
    const query = new question_model({
        question : req.body.question,
        posted_by : req.body.user,
    });

    try{
        await query.save()
        res.send("Done");
    }
    catch(err){
        console.log(err);
    }
})

//-------------------------------------------------------------Get_Query--------------------------------------------------------------------------

app.put("/getQuery" , async (req , res) => {
    question_model.find({posted_by : req.body.id} , (err , result)=>{
        if(err){console.log(err)}
        res.send(result);
    })
})

//-------------------------------------------------------------All_Queries----------------------------------------------------------------------

app.get("/entireQueries" , async (req , res)=> {
    question_model.find((err, result) => {
        if(err){console.log(err)}
        res.send(result);
    })
})

app.get("/entireContactQueries" , async (req , res)=> {
    contact_query_model.find((err, result) => {
        if(err){console.log(err)}
        res.send(result);
    })
})

//--------------------------------------------------------------Queries--------------------------------------------------------------------------

app.get("/allQueries" , async (req , res)=> {
    question_model.find({answer : undefined}, (err, result) => {
        if(err){console.log(err)}
        res.send(result);
    })
})

//------------------------------------------------------------Add_Reply--------------------------------------------------------------------------

app.put("/addReply" , (req , res)=>{
    question_model.updateOne({_id : req.body.id} , {$set : {answer : req.body.answer , answered_by : req.body.sender }} , (err , result)=>{
        if(err){console.log(err)}
        res.send("Done");
    })
});

//---------------------------------------------------------Add_Contact_Query----------------------------------------------------------------------
app.put("/addContactQuery" , async (req , res) => {
    const query = new contact_query_model({
        question : req.body.query,
        posted_by : req.body.user,
    });

    try{
        await query.save()
        res.send("Done");
    }
    catch(err){
        console.log(err);
    }
})

//--------------------------------------------------------------Queries--------------------------------------------------------------------------

app.get("/allContactQueries" , async (req , res)=> {
    contact_query_model.find({answer : undefined}, (err, result) => {
        if(err){console.log(err)}
        res.send(result);
    })
})

//------------------------------------------------------------Add_Reply--------------------------------------------------------------------------

app.put("/addContactReply" , (req , res)=>{
    contact_query_model.updateOne({_id : req.body.id} , {$set : {answer : req.body.answer , answered_by : req.body.sender }} , (err , result)=>{
        if(err){console.log(err)}
            contact_query_model.find({_id : req.body.id}, (err , result)=>{
                if(err){console.log(err)}
                let details = {
                    from :"magiccornerin@gmail.com",
                    to: result[0].posted_by,
                    subject : "Reply From MagicCorner",
                    text : "Hi "+result[0].posted_by+","+" "+req.body.answer+"."+" This the reply we have got for you."
                };
                mailTransporter.sendMail( details , (err) =>{
                    if(err){
                        console.log(err);
                    }
                } )})
        res.send("Done");
    })
});
//--------------------------------------------------------------Server----------------------------------------------------------------------------

app.listen(process.env.port || 3001, () => {
    console.log("Server On");
} );
