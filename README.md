# MCI Delivery Tracker

A comprehensive delivery management system with e-signature capabilities, real-time tracking, and complete delivery lifecycle management.

## Features

- **Delivery Booking:** Schedule and manage deliveries.
- **Real-time Tracking:** Track the status of your deliveries in real-time.
- **E-Signature:** Capture signatures upon delivery.
- **Analytics Dashboard:** Get insights into your delivery operations.
- **Customer Management:** Manage your customer information.

## Getting Started

### Prerequisites

- Node.js and npm
- A Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/johnmangawang-git/mci-TMS.git
   ```
2. Navigate to the project directory:
   ```bash
   cd mci-delivery-tracker-SB
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Supabase Configuration

1. Create a new project on [Supabase](https://supabase.com/).
2. Go to your project's **Settings** > **API**.
3. Find your **Project URL** and **anon key**.
4. Create a `.env` file in the root of the project.
5. Add the following lines to the `.env` file, replacing the placeholders with your actual Supabase credentials:
   ```
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### Running the Application

1. Start the server:
   ```bash
   npm start
   ```
2. Open your browser and navigate to `http://localhost:8086`.

## Project Structure

- `server.js`: The main Express server.
- `public/`: Contains all the static assets, including HTML, CSS, and JavaScript files.
- `public/index.html`: The main entry point of the application.
- `public/assets/js/app.js`: The core application logic.
- `public/assets/js/dataService.js`: The service layer for interacting with Supabase.
- `supabase/`: Contains database migration scripts.
