# Étape 1 : Build du projet React
FROM node:18-alpine AS build

WORKDIR /app

# Copier package.json et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste du projet et builder
COPY . .
RUN npm run build

# Étape 2 : Servir avec un serveur web (nginx)
FROM nginx:alpine

# Copier les fichiers buildés dans nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copier config nginx (optionnel si tu veux du routing React)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3003
CMD ["nginx", "-g", "daemon off;"]
