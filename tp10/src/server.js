import express from "express";          
import cors from "cors";                  
import { StatusCodes } from 'http-status-codes'; 
import config from './configs/db-configs.js';
import pkg from 'pg';

const { Client } = pkg;

const app = express();
const port = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// ==================== ENDPOINTS ==================== //

// GET todos los alumnos
app.get('/api/alumnos/', async (req, res) => {
    const client = new Client(config);
    try {
        await client.connect();
        const sql = 'SELECT * FROM alumnos';
        const resultPg = await client.query(sql);
        res.status(StatusCodes.OK).json(resultPg.rows);
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('error: ' + error.message);
    } finally {
        await client.end();
    }
});

// GET un alumno por ID
app.get('/api/alumnos/:id', async (req, res) => {
    const client = new Client(config);
    try {
        await client.connect();
        const sql = 'SELECT * FROM alumnos WHERE id = $1';
        const values = [req.params.id];
        const result = await client.query(sql, values);
        if (result.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).send('Alumno no encontrado');
        }
        res.status(StatusCodes.OK).json(result.rows[0]);
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('error: ' + error.message);
    } finally {
        await client.end();
    }
});

// POST crear nuevo alumno
app.post('/api/alumnos/', async (req, res) => {
    const client = new Client(config);
    const { nombre, apellido, id_curso, fecha_nacimiento, hace_deportes } = req.body;
    try {
        await client.connect();
        const sql = `
            INSERT INTO alumnos (nombre, apellido, id_curso, fecha_nacimiento, hace_deportes)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`;
        const values = [nombre, apellido, id_curso, fecha_nacimiento, hace_deportes];
        const result = await client.query(sql, values);
        res.status(StatusCodes.CREATED).json(result.rows[0]);
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('error: ' + error.message);
    } finally {
        await client.end();
    }
});

// PUT actualizar alumno
app.put('/api/alumnos/', async (req, res) => {
    const client = new Client(config);
    const { id, nombre, apellido, id_curso, fecha_nacimiento, hace_deportes } = req.body;
    try {
        await client.connect();
        const sql = `
            UPDATE alumnos
            SET nombre = $1, apellido = $2, id_curso = $3, fecha_nacimiento = $4, hace_deportes = $5
            WHERE id = $6
            RETURNING *`;
        const values = [nombre, apellido, id_curso, fecha_nacimiento, hace_deportes, id];
        const result = await client.query(sql, values);
        if (result.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).send('Alumno no encontrado');
        }
        res.status(StatusCodes.OK).json(result.rows[0]);
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('error: ' + error.message);
    } finally {
        await client.end();
    }
});

// DELETE eliminar alumno
app.delete('/api/alumnos/:id', async (req, res) => {
    const client = new Client(config);
    try {
        await client.connect();
        const sql = 'DELETE FROM alumnos WHERE id = $1 RETURNING *';
        const values = [req.params.id];
        const result = await client.query(sql, values);
        if (result.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).send('Alumno no encontrado');
        }
        res.status(StatusCodes.OK).json({ mensaje: 'Alumno eliminado', alumno: result.rows[0] });
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('error: ' + error.message);
    } finally {
        await client.end();
    }
});

// ==================== INICIO SERVIDOR ==================== //

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
