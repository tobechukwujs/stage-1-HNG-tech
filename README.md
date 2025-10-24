HNG Stage 1: String Analyzer Service

This is a RESTful API service built for the HNG Internship (Stage 1) task. The service analyzes strings and stores their computed properties in a PostgreSQL database.

API Endpoints

The base URL for all endpoints is /api.

Method

Endpoint

Description

POST

/strings

Analyzes a new string, computes its properties, and stores it.

GET

/strings/{string_value}

Retrieves the properties of a specific, previously analyzed string.

GET

/strings

Retrieves all analyzed strings, with support for filtering.

GET

/strings/filter-by-natural-language

Parses a natural language query to filter strings.

DELETE

/strings/{string_value}

Deletes a specific string from the database.

Tech Stack

Backend: Node.js, Express.js

Database: PostgreSQL

ORM: Sequelize

Setup & Run Locally

1. Prerequisites

Node.js (v18 or later)

PostgreSQL running on your machine.

2. Clone the Repository

git clone https://github.com/tobechukwujs/stage-1-HNG-tech
cd https://github.com/tobechukwujs/stage-1-HNG-tech


3. Install Dependencies

npm install


4. Set Up Environment Variables

Create a file named .env in the root of the project and add your database connection URL:

# .env
DATABASE_URL="postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5432/string_analyzer"


Note: You must create the string_analyzer database in PostgreSQL first.

5. Run the Application

This command will start the server with nodemon, which automatically syncs your database tables.

npm run dev


The server will be running at https://stage-1-hng-tech-production-8d53.up.railway.app/.
