const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

app.get('/todos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM todos');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.post('/todos', async (req, res) => {
    const { task } = req.body;
    try {
        const result = await pool.query('INSERT INTO todos (task) VALUES ($1) RETURNING *', [task]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.put('/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { task } = req.body;
    try {
        const result = await pool.query('UPDATE todos SET task = $1 WHERE id = $2 RETURNING *', [task, id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).send('Todo not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM todos WHERE id = $1', [id]);
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.get('/harvest', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM harvest_records');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.post('/harvest', async (req, res) => {
    const { crop, quantity } = req.body;
    try {
        const result = await pool.query('INSERT INTO harvest_records (crop, quantity) VALUES ($1, $2) RETURNING *', [crop, quantity]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.put('/harvest/:id', async (req, res) => {
    const { id } = req.params;
    const { crop, quantity } = req.body;
    try {
        const result = await pool.query('UPDATE harvest_records SET crop = $1, quantity = $2 WHERE id = $3 RETURNING *', [crop, quantity, id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).send('Harvest record not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.delete('/harvest/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM harvest_records WHERE id = $1', [id]);
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
