This is a copy of the original university project:  https://gitlab.lrz.de/seba-master-2024/team-34/prototype.git.



# Welcome to MyDirndl Configurator Webshop

Welcome to the **MyDirndl Configurator Webshop** by **Team 34**, part of the SEBA Project. This platform allows you to customize and purchase your unique Dirndl with just a few clicks. Our webshop offers a user-friendly interface for designing your Dirndl and visualizing the product before making a purchase.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Docker**: This project uses Docker to simplify dependency management and to streamline project setup and deployment. If you do not have Docker installed, please follow the instructions from the [official Docker documentation](https://docs.docker.com/get-docker/) to install it on your machine.

## Getting Started

To get the MyDirndl Configurator Webshop running on your local machine, follow these steps:

1. **Clone the Repository**
   First, clone this repository to your local machine using the following command:

   ```bash
   git clone https://gitlab.lrz.de/seba-master-2024/team-34/prototype.git
   ```

2. **Navigate to the Project Directory**
   After cloning, move into the project directory:

   ```bash
   cd prototype
   ```

3. **Start the Application**
   Use Docker Compose to build and run the application in Docker containers:
   ```bash
   docker-compose up --build
   ```
   This command builds the Docker images and starts the containers necessary for the webshop. It may take a few minutes to complete the initial setup.

## Navigating the Webshop

Once the application is running, you can access the MyDirndl Configurator Webshop by opening your web browser and navigating to:

```
http://localhost:3000
```

Feel free to explore the configurator and design your custom Dirndl!

## Team

The Configurator-Platform "MyDirndl" was made by Team 34.
