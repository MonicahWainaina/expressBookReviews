const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Check if the username exists in the users array
    return users.some(user => user.username === username);
};


const authenticatedUser = (username, password) => {
    // Check if the username and password match a user in the users array
    return users.some(user => user.username === username && user.password === password);
};


//only registered users can login
// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // Check if the username exists and password matches
    const user = users.find(user => user.username === username && user.password === password);
  
    if (user) {
      // Generate a JWT token
      const accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });
  
      // Save the JWT token in the session
      req.session.authorization = { accessToken, username };
      
      return res.status(200).json({ message: "User successfully logged in", accessToken });
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  });
  

// Add a book review
// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { review } = req.body; // Get review from request body
    const { isbn } = req.params; // Get ISBN from URL parameter

    // Ensure the review is provided
    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    // Get the token from the Authorization header
    const token = req.headers['authorization']?.split(' ')[1]; // Extract the Bearer token

    if (!token) {
        return res.status(403).json({ message: "User not authenticated - token missing" });
    }

    // Verify the JWT token
    jwt.verify(token, 'access', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }

        // If token is valid, proceed with adding the review
        const username = decoded.username;

        // Find the book by ISBN
        const book = books[isbn]; // Look for the book with the given ISBN

        if (book) {
            // Add/update the review for the book
            book.reviews[username] = review;
            return res.status(200).json({ message: "Review added/updated successfully" });
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { username } = req.session.authorization; // Get username from session
    const { isbn } = req.params; // Get ISBN from URL parameter

    // Ensure the user is logged in
    if (!username) {
        return res.status(401).json({ message: "User must be logged in to delete a review" });
    }

    // Find the book using ISBN
    const book = books[isbn]; // Look for the book with the given ISBN

    if (book) {
        // Check if the user has a review for this book
        if (book.reviews[username]) {
            // Delete the user's review
            delete book.reviews[username];
            return res.status(200).json({ message: "Review deleted successfully" });
        } else {
            return res.status(404).json({ message: "Review not found for this user" });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
