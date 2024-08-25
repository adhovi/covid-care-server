const express = require("express");

const cors = require("cors");
const {
  MongoClient,
  ServerApiVersion
} = require('mongodb');
const {
  ObjectId
} = require('mongodb');
const bodyParser = require("body-parser");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.get("/", function (req, res) {
  res.send("Welcome to Corona-Care Server");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6qte7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const bookingsCollection = client.db(process.env.DB_NAME).collection("bookings");

    app.post("/addBooking", async (req, res) => {
      const newBooking = req.body;
      const result = await bookingsCollection.insertOne(newBooking)
      res.send(result.acknowledged);
    });


    app.get("/bookings", async (req, res) => {
      const bookings = bookingsCollection.find({
        email: req.query.email
      })
      const items = await bookings.toArray();
      res.send(items);
    });

    app.get("/orders", async (req, res) => {
      const orders = bookingsCollection.find()
      const items = await orders.toArray();
      res.send(items);
    });


    app.post("/updateOrderStatus", async (req, res) => {
      console.log(req.body.id);
      const order = req.body;
      const result = await bookingsCollection.updateOne({
        _id: new ObjectId(order.id)
      }, {
        $set: {
          status: order.status
        },
      }, );
      res.send(result.acknowledged)
    });

    //******************
    // Bookings From Here
    //******************

    const servicesCollection = client.db(process.env.DB_NAME).collection("services");


    app.get("/services", async (req, res) => {
      const services = servicesCollection.find()
      const items = await services.toArray();
      res.send(items);
    });

    app.get("/service/:id", async (req, res) => {
      const service = servicesCollection.find({
        _id: new ObjectId(req.params.id)
      })
      const items = await service.toArray();
      res.send(items);
    });

    app.post("/addService", async (req, res) => {
      const newService = req.body;
      const result = await servicesCollection.insertOne(newService)
      res.send(result.acknowledged);
    });

    app.delete("/deleteService/:id", async (req, res) => {
      const result = await servicesCollection
        .deleteOne({
          _id: new ObjectId(req.params.id)
        })
        console.log(result);
      res.send(result.acknowledged);
    });

    //********* */
    // Reviews
    //******** */

    const reviewsCollection = client.db(process.env.DB_NAME).collection("reviews");

    app.post("/addReview", async (req, res) => {
      const newBooking = req.body;
      const result = await reviewsCollection.insertOne(newBooking)
      res.send(result.acknowledged);
    });

    app.get("/reviews", async (req, res) => {
      const reviews = reviewsCollection.find();
      const items = await reviews.toArray();
      res.send(items);
    });

    //********** */
    const adminCollection = client.db(process.env.DB_NAME).collection("admin");

    app.post("/admin", async (req, res) => {
      const userEmail = req.body.email;
      const admins = adminCollection.find({
        email: userEmail
      });
      const admin = await admins.toArray();
      res.send(admin.length > 0);
    });

    app.post("/makeAdmin", async (req, res) => {
      const newAdmin = req.body;
      const result = await adminCollection.insertOne(newAdmin);
      res.send(result.acknowledged);
    });
  } finally {
    // // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(process.env.PORT || 5055, (err) => {
  console.log("Listening");
});