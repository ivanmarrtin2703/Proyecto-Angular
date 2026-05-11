require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper: convierte completed 0/1 a boolean true/false
function normalizeTask(task) {
    return {
        ...task,
        completed: !!task.completed,
        dueDate: task.due_date || null // Renombrar para consistencia con frontend
    };
}


// Ruta de prueba
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'ok',
        timestamp: new Date()
    });
});

// GET /tasks/stats - Estadísticas (DEBE ir ANTES de /tasks/:id)
app.get('/tasks/stats', async (req, res, next) => {
    try {
        const [totalRes] = await db.query('SELECT COUNT(*) as total FROM tasks');
        const [completedRes] = await db.query('SELECT COUNT(*) as completed FROM tasks WHERE completed = 1');
        const [pendingRes] = await db.query('SELECT COUNT(*) as pending FROM tasks WHERE completed = 0');
        const [priorityRes] = await db.query('SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority');

        const byPriority = { alta: 0, media: 0, baja: 0 };
        priorityRes.forEach(row => {
            byPriority[row.priority] = row.count;
        });

        res.json({
            success: true,
            data: {
                total: totalRes[0].total,
                completed: completedRes[0].completed,
                pending: pendingRes[0].pending,
                byPriority
            }
        });
    } catch (error) {
        next(error);
    }
});

// GET /tasks - Obtener todas las tareas (Con Paginación Bonus)
app.get('/tasks', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const offset = (page - 1) * limit;

        const [totalRows] = await db.query('SELECT COUNT(*) as total FROM tasks');
        const total = totalRows[0].total;
        const totalPages = Math.ceil(total / limit);

        const [rows] = await db.query(
            'SELECT * FROM tasks ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );

        res.json({
            success: true,
            data: rows.map(normalizeTask),
            pagination: {
                total,
                page,
                limit,
                totalPages
            }
        });
    } catch (error) {
        next(error);
    }
});

// GET /tasks/:id - Obtener una tarea por ID
app.get('/tasks/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
        }

        res.json({ success: true, data: normalizeTask(rows[0]) });
    } catch (error) {
        next(error);
    }
});

// POST /tasks - Crear nueva tarea
app.post('/tasks', async (req, res, next) => {
    try {
        const { title, description, priority, category, dueDate } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({ success: false, message: 'El título es obligatorio' });
        }

        const [result] = await db.query(
            'INSERT INTO tasks (title, description, priority, category, due_date) VALUES (?, ?, ?, ?, ?)',
            [title.trim(), description || '', priority || 'media', category || null, dueDate || null]
        );


        const [newTask] = await db.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);

        res.status(201).json({ success: true, data: normalizeTask(newTask[0]) });
    } catch (error) {
        next(error);
    }
});

// PUT /tasks/:id - Actualizar tarea (acepta actualizaciones parciales)
app.put('/tasks/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        // Obtener la tarea actual
        const [existing] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
        }

        // Merge: usa los valores existentes como fallback para campos no enviados
        const current = existing[0];
        const title = req.body.title !== undefined ? req.body.title : current.title;
        const description = req.body.description !== undefined ? req.body.description : current.description;
        const completed = req.body.completed !== undefined ? (req.body.completed ? 1 : 0) : current.completed;
        const priority = req.body.priority !== undefined ? req.body.priority : current.priority;
        const category = req.body.category !== undefined ? req.body.category : current.category;
        const due_date = req.body.dueDate !== undefined ? req.body.dueDate : current.due_date;

        await db.query(
            'UPDATE tasks SET title = ?, description = ?, completed = ?, priority = ?, category = ?, due_date = ? WHERE id = ?',
            [title, description, completed, priority, category, due_date, id]
        );


        const [updatedTask] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
        res.json({ success: true, data: normalizeTask(updatedTask[0]) });
    } catch (error) {
        next(error);
    }
});

// DELETE /tasks - Eliminar TODAS las tareas (Limpiar aplicación)
app.delete('/tasks', async (req, res, next) => {
    try {
        await db.query('TRUNCATE TABLE tasks');
        res.json({ success: true, message: 'Todas las tareas han sido eliminadas' });
    } catch (error) {
        next(error);
    }
});

// DELETE /tasks/:id - Eliminar tarea
app.delete('/tasks/:id', async (req, res, next) => {

    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
        }

        res.json({ success: true, message: 'Tarea eliminada correctamente' });
    } catch (error) {
        next(error);
    }
});

// Endpoint GET /health/db
app.get('/health/db', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({
            success: true,
            status: 'ok',
            db: 'connected',
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            status: 'error',
            db: 'disconnected',
            message: error.message
        });
    }
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        success: false,
        message: 'Algo salió mal en el servidor'
    });
});

async function bootstrap() {
    const info = db.dbConfigSummary();
    console.log('Comprobando MySQL…', info);

    const check = await db.verifyDatabase();
    if (!check.ok) {
        console.error('\n❌ No se puede usar la base de datos:', check.message);
        console.error('\nPasos:');
        console.error('  1) Arranca el servicio MySQL (Windows: Servicios → MySQL… o XAMPP).');
        console.error('  2) Revisa taskmate-api/.env (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME).');
        console.error('  3) Crea la base y la tabla:  mysql -u root -p < schema.sql');
        console.error('     (o ejecuta el SQL en MySQL Workbench).\n');
        process.exit(1);
    }

    console.log('✓ MySQL conectado y la tabla `tasks` está lista.\n');

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 API en http://localhost:${PORT}  (accesible también por la IP de este PC en la red local)`);
    });
}

bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});
