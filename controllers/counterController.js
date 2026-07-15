import supabaseService from '../services/supabaseService.js';
import emailService from '../services/emailService.js';

class CounterController {
    // Registrar visita
    async registerVisit(req, res) {
        try {
            const { page = 'home' } = req.query;
            const ip = req.ip || req.connection.remoteAddress;
            const userAgent = req.headers['user-agent'] || '';

            await supabaseService.registerVisit(page, ip, userAgent);

            // Tentar enviar relatório diário (se ainda não foi enviado hoje)
            try {
                await emailService.sendDailyReport();
            } catch (emailError) {
                console.error('Erro ao tentar enviar relatório automático:', emailError);
            }

            res.json({ 
                success: true, 
                message: 'Visita registrada com sucesso' 
            });
        } catch (error) {
            console.error('Erro ao registrar visita:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Erro ao registrar visita' 
            });
        }
    }

    // Registrar clique em reserva
    async registerBooking(req, res) {
        try {
            const ip = req.ip || req.connection.remoteAddress;
            const userAgent = req.headers['user-agent'] || '';
            const referrer = req.headers['referer'] || '';

            await supabaseService.registerBooking(ip, userAgent, referrer);

            res.json({ 
                success: true, 
                message: 'Reserva registrada com sucesso' 
            });
        } catch (error) {
            console.error('Erro ao registrar reserva:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Erro ao registrar reserva' 
            });
        }
    }

    // Obter estatísticas
    async getStats(req, res) {
        try {
            const stats = await supabaseService.getStats();
            res.json(stats);
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Erro ao buscar estatísticas' 
            });
        }
    }
}

export default new CounterController();