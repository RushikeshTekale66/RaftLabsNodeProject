const express = require("express");
const User = require("./Model/user");
const Product = require("./Model/product");
const bcryptjs = require("bcryptjs");
const JWT = require("jsonwebtoken");
require("./Db/connect")

const app = express();
app.use(express.json());
const port = 5000;

//Register user & Insert new user
app.post("/register", async (req, res, next) => {

    try {
        let { name, email, password } = req.body;

        if (!name || !email || !password) {
            res.status(400).send("Please fill all required fields");
        }
        else {
            const isAlreadyExist = await User.findOne({ email });
            if (isAlreadyExist) {
                res.status(400).send("User already exist");
            }
            else {
                let newUser = new User({ name, email });
                bcryptjs.hash(password, 10, (err, hashedPassword) => {
                    newUser.set("password", hashedPassword);
                    newUser.save();
                    next();
                })
                return res.status(200).send(newUser);
            }
        }
    }
    catch (error) {
        res.status(400).send("User registration fail");

    }
})

//login user
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).send("Please fill required fields");
        }
        else {
            const user = await User.findOne({ email });
            if (!user) {
                res.status(400).send("User does not exist");
            }
            else {
                const validateUser = await bcryptjs.compare(password, user.password);
                if (!validateUser) {
                    res.status(400).send("Please enter correct password");
                }
                else {
                    const payload = { userId: user.id, email: user.email };

                    const secretKey = "secretkey";

                    JWT.sign(payload, secretKey, async (error, token) => {
                        await User.updateOne({ _id: user._id });
                        user.save();

                        return res.status(200).json({ user: { email: user.email, name: user.name, id: user._id }, token: token });
                    })
                }
            }
        }
    }
    catch (error) {
        res.status(400).send("User login fail");

    }
})


//Insert new product
app.post("/insert", (req, res) => {
    try {
        const { name, price, category } = req.body;
        if (!name || !price || !category) {
            res.status(400).send("Inter all fields");
        }
        else {
            const product = new Product(req.body);
            product.save();
            res.status(200).send("Product Inserted Successfully");
        }
    }
    catch (error) {
        res.status(400).send("Product Insertion fail");
    }
})

//Get all user
app.get("/getproduct", async (req, res) => {
    let product = await Product.find();
    res.status(200).send(product);
})

//Update Product
app.put("/update/:id", async (req, res) => {
    let product = await Product.updateOne(
        { _id: req.params.id },
        { $set: req.body }
    )
    res.status(200).send("Product updated successfully")
})

//Delete product
app.delete("/delete/:id", async(req, res)=>{
    let result = await Product.deleteOne(
        {_id : req.params.id}
    )
    res.send("Product deleted successfully")
})

//Search or filter
app.get("/search/:key", async (req, res) => {
    let result = await Product.find({
        "$or": [
            { name: { $regex: req.params.key } },
            { price: { $regex: req.params.key } },
            { category: { $regex: req.params.key } }
        ]
    })

    if(result.length===0){
        res.status(400).send("Product does not existt");
    }
    else{
        res.status(200).send(result);
    }
})


app.listen(port, () => console.log("Application is running on port : ", port)
)