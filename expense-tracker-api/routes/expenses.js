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

router.get('/:userId', (req, res) => {
    const { userId } = req.params;
    const db = readDB();
    
    const userExpenses = db.expenses.filter(expense => expense.userId == userId);
    res.json(userExpenses);
});

router.post('/', (req, res) => {
    const { userId, title, amount, category, date } = req.body;
    const db = readDB();
    
    const newExpense = {
        id: db.expenses.length + 1,
        userId: parseInt(userId),
        title,
        amount: parseFloat(amount),
        category,
        date,
        createdAt: new Date().toISOString()
    };
    
    db.expenses.push(newExpense);
    writeDB(db);
    
    res.status(201).json({ message: 'Expense added successfully', expense: newExpense });
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { title, amount, category, date } = req.body;
    const db = readDB();
    
    const expenseIndex = db.expenses.findIndex(expense => expense.id == id);
    if (expenseIndex === -1) {
        return res.status(404).json({ error: 'Expense not found' });
    }
    
    db.expenses[expenseIndex] = {
        ...db.expenses[expenseIndex],
        title,
        amount: parseFloat(amount),
        category,
        date,
        updatedAt: new Date().toISOString()
    };
    
    writeDB(db);
    res.json({ message: 'Expense updated successfully', expense: db.expenses[expenseIndex] });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const db = readDB();
    
    const expenseIndex = db.expenses.findIndex(expense => expense.id == id);
    if (expenseIndex === -1) {
        return res.status(404).json({ error: 'Expense not found' });
    }
    
    db.expenses.splice(expenseIndex, 1);
    writeDB(db);
    
    res.json({ message: 'Expense deleted successfully' });
});

module.exports = router;