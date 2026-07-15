import supabaseService from '../services/supabaseService.js';
import emailService from '../services/emailService.js';

class ReportController {
    // Enviar relatório agora
    async sendReportNow(req, res) {
        try {
            const { type = 'daily' } = req.body;
            
            if (type === 'daily') {
                await emailService.sendDailyReport();
            } else if (type === 'weekly') {
                await emailService.sendWeeklyReport();
            } else {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Tipo de relatório inválido' 
                });
            }

            res.json({ 
                success: true, 
                message: `Relatório ${type} enviado com sucesso` 
            });
        } catch (error) {
            console.error('Erro ao enviar relatório:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Erro ao enviar relatório' 
            });
        }
    }

    // Buscar relatórios enviados
    async getReports(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const reports = await supabaseService.getLastReports(limit);
            res.json({ success: true, data: reports });
        } catch (error) {
            console.error('Erro ao buscar relatórios:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Erro ao buscar relatórios' 
            });
        }
    }

    // Buscar últimas reservas
    async getLastBookings(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const bookings = await supabaseService.getLastBookings(limit);
            res.json({ success: true, data: bookings });
        } catch (error) {
            console.error('Erro ao buscar reservas:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Erro ao buscar reservas' 
            });
        }
    }

    // Buscar últimas visitas
    async getLastVisits(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const visits = await supabaseService.getLastVisits(limit);
            res.json({ success: true, data: visits });
        } catch (error) {
            console.error('Erro ao buscar visitas:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Erro ao buscar visitas' 
            });
        }
    }

    async resetReports(req, res) {
        try {
            const { type = 'all' } = req.body;
            
            if (type === 'all') {
                // Deletar todos os relatórios
                const { error } = await supabaseService.resetAllReports();
                if (error) throw error;
                
                res.json({ 
                    success: true, 
                    message: 'Todos os relatórios foram resetados com sucesso!' 
                });
            } else if (type === 'daily') {
                // Deletar apenas relatórios diários
                const { error } = await supabaseService.resetReportsByType('daily');
                if (error) throw error;
                
                res.json({ 
                    success: true, 
                    message: 'Relatórios diários resetados com sucesso!' 
                });
            } else if (type === 'weekly') {
                // Deletar apenas relatórios semanais
                const { error } = await supabaseService.resetReportsByType('weekly');
                if (error) throw error;
                
                res.json({ 
                    success: true, 
                    message: 'Relatórios semanais resetados com sucesso!' 
                });
            } else {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Tipo inválido. Use: all, daily ou weekly' 
                });
            }
        } catch (error) {
            console.error('Erro ao resetar relatórios:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Erro ao resetar relatórios' 
            });
        }
    }

    // 🆕 Forçar envio de relatório (ignorando verificação de data)
    async forceSendReport(req, res) {
        try {
            const { type = 'daily' } = req.body;
            
            // Deletar relatório de hoje para forçar novo envio
            await supabaseService.deleteTodayReports(type);
            
            // Enviar novo relatório
            if (type === 'daily') {
                await emailService.sendDailyReport();
            } else if (type === 'weekly') {
                await emailService.sendWeeklyReport();
            } else {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Tipo de relatório inválido' 
                });
            }

            res.json({ 
                success: true, 
                message: `Relatório ${type} enviado com sucesso!` 
            });
        } catch (error) {
            console.error('Erro ao forçar envio de relatório:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Erro ao forçar envio de relatório' 
            });
        }
    }
    // Enviar relatório com HTML personalizado
async sendCustomReport(req, res) {
    try {
        const { customHTML, subject } = req.body;
        
        if (!customHTML) {
            return res.status(400).json({ 
                success: false, 
                error: 'Conteúdo do relatório não fornecido' 
            });
        }

        // Enviar email com o HTML personalizado
        await emailService.sendEmail(
            process.env.REPORT_EMAIL,
            subject || '📊 Relatório Pousada do Enildo',
            customHTML
        );

        res.json({ 
            success: true, 
            message: 'Relatório enviado por email com sucesso!' 
        });
    } catch (error) {
        console.error('Erro ao enviar relatório por email:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao enviar relatório por email' 
        });
    }
}

}

export default new ReportController();