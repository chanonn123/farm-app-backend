const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: 'https://farm-management-app-navy.vercel.app/'
}));
app.use(bodyParser.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});


app.get('/todos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM todos WHERE user_id = $1', [req.query.userId]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.post('/todos', async (req, res) => {
    const { task, userId } = req.body;
    try {
        const result = await pool.query('INSERT INTO todos (task, user_id) VALUES ($1, $2) RETURNING *', [task, userId]);
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
    const { userId } = req.body;
    try {
        const result = await pool.query('DELETE FROM todos WHERE id = $1 AND user_id = $2', [id, userId]);
        if (result.rowCount > 0) {
            res.status(204).send();
        } else {
            res.status(404).send('Todo not found or does not belong to user');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Harvest Routes
app.get('/harvest', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM harvest_records WHERE user_id = $1', [req.query.userId]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.post('/harvest', async (req, res) => {
    const { crop, quantity, userId } = req.body;
    try {
        const result = await pool.query('INSERT INTO harvest_records (crop, quantity, user_id) VALUES ($1, $2, $3) RETURNING *', [crop, quantity, userId]);
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
    const { userId } = req.body;
    try {
        const result = await pool.query('DELETE FROM harvest_records WHERE id = $1 AND user_id = $2', [id, userId]);
        if (result.rowCount > 0) {
            res.status(204).send();
        } else {
            res.status(404).send('Harvest record not found or does not belong to user');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
