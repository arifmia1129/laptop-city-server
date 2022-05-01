const express = require("express");
cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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