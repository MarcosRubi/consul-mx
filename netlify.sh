#!/bin/bash

# Descargar e instalar libnss3.so
apt-get update && apt-get install -y libnss3

# Lanzar el comando de compilación de Netlify
npm run build