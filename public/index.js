const express = require("express");
const path = require("path");
const collection = require("./config"); // MongoDB connection and collection
const bcrypt = require('bcrypt');
const cors = require('cors');
const session = require('express-session');
const { ObjectId } = require('mongodb');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Convert data into JSON format
app.use(express.json());

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname)));

// Parse URL-encoded data
app.use(express.urlencoded({ extended: false }));

// Initialize session middleware
app.use(session({
    secret: 'yourSecretKey', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Set this to true if using HTTPS
}));

// Use EJS as the view engine (if needed)
app.set("view engine", "ejs");

// Route for rendering the login page
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Route for rendering the signup page
app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

// Route for serving the about.html page
app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

// Route for serving the index.html page (the homepage)
app.get("/index", (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Register User
app.post("/signup", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the username already exists in the database
        const existingUser = await collection.findOne({ name: username });

        if (existingUser) {
            res.status(400).send('User already exists. Please choose a different username.');
        } else {
            // Hash the password using bcrypt
            const hashedPassword = await bcrypt.hash(password, 10);

            // Store the new user in the database
            await collection.insertMany([{ name: username, password: hashedPassword, savedCards: [] }]);

            // Redirect to the login page after successful signup
            res.redirect("/login");
        }
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).send("An error occurred during signup. Please try again later.");
    }
});

// Login User
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the user in the database
        const user = await collection.findOne({ name: username });

        if (!user) {
            res.status(404).send("User not found.");
        } else {
            // Compare the hashed password in the database with the provided password
            const isPasswordMatch = await bcrypt.compare(password, user.password);

            if (!isPasswordMatch) {
                res.status(401).send("Wrong password.");
            } else {
                // Store the userId in the session
                req.session.userId = user._id;

                // Redirect to the homepage after successful login
                res.redirect("/index");
            }
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("An error occurred during login. Please try again later.");
    }
});

// API Route to get the logged-in user's ID
app.get('/get-user-id', (req, res) => {
    if (req.session.userId) {
        res.json({ userId: req.session.userId });
    } else {
        res.status(401).json({ error: 'User not logged in' });
    }
});

// Route to fetch saved cards of a user
app.get('/get-saved-cards', async (req, res) => {
    const userId = req.query.userId; // Get the userId from the query params

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // Use `findOne` to find the user by `_id` (assuming MongoDB ObjectId)
        const user = await collection.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return the saved cards
        res.json({ savedCards: user.savedCards });
    } catch (error) {
        console.error('Error fetching saved cards:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Route to save card data to the logged-in user's `savedCards`
app.post('/save-card', async (req, res) => {
    const { userId, card } = req.body;  // Assuming userId and card data come from the frontend

    if (!userId || !card) {
        return res.status(400).json({ error: 'User ID and card details are required.' });
    }

    try {
        // Find the user and update their savedCards array
        await collection.findOneAndUpdate(
            { _id: userId }, 
            { $push: { savedCards: card } }, // Push the new card into the savedCards array
            { new: true }
        );
        res.status(200).json({ message: 'Card saved successfully' });
    } catch (error) {
        console.error("Error saving card:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to delete a card from the logged-in user's `savedCards`
app.delete('/delete-card', async (req, res) => {
    const { userId, card } = req.body;  // Assuming userId and card data come from the frontend

    if (!userId || !card) {
        return res.status(400).json({ error: 'User ID and card details are required.' });
    }

    try {
        // Find the user and remove the card from their savedCards array
        const result = await collection.updateOne(
            { _id: userId },
            { $pull: { savedCards: card } }  // Remove the card from the savedCards array
        );

        if (result.modifiedCount === 1) {
            res.status(200).json({ message: 'Card successfully deleted.' });
        } else {
            res.status(404).json({ error: 'Card not found.' });
        }
    } catch (error) {
        console.error("Error deleting card:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/update-card', async (req, res) => {
    const { userId, originalCard, updatedCard } = req.body;

    if (!userId || !originalCard || !updatedCard) {
        return res.status(400).json({ error: 'User ID, original card, and updated card details are required.' });
    }

    try {
        const result = await collection.updateOne(
            { _id: new ObjectId(userId), 'savedCards.author': originalCard.author, 'savedCards.tag': originalCard.tag, 'savedCards.content': originalCard.content },
            { $set: { 'savedCards.$.author': updatedCard.author, 'savedCards.$.tag': updatedCard.tag, 'savedCards.$.content': updatedCard.content } }
        );

        if (result.modifiedCount === 1) {
            res.status(200).json({ message: 'Card successfully updated.' });
        } else {
            res.status(404).json({ error: 'Card not found.' });
        }
    } catch (error) {
        console.error("Error updating card:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Define Port for Application
const port = 4500;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
