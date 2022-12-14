const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// Port
const port = process.env.PORT || 5000;

app.get("/", (req, res) => res.send("YourMeals server is running!"));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pdzsrjb.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const foodsCollection = client.db("YourMeals").collection("Foods");
    const reviewsCollection = client.db("YourMeals").collection("reviews");

    // Meals API
    //limited meals API
    app.get("/limMeals", async (req, res) => {
      const query = {};
      const cursor = foodsCollection.find(query).sort({ _id: -1 });
      const limFoods = await cursor.limit(3).toArray();
      res.send(limFoods);
    });

    // all meals API
    app.get("/allMeals", async (req, res) => {
      const query = {};
      const cursor = foodsCollection.find(query).sort({ _id: -1 });
      const limFoods = await cursor.toArray();
      res.send(limFoods);
    });

    // get specific meal by id API
    app.get("/allMeals/:id", async (req, res) => {
      const id = req.params.id;
      //   console.log(id);
      const query = { _id: ObjectId(id) };
      const food = await foodsCollection.findOne(query);
      res.send(food);
    });

    app.post("/postMeal", async (req, res) => {
      const meal = req.body;
      // console.log(meal);
      const result = await foodsCollection.insertOne(meal);
      res.send(result);
    });

    // reviews API
    app.post("/reviews", async (req, res) => {
      const reviews = req.body;
      // console.log(reviews);
      const result = await reviewsCollection.insertOne(reviews);
      res.send(result);
    });

    app.get("/reviewsByIds", async (req, res) => {
      let query = {};

      if (req.query.id) {
        query = {
          mealId: req.query.id,
        };
      }
      const cursor = reviewsCollection.find(query).sort({ _id: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/myReviews", async (req, res) => {
      let query = {};
      // console.log(req.query.email);
      if (req.query.email) {
        query = {
          userEmail: req.query.email,
        };
      }
      const cursor = reviewsCollection.find(query).sort({ _id: -1 });
      const myReviews = await cursor.toArray();
      res.send(myReviews);
    });

    app.get("/myReviews/:id", async (req, res) => {
      const id = req.params.id;
      let query = { _id: ObjectId(id) };

      const cursor = reviewsCollection.find(query).sort({ _id: -1 });
      const myReviews = await cursor.toArray();
      res.send(myReviews);
    });

    app.delete("/myReviews/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
      // console.log(result);
      res.send(result);
    });

    app.put("/myReviews/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updateReview = req.body;
      // console.log(storedReview);
      const options = { upsert: true };
      const updatedReview = {
        $set: {
          review: updateReview.review,
        },
      };
      const result = await reviewsCollection.updateOne(
        filter,
        updatedReview,
        options
      );
      // console.log(result);
      res.send(result);
    });
  } catch (error) {
    console.log(error);
  }
}
run().catch((err) => console.error(err));

app.listen(port, () => console.log(`YourMeals app listening on port ${port}`));
