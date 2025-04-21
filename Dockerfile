# Stage 1: Build the application
FROM node:20-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy application into container
COPY . /app

# Install dependencies
RUN npm install