# Use the official lightweight Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to cache installation layers
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# FIX: Kept this exactly on a single line with a trailing space and dot
COPY . .

# Expose port 8080 for Google Cloud Run
EXPOSE 8080

# Start the application
CMD ["node", "index.js"]