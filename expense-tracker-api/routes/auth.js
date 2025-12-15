const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/db.json');

const readDB = () => {
    const data = fs.readFileSync(dbPath);
    return JSON.parse(data);
};

const writeDB = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

router.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const db = readDB();
    
    const existingUser = db.users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }
    
    const newUser = {
        id: db.users.length + 1,
        username,
        email,
        password,
        createdAt: new Date().toISOString()
    };
    
    db.users.push(newUser);
    writeDB(db);
    
    res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const db = readDB();
    
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ message: 'Login successful', userId: user.id, username: user.username });
});

module.exports = router;