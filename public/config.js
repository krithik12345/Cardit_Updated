const mongoose = require('mongoose');

// Connect to MongoDB using Mongoose
mongoose.connect("mongodb://localhost:27017/Login-tut", {
    useNewUrlParser: true, 
    useUnifiedTopology: true
})
.then(() => {
    console.log("Database Connected Successfully");
})
.catch((error) => {
    console.error("Database cannot be Connected", error);
});

// Define the schema for the user collection
const Loginschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    savedCards: {
            author: String,
            tag: String,
            content: String 
    }
});

// Create the collection for users
const collection = mongoose.model("users", Loginschema);

// Function to create a new user and initialize the 'savedCards' field
const createUser = async (name, password) => {
    const newUser = new collection({
        name,
        password,
        savedCards: []  // Explicitly set an empty array for savedCards
    });

    try {
        await newUser.save();
        console.log('User created successfully with savedCards field');
    } catch (error) {
        console.error('Error creating user:', error);
    }
};


module.exports = collection;
