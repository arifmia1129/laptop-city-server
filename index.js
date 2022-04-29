const express = require("express");
cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Laptop City server in running!")
});

app.listen(port, () => {
    console.log("Server running by using port:", port);
});