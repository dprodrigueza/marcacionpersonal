FROM node:22

# Instala Firebase CLI globalmente
RUN npm install -g firebase-tools

# Crea el directorio de trabajo
WORKDIR /app

# Copia tu código al contenedor (ajusta .dockerignore si lo deseas)
COPY . .

# (Opcional) Instala dependencias del proyecto
RUN npm install

# Abre la terminal por defecto
CMD [ "bash" ]