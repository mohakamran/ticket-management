# OmniTicket

OmniTicket is a high-performance, role-based ticket management system designed for administrative task tracking and employee collaboration. It provides a seamless, real-time experience for managing support requests, technical issues, and internal tasks.

## 🚀 Key Features

- **Role-Based Access Control (RBAC):** Distinct interfaces and permissions for Admins and Employees.
- **Admin Dashboard:** High-level overview of ticket metrics, status distributions, and team activity.
- **Ticket Lifecycle Management:** Create, prioritize (Low, Medium, High), and track tickets from "Pending" to "Resolved".
- **Advanced Assignment:** Admins can assign tickets to specific employees using a searchable command-style dropdown.
- **Real-Time Synchronization:** Powered by Firebase, all ticket updates and comments are reflected instantly across all connected clients.
- **Collaboration:** Threaded comments on every ticket for clear communication.
- **Responsive & Modern UI:** A polished, "Swiss-style" interface built with Tailwind CSS, supporting both desktop and mobile views.
- **Secure Authentication:** Integrated with Firebase Auth for reliable user management.

## 🛠️ Tech Stack

- **Framework:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth:** [Firebase](https://firebase.google.com/) (Firestore & Authentication)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
- **Animations:** [Motion](https://motion.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts:** [Recharts](https://recharts.org/)

## 📦 Local Installation

To get the project running on your local machine, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd omniticket
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a new project in the [Firebase Console](https://console.firebase.google.com/).
   - Enable **Firestore Database** and **Authentication** (specifically the Google provider).
   - Create a file named `firebase-applet-config.json` in the root directory with your Firebase configuration:
     ```json
     {
       "apiKey": "YOUR_API_KEY",
       "authDomain": "YOUR_AUTH_DOMAIN",
       "projectId": "YOUR_PROJECT_ID",
       "storageBucket": "YOUR_STORAGE_BUCKET",
       "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
       "appId": "YOUR_APP_ID",
       "firestoreDatabaseId": "(default)"
     }
     ```

4. **Deploy Security Rules**
   - Copy the contents of `firestore.rules` from this project to your Firebase Console or deploy using Firebase CLI.

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## 🏗️ Project Structure

- `src/components`: Reusable UI elements and complex components like `AuthProvider`.
- `src/pages`: Main application views (Dashboard, Tickets, Ticket Details).
- `src/services`: Business logic and Firebase interaction layer.
- `src/lib`: Utility functions and third-party client initializations.
- `src/types.ts`: Shared TypeScript interfaces.

## 📄 License

This project is open-source and available under the MIT License.
