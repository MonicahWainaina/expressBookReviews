const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


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
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books, null, 4));
  });
  

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn] ? books[isbn] : {message: "Book not found"});
  });
  
  
// Get book details based on author
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const filteredBooks = [];
  
    // Loop through all books and match author
    for (let key in books) {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
        filteredBooks.push({ isbn: key, ...books[key] });
      }
    }
  
    if (filteredBooks.length > 0) {
      res.status(200).json(filteredBooks);
    } else {
      res.status(404).json({ message: "No books found by this author" });
    }
  });
  

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title.toLowerCase();
    const matchingBooks = Object.values(books).filter(book => book.title.toLowerCase() === title);
    
    res.send(matchingBooks.length ? matchingBooks : {message: "No books found with that title"});
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
