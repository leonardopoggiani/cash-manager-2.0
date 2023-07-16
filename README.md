# Cash Manager 2.0

Cash Manager 2.0 is a web application designed for restaurant order and inventory management. It allows the user to create orders, track product availability and dependencies, view statistics on sold products and earnings, manage orders, and perform end-of-day operations.

The application has been created with a local-first approach and can be used on one or multiple computers without needing internet access. However, it does require a network connection between the computers for syncing the data.
Tech Stack

- Frontend: React, TypeScript
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- Containerization: Docker

## Getting Started

### Prerequisites

    - Docker
    - Docker Compose

### Build and Run the Application

    - Clone the repository to your local machine.

```bash

git clone https://github.com/yourusername/cash-manager-2.0.git
cd cash-manager-2.0
```

### Use Docker Compose to build and run the application.

```bash

    docker-compose up --build
```

The application should now be running at http://localhost (frontend) and http://localhost:5000 (backend).

## Application Structure

    - /backend: Contains all backend-related code including server logic, API endpoints, and database models.
    - /frontend: Contains all frontend-related code including React components and services for API interaction.
    - docker-compose.yml: Defines the services that make up the application for Docker.

### Features

    - Order management: Create orders specifying products and quantities. The system calculates the total to be paid.
    - Product availability: Track the quantity of each product. The system prevents ordering products that have run out.
    - Product dependencies: Define dependencies between products. The system automatically adjusts product availability based on the dependencies.
    - Statistics: View statistics on sold products and earnings for the day.
    - Order history: View, modify, or delete past orders.
    - End of day operations: Perform end-of-day operations to view total earnings and reset the system for the next day.
    - Data syncing: The application can be used on multiple computers with synced data.
    - Authentication: User authentication with username and password.

## Contributing

If you want to contribute to this project, please open a new issue to discuss your feature or bug fix, then create a pull request and link it to the issue.

## License

This project is licensed under the MIT License.
