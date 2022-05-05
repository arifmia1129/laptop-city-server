const express = require("express");
cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


function verifyAuth(req, res, next) {
    const reqAuth = req.headers.authorization;
    if (!reqAuth) {
        res.status(401).send({ message: "Unauthorization." });
    }
    const token = reqAuth.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            res.status(403).send({ message: "Forbidden Access." });
        }
        else {
            req.decoded = decoded;
            next();
        }
    });
}


// MongoDB 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.apkoi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db("laptopCity").collection("laptop");
        // Load all product info
        app.get("/item", async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        })

        // Load single product info
        app.get("/item/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await productCollection.findOne(query);
            res.send(item);
        })
        // update single item
        app.put("/item/:id", async (req, res) => {
            const id = req.params.id;
            const quantity = req.body;
            const updatedItem = {
                $set: quantity,
            };
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const result = await productCollection.updateOne(filter, updatedItem, options);
            res.send(result);
        })

        // single item delete api
        app.post("/item/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };

            const result = await productCollection.deleteOne(query);
            res.send(result);
        })

        // single item insert api
        app.post("/item", async (req, res) => {
            const item = req.body.data;
            const result = await productCollection.insertOne(item);
            res.send(result);
        })

        // Load all product info by email query
        app.get("/myitems", verifyAuth, async (req, res) => {
            const decodedEmail = req?.decoded?.user;
            const email = req?.query?.email;

            if (decodedEmail === email) {
                const query = { email: email };
                const cursor = productCollection.find(query);
                const items = await cursor.toArray();
                res.send(items);
            }
            else {
                res.status(403).send({ message: "Forbidden Access." })
            }
        })

        app.post("/login", async (req, res) => {
            const user = req.body.email;
            const token = jwt.sign({ user }, process.env.SECRET_KEY, {
                expiresIn: "1d"
            })
            res.send(token);
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("Laptop City server in running!")
});

app.listen(port, () => {
    console.log("Server running by using port:", port);
});