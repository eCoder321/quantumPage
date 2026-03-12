# Stage 1: Build the application
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine
# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html
# Expose port 8080
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
