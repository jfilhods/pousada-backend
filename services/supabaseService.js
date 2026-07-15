import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials não configuradas');
}

const supabase = createClient(supabaseUrl, supabaseKey);

class SupabaseService {
    // Registrar visita
    async registerVisit(page, ip, userAgent) {
        const { data, error } = await supabase
            .from('page_visits')
            .insert([
                { 
                    page, 
                    ip_address: ip,
                    user_agent: userAgent
                }
            ]);
        
        if (error) {
            console.error('Erro ao registrar visita:', error);
            throw error;
        }
        return data;
    }

    // Registrar clique em reserva
    async registerBooking(ip, userAgent, referrer) {
        const { data, error } = await supabase
            .from('booking_clicks')
            .insert([
                { 
                    ip_address: ip,
                    user_agent: userAgent,
                    referrer: referrer
                }
            ]);
        
        if (error) {
            console.error('Erro ao registrar reserva:', error);
            throw error;
        }
        return data;
    }

    // Buscar estatísticas
    async getStats() {
        try {
            // Total de visitas
            const { count: totalVisits, error: error1 } = await supabase
                .from('page_visits')
                .select('*', { count: 'exact', head: true });

            // Visitas hoje
            const today = new Date().toISOString().split('T')[0];
            const { count: todayVisits, error: error2 } = await supabase
                .from('page_visits')
                .select('*', { count: 'exact', head: true })
                .gte('visit_date', today);

            // Total de reservas
            const { count: totalBookings, error: error3 } = await supabase
                .from('booking_clicks')
                .select('*', { count: 'exact', head: true });

            // Reservas hoje
            const { count: todayBookings, error: error4 } = await supabase
                .from('booking_clicks')
                .select('*', { count: 'exact', head: true })
                .gte('click_date', today);

            if (error1 || error2 || error3 || error4) {
                throw new Error('Erro ao buscar estatísticas');
            }

            return {
                total_visits: totalVisits || 0,
                today_visits: todayVisits || 0,
                total_bookings: totalBookings || 0,
                today_bookings: todayBookings || 0
            };
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            throw error;
        }
    }

    // Buscar últimas reservas
    async getLastBookings(limit = 10) {
        const { data, error } = await supabase
            .from('booking_clicks')
            .select('*')
            .order('click_date', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Erro ao buscar últimas reservas:', error);
            throw error;
        }
        return data;
    }

    // Buscar últimas visitas
    async getLastVisits(limit = 10) {
        const { data, error } = await supabase
            .from('page_visits')
            .select('*')
            .order('visit_date', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Erro ao buscar últimas visitas:', error);
            throw error;
        }
        return data;
    }

    // Registrar relatório enviado
    async registerReport(type, content) {
        const { data, error } = await supabase
            .from('email_reports')
            .insert([
                { 
                    report_type: type,
                    content: content
                }
            ]);

        if (error) {
            console.error('Erro ao registrar relatório:', error);
            throw error;
        }
        return data;
    }

    // Buscar últimos relatórios
    async getLastReports(limit = 10) {
        const { data, error } = await supabase
            .from('email_reports')
            .select('*')
            .order('sent_date', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Erro ao buscar relatórios:', error);
            throw error;
        }
        return data;
    }

    // Verificar se já enviou relatório hoje
    async hasReportToday() {
        const today = new Date().toISOString().split('T')[0];
        const { count, error } = await supabase
            .from('email_reports')
            .select('*', { count: 'exact', head: true })
            .gte('sent_date', today);

        if (error) {
            console.error('Erro ao verificar relatório de hoje:', error);
            return false;
        }
        return count > 0;
    }

    // Buscar visitas por período
    async getVisitsByPeriod(startDate, endDate) {
        const { data, error } = await supabase
            .from('page_visits')
            .select('*')
            .gte('visit_date', startDate)
            .lte('visit_date', endDate);

        if (error) {
            console.error('Erro ao buscar visitas por período:', error);
            throw error;
        }
        return data;
    }

    // Buscar reservas por período
    async getBookingsByPeriod(startDate, endDate) {
        const { data, error } = await supabase
            .from('booking_clicks')
            .select('*')
            .gte('click_date', startDate)
            .lte('click_date', endDate);

        if (error) {
            console.error('Erro ao buscar reservas por período:', error);
            throw error;
        }
        return data;
    }
    async resetAllReports() {
        const { data, error } = await supabase
            .from('email_reports')
            .delete()
            .neq('id', 0); // Deleta todos os registros
        
        if (error) {
            console.error('Erro ao resetar relatórios:', error);
            throw error;
        }
        return data;
    }

    // 🆕 Resetar relatórios por tipo
    async resetReportsByType(type) {
        const { data, error } = await supabase
            .from('email_reports')
            .delete()
            .eq('report_type', type);
        
        if (error) {
            console.error(`Erro ao resetar relatórios ${type}:`, error);
            throw error;
        }
        return data;
    }

    // 🆕 Deletar relatórios de hoje por tipo
    async deleteTodayReports(type) {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('email_reports')
            .delete()
            .eq('report_type', type)
            .gte('sent_date', today);
        
        if (error) {
            console.error(`Erro ao deletar relatórios ${type} de hoje:`, error);
            throw error;
        }
        return data;
    }
}

export default new SupabaseService();