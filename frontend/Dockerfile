# Use an official Node runtime as a parent image in this case version 21
FROM node:21

# Set the working directory inside the docker container
WORKDIR /app

# Copy package.json and package-lock.json 
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend app
COPY . .

# Expose port 3000 for the development server
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]