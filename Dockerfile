FROM oven/bun:1 as builder
WORKDIR /app

# Instalar librerías necesarias para Prisma (Debian Bookworm usa libssl3)
RUN apt-get update -y && apt-get install -y \
    openssl \
    libssl3 \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Configurar Prisma para usar engine binario (evita problemas de libssl)
ENV PRISMA_CLIENT_ENGINE_TYPE=binary
ENV OPENSSL_CONF=/dev/null

# Copiar package.json primero
COPY package.json ./

# Copiar directorio prisma ANTES de generar cliente
COPY prisma ./prisma/

# Instalar dependencias
RUN bun pm cache rm --all
RUN bun install

# Generar cliente de Prisma (ahora que ya tiene el schema)
RUN bunx prisma generate

# Copiar el resto del código
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["bun", "run", "start"]