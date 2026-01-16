# Project: Library of Babylon

## Mission

The Library of Babylon is a long-term archival project dedicated to the preservation of cultural artifacts, with an initial focus on the works of the VTuber Hoshimachi Suisei. Our mission is to create a comprehensive, perpetual, and accessible archive for future generations.

This project is inspired by the concept of a universal library, aiming to meticulously collect, catalog, and preserve digital works, ensuring they are not lost to time.

## Project Structure

The project is divided into several key components:

*   **`codebase/`**: The core software for the Library.
    *   **`frontend/`**: A Next.js web application that serves as the public interface to the archive.
    *   **`backend/`**: The backend services that power the frontend and manage the archive data.
*   **`archive/`**: The heart of the library, containing the archived data itself, organized by creator.
*   **`scripts/`**: A collection of Python scripts for automating the archival process, including data ingestion from sources like YouTube, metadata generation, and data validation.
*   **`documantation/`**: Contains the project's foundational documents, including the mission statement, long-term roadmap, and architectural designs.

## Getting Started

### Docker Setup (Recommended)

The easiest way to run the entire stack is using Docker Compose:

1. **Prerequisites**: Install Docker and Docker Compose
2. **Start all services**:
   ```bash
   docker-compose up -d
   ```
3. **Access the applications**:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **pgAdmin (Database Admin)**: http://localhost:8080
     - Email: admin@librarybabylon.com
     - Password: admin123
   - **PostgreSQL**: localhost:5432 (babylon_user/babylon_pass)

4. **Database Setup**:
   - Open pgAdmin at http://localhost:8080
   - Add server connection:
     - Host: db
     - Database: library_babylon
     - Username: babylon_user
     - Password: babylon_pass
   - Create admin user by running the seed script:
     ```bash
     docker-compose exec backend python database/seeds/admin_user.py
     ```

5. **Admin Login**:
   - Go to http://localhost:3000/admin/login
   - Username: admin
   - Password: admin123

### Manual Setup

If you prefer to run components individually:

#### Frontend

The frontend is a Next.js application. To run it locally:

1.  Navigate to the `codebase/frontend` directory.
2.  Install the dependencies: `npm install`
3.  Run the development server: `npm run dev`

#### Backend

(Instructions for setting up the backend will be added here once the backend is further developed.)

### Archival Scripts

The archival scripts are written in Python. To use them:

1.  Navigate to the `scripts/` directory.
2.  Ensure you have Python installed.
3.  (Further instructions on running the scripts will be added here.)

## Contributing

We welcome contributions to the Library of Babylon. Please read our `CONTRIBUTING.md` file for guidelines on how to contribute to the project.

## Roadmap

Our long-term vision for the project is outlined in our `Roadmap.md` and `documantation/ROADMAP_200_YEARS.md` files.

## License

This project is licensed under the terms of the `LICENSE.md` file.
