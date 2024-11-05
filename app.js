const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
const uri = 'mongodb+srv://CardIt:KevinPorterJr@login.cwv0e.mongodb.net/';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());

app.post('/signup', async (req, res) => {
  try {
      console.log("Received data from frontend:", req.body);
      await client.connect();
      console.log('Connected to MongoDB');

      // Select the database and collection
      const database = client.db('mydatabase');
      const collection = database.collection('examples');

      // Insert the form data into MongoDB
      const formData = req.body;
      const result = await collection.insertOne(formData);
      
      console.log('Document inserted with _id:', result.insertedId);

      // Send a success response back to the frontend
      res.json({ success: true });
      console.log('Successful data transfer');
  } catch (err) {
      console.error('Error connecting to MongoDB:', err);
      res.json({ success: false, error: err.message });
  } finally {
      // Close the connection
      await client.close();
  }
});


// Start the Express server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
