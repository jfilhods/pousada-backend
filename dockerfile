# Dockerfile
FROM node:20-slim

# Criar diretório da aplicação
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install --production

# Copiar o resto da aplicação
COPY . .

# Expor a porta
EXPOSE 3000

# Comando para iniciar
CMD ["node", "server.js"]