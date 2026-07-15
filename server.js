import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';

import counterRoutes from './routes/counter.js';
import reportRoutes from './routes/report.js';
import  sendDailyReport  from './services/emailService.js';

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
// 🔧 CORREÇÃO: Configurar CORS para aceitar qualquer origem em produção
const allowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL, // Seu frontend no Render ou Vercel
    'https://*.onrender.com', // Qualquer app no Render
    'https://*.vercel.app'    // Qualquer app na Vercel
];

app.use(cors({
    origin: function (origin, callback) {
        // Permitir requisições sem origem (como mobile apps ou curl)
        if (!origin) return callback(null, true);
        
        // Verificar se a origem é permitida
        const isAllowed = allowedOrigins.some(allow => {
            if (allow.includes('*')) {
                const pattern = allow.replace('*', '.*');
                return new RegExp(pattern).test(origin);
            }
            return allow === origin;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`⚠️ Origem bloqueada pelo CORS: ${origin}`);
            callback(null, true); // Em produção, mude para false
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // limite de 100 requisições por IP
});
app.use('/api/', limiter);

// Rotas
app.use('/api/counter', counterRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Agendamento: Enviar relatório diário às 8:00
cron.schedule('0 8 * * *', async () => {
    console.log('Enviando relatório diário...');
    try {
        await sendDailyReport();
        console.log('Relatório diário enviado com sucesso!');
    } catch (error) {
        console.error('Erro ao enviar relatório diário:', error);
    }
});

// Agendamento: Enviar relatório semanal às 9:00 de segunda-feira
cron.schedule('0 9 * * 1', async () => {
    console.log('Enviando relatório semanal...');
    try {
        await sendWeeklyReport();
        console.log('Relatório semanal enviado com sucesso!');
    } catch (error) {
        console.error('Erro ao enviar relatório semanal:', error);
    }
});

app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
    console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API: http://localhost:${port}/api`);
});