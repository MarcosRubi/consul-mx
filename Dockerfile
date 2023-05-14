FROM node:lts

# Instala dependencias necesarias
RUN apt-get update && apt-get install -y \
    libnss3 \
    && rm -rf /var/lib/apt/lists/*

# Copia los archivos del proyecto al contenedor Docker
WORKDIR /app
COPY . .

# Instala las dependencias del proyecto
RUN npm install

# Expone el puerto necesario (si es necesario)
# EXPOSE 3000

# Comando para ejecutar tu proyecto
CMD ["npm", "run", "start"]
