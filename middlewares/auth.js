export default (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ 
            success: false, 
            error: 'Autenticação necessária' 
        });
    }

    // Verificar se é Basic Auth
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];

    // Senha configurada no .env
    const validPassword = process.env.REPORT_PASSWORD || 'senha123';

    if (password !== validPassword) {
        return res.status(401).json({ 
            success: false, 
            error: 'Credenciais inválidas' 
        });
    }

    next();
};