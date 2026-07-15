import nodemailer from 'nodemailer';
import 'dotenv/config';

async function testGmail() {
    console.log('📧 Testando configuração do Gmail...');
    console.log(`📨 SMTP: ${process.env.SMTP_HOST}`);
    console.log(`👤 Usuário: ${process.env.SMTP_USER}`);
    console.log(`🔑 Senha: ${process.env.SMTP_PASS ? '****' : '❌ Não configurada'}`);
    console.log(`📬 Para: ${process.env.REPORT_EMAIL}`);

    // Verificar se a senha está no formato correto (sem espaços)
    const password = process.env.SMTP_PASS || '';
    if (password.includes(' ')) {
        console.warn('⚠️ A senha contém espaços. Remova os espaços!');
        console.warn(`📝 Senha atual: "${password}"`);
        console.warn('💡 Exemplo correto: abcd1234efgh5678');
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false, // TLS
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        // Verificar conexão
        console.log('\n🔍 Verificando conexão...');
        await transporter.verify();
        console.log('✅ Conexão SMTP estabelecida!');

        // Enviar email de teste
        console.log('\n📤 Enviando email de teste...');
        const info = await transporter.sendMail({
            from: `"Pousada do Enildo (Teste)" <${process.env.SMTP_USER}>`,
            to: process.env.REPORT_EMAIL,
            subject: '✅ Teste - Configuração Gmail - Pousada do Enildo',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h1 style="color: #667eea;">✅ Configuração do Gmail Funcionando!</h1>
                    <p>Este é um email de teste da <strong>Pousada do Enildo</strong>.</p>
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>📅 Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                        <p><strong>🔗 Servidor:</strong> ${process.env.SMTP_HOST}</p>
                        <p><strong>👤 Usuário:</strong> ${process.env.SMTP_USER}</p>
                    </div>
                    <hr style="border: none; border-top: 1px solid #e0e0e0;">
                    <p style="color: #666; font-size: 12px;">Este é um email automático. Por favor, não responda.</p>
                    <p style="color: #999; font-size: 11px;">Configuração da Pousada do Enildo - ${new Date().toLocaleDateString('pt-BR')}</p>
                </div>
            `
        });

        console.log('✅ Email enviado com sucesso!');
        console.log(`📧 ID: ${info.messageId}`);
        console.log(`📬 Para: ${process.env.REPORT_EMAIL}`);
        console.log('\n📧 Verifique sua caixa de entrada do Gmail!');

    } catch (error) {
        console.error('\n❌ Erro ao enviar email:');
        console.error(`📝 Mensagem: ${error.message}`);
        
        if (error.code === 'EAUTH') {
            console.error('\n🔑 Problema de autenticação:');
            console.error('1. Verifique se a VERIFICAÇÃO EM DUAS ETAPAS está ativa:');
            console.error('   https://myaccount.google.com/security');
            console.error('2. Gere uma nova SENHA DE APP:');
            console.error('   https://myaccount.google.com/apppasswords');
            console.error('3. Use a senha de 16 caracteres (sem espaços)');
            console.error('4. Desbloqueie a conta, se necessário:');
            console.error('   https://accounts.google.com/DisplayUnlockCaptcha');
        } else if (error.code === 'EENVELOPE') {
            console.error('\n📬 Verifique o email de destino:');
            console.error(`   REPORT_EMAIL = ${process.env.REPORT_EMAIL}`);
        }
        
        if (error.response) {
            console.error(`📝 Detalhes: ${error.response}`);
        }
    }
}

testGmail();