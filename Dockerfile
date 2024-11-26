# Stage 1: Build the application
FROM node:20-alpine as build

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json to install dependencies
# COPY /services/tat/IMAGE-TactileAuthoring/package*.json ./

# Copy complete application code
COPY /services/tat/IMAGE-TactileAuthoring/ .

# Install only production dependencies
#ENV NODE_ENV=production
#RUN npm install

# Install dependencies
RUN npm install


# Build the application
# RUN npm run build

# Set npm to ignore scripts
ENV npm_config_ignore_scripts=true

# Run build manually ignoring scripts
WORKDIR /app/packages/svgcanvas
RUN npx rollup -c
WORKDIR /app
RUN npx rollup -c

# Stage 2: Serve the application
FROM nginx:alpine

# Copy the build output from the previous stage to the Nginx HTML directory
COPY --from=build /app/dist/editor/ /usr/share/nginx/html

# Copy a custom Nginx configuration file, if needed (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose the default Nginx port
EXPOSE 80

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]