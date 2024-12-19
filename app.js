const express = require('express');
const app = express();
const port = 3000;

// Middleware for parsing JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage for tasks
let tasks = [...require('./task.json').tasks];

// Helper function to reset tasks to initial state
const resetTasks = () => {
    tasks = [...require('./task.json').tasks];
};

// Helper function to validate task data
const validateTask = (task) => {
    if (!task.title || typeof task.title !== 'string') return false;
    if (!task.description || typeof task.description !== 'string') return false;
    if (typeof task.completed !== 'boolean') return false;
    return true;
};

// GET /tasks - Retrieve all tasks
app.get('/tasks', (req, res) => {
    res.status(200).json(tasks);
});

// GET /tasks/:id - Retrieve a specific task
app.get('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    
    res.status(200).json(task);
});

// POST /tasks - Create a new task
app.post('/tasks', (req, res) => {
    const newTask = {
        id: Math.max(0, ...tasks.map(t => t.id)) + 1,
        title: req.body.title,
        description: req.body.description,
        completed: req.body.completed || false
    };

    if (!validateTask(newTask)) {
        return res.status(400).json({ error: 'Invalid task data' });
    }

    tasks.push(newTask);
    res.status(201).json(newTask);
});

// PUT /tasks/:id - Update a task
app.put('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTask = {
        id: taskId,
        title: req.body.title,
        description: req.body.description,
        completed: req.body.completed
    };

    if (!validateTask(updatedTask)) {
        return res.status(400).json({ error: 'Invalid task data' });
    }

    tasks[taskIndex] = updatedTask;
    res.status(200).json(updatedTask);
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }

    tasks.splice(taskIndex, 1);
    res.status(200).json({ message: 'Task deleted successfully' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Only start the server if not in test environment
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, (err) => {
        if (err) {
            return console.log('Something bad happened', err);
        }
        console.log(`Server is listening on ${port}`);
    });
}

module.exports = app;
