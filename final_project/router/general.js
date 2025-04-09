const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
  
    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
  
    // Check if user already exists
    const userExists = users.some((user) => user.username === username);
    if (userExists) {
      return res.status(409).json({ message: "Username already exists." });
    }
  
    // Add new user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully!" });
  });
  

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        // Simulate Axios behavior by returning books from booksdb.js
        const response = { data: books }; // Simulating a response like Axios
        res.json(response.data); // Return the list of books
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books list", error: error.message });
    }
});
  

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const book = books[isbn];
        if (book) {
            const response = { data: book }; // Simulating a response like Axios
            res.json(response.data); // Return the book details
        } else {
            res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error retrieving book details", error: error.message });
    }
});
  
// Get book details based on author
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const filteredBooks = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());
        if (filteredBooks.length > 0) {
            const response = { data: filteredBooks }; // Simulating a response like Axios
            res.json(response.data); // Return the list of books by the author
        } else {
            res.status(404).json({ message: "No books found by this author" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books by author", error: error.message });
    }
});
  

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title.toLowerCase();
    try {
        const matchingBooks = Object.values(books).filter(book => book.title.toLowerCase() === title);
        if (matchingBooks.length > 0) {
            const response = { data: matchingBooks }; // Simulating a response like Axios
            res.json(response.data); // Return books matching the title
        } else {
            res.status(404).json({ message: "No books found with that title" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books by title", error: error.message });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book && book.reviews) {
      res.send(book.reviews);
    } else {
      res.send({message: "No reviews found or invalid ISBN"});
    }
  });
  

module.exports.general = public_users;
