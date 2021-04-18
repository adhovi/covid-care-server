const express = require("express");

const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", function (req, res) {
  res.send("Welcome to Corona-Care Server");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6qte7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const bookingsCollection = client
    .db(process.env.DB_NAME)
    .collection("bookings");

  app.post("/addBooking", (req, res) => {
    const newBooking = req.body;
    bookingsCollection.insertOne(newBooking).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/bookings", (req, res) => {
    bookingsCollection
      .find({ email: req.query.email })
      .toArray((err, items) => {
        res.send(items);
      });
  });

  app.get("/orders", (req, res) => {
    bookingsCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });

  app.post("/updateOrderStatus", (req, res) => {
    const order = req.body;
    console.log(order);
    bookingsCollection.updateOne(
      { _id: ObjectId(order.id) },
      {
        $set: { status: order.status },
      },
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).send({ message: err });
        } else {
          res.send(result);
          console.log(result);
        }
      }
    );
  });

  //******************
  // Bookings From Here
  //******************

  const servicesCollection = client
    .db(process.env.DB_NAME)
    .collection("services");

  app.get("/services", (req, res) => {
    servicesCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });

  app.get("/service/:id", (req, res) => {
    servicesCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, items) => {
        res.send(items);
      });
  });

  app.post("/addService", (req, res) => {
    const newService = req.body;
    servicesCollection.insertOne(newService).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.delete("/deleteService/:id", (req, res) => {
    servicesCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });

  //********* */
  // Reviews
  //******** */

  const reviewsCollection = client
    .db(process.env.DB_NAME)
    .collection("reviews");

  app.post("/addReview", (req, res) => {
    const newBooking = req.body;
    reviewsCollection.insertOne(newBooking).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/reviews", (req, res) => {
    reviewsCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });

  //********** */
  const adminCollection = client.db(process.env.DB_NAME).collection("admin");

  app.post("/admin", (req, res) => {
    const userEmail = req.body.email;
    console.log(userEmail);
    adminCollection.find({ email: userEmail }).toArray((err, admin) => {
      res.send(admin.length > 0);
    });
  });

  app.post("/makeAdmin", (req, res) => {
    const newAdmin = req.body;
    adminCollection.insertOne(newAdmin).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  // perform actions on the collection object
  //   client.close();
});

app.listen(process.env.PORT || 5055, (err) => {
  console.log("Listening");
});
