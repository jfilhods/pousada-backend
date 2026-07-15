import nodemailer from 'nodemailer';
import supabaseService from './supabaseService.js';

// Configurar transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS || 'ttci ofiw dqrc hesm'
    },
    tls: {
        rejectUnauthorized: false
    }
});

class EmailService {
    constructor() {
        this.transporter = transporter;
    }

    // Enviar email
    async sendEmail(to, subject, htmlContent) {
        try {
            const mailOptions = {
                from: `"Pousada do Enildo" <${process.env.SMTP_USER}>`,
                to: to,
                subject: subject,
                html: htmlContent
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email enviado:', info.messageId);
            return info;
        } catch (error) {
            console.error('Erro ao enviar email:', error);
            throw error;
        }
    }

    // Gerar relatório diário
    async generateDailyReport() {
        const stats = await supabaseService.getStats();
        const lastBookings = await supabaseService.getLastBookings(10);
        
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                             color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                    .stat-item { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .stat-number { font-size: 24px; font-weight: bold; color: #667eea; }
                    .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th { background: #667eea; color: white; padding: 10px; text-align: left; }
                    td { padding: 10px; border-bottom: 1px solid #ddd; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📊 Relatório Diário</h1>
                        <p>Pousada do Enildo - ${new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div class="content">
                        <h2>Estatísticas do Dia</h2>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-number">${stats.today_visits}</div>
                                <div class="stat-label">Visitas Hoje</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">${stats.today_bookings}</div>
                                <div class="stat-label">Reservas Hoje</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">${stats.total_visits}</div>
                                <div class="stat-label">Total de Visitas</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">${stats.total_bookings}</div>
                                <div class="stat-label">Total de Reservas</div>
                            </div>
                        </div>

                        <h2>Últimas Reservas</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>IP</th>
                                    <th>Referrer</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${lastBookings.map(booking => `
                                    <tr>
                                        <td>${new Date(booking.click_date).toLocaleString('pt-BR')}</td>
                                        <td>${booking.ip_address}</td>
                                        <td>${booking.referrer || 'Direto'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="footer">
                        <p>Relatório gerado automaticamente pelo sistema da Pousada do Enildo</p>
                        <p>${new Date().toLocaleString('pt-BR')}</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return html;
    }

    // Enviar relatório diário
    async sendDailyReport() {
        try {
            const hasReport = await supabaseService.hasReportToday();
            if (hasReport) {
                console.log('Relatório diário já enviado hoje');
                return;
            }

            const htmlContent = await this.generateDailyReport();
            
            await this.sendEmail(
                process.env.REPORT_EMAIL,
                `📊 Relatório Diário - Pousada do Enildo - ${new Date().toLocaleDateString('pt-BR')}`,
                htmlContent
            );

            await supabaseService.registerReport('daily', htmlContent);
            
            console.log('Relatório diário enviado com sucesso');
        } catch (error) {
            console.error('Erro ao enviar relatório diário:', error);
            throw error;
        }
    }

    // Enviar relatório semanal
    async sendWeeklyReport() {
        try {
            const stats = await supabaseService.getStats();
            const lastBookings = await supabaseService.getLastBookings(20);
            
            const now = new Date();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - 7);
            
            const weeklyVisits = await supabaseService.getVisitsByPeriod(
                startOfWeek.toISOString(),
                now.toISOString()
            );
            
            const weeklyBookings = await supabaseService.getBookingsByPeriod(
                startOfWeek.toISOString(),
                now.toISOString()
            );

            let html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                 color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .stat-item { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .stat-number { font-size: 24px; font-weight: bold; color: #667eea; }
                        .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
                        .highlight { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th { background: #667eea; color: white; padding: 10px; text-align: left; }
                        td { padding: 10px; border-bottom: 1px solid #ddd; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>📊 Relatório Semanal</h1>
                            <p>Pousada do Enildo - Semana de ${startOfWeek.toLocaleDateString('pt-BR')} a ${now.toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div class="content">
                            <div class="highlight">
                                <h3>📈 Resumo da Semana</h3>
                                <p><strong>Visitas:</strong> ${weeklyVisits.length} esta semana</p>
                                <p><strong>Reservas:</strong> ${weeklyBookings.length} esta semana</p>
                                <p><strong>Taxa de Conversão:</strong> ${weeklyVisits.length > 0 ? ((weeklyBookings.length / weeklyVisits.length) * 100).toFixed(2) : 0}%</p>
                            </div>

                            <h2>Estatísticas Gerais</h2>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <div class="stat-number">${stats.total_visits}</div>
                                    <div class="stat-label">Total de Visitas</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-number">${stats.total_bookings}</div>
                                    <div class="stat-label">Total de Reservas</div>
                                </div>
                            </div>

                            <h2>Últimas 20 Reservas</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>IP</th>
                                        <th>Referrer</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${lastBookings.map(booking => `
                                        <tr>
                                            <td>${new Date(booking.click_date).toLocaleString('pt-BR')}</td>
                                            <td>${booking.ip_address}</td>
                                            <td>${booking.referrer || 'Direto'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        <div class="footer">
                            <p>Relatório gerado automaticamente pelo sistema da Pousada do Enildo</p>
                            <p>${new Date().toLocaleString('pt-BR')}</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            await this.sendEmail(
                process.env.REPORT_EMAIL,
                `📊 Relatório Semanal - Pousada do Enildo - ${new Date().toLocaleDateString('pt-BR')}`,
                html
            );

            await supabaseService.registerReport('weekly', html);
            
            console.log('Relatório semanal enviado com sucesso');
        } catch (error) {
            console.error('Erro ao enviar relatório semanal:', error);
            throw error;
        }
    }
}

export default new EmailService();