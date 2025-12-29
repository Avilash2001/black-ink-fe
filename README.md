# 🧙‍♂️ Black Inkk - Where Stories Come Alive into Reality ✨

Welcome to **Black Inkk**! This is the frontend repository for a cutting-edge application that brings your wildest textual adventures to life using the power of Artificial Intelligence. Built with modern web technologies, this project aims to provide an immersive and dynamic storytelling experience.

## 🚀 What is this?

**Black Inkk** is a platform where users can generate, read, and interact with AI-crafted stories. Whether you're a dungeon master looking for inspiration, a writer seeking a co-pilot, or just someone who loves a good generated tale, this app is for you.

We are part of the **Black Ink** ecosystem, pushing the boundaries of interactive media.

## 🛠️ The Stack

We use the freshest ingredients for our codebase:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Package Manager**: `pnpm` (highly recommended!)

## 🏃‍♂️ Getting Started

Want to run this locally? Let's go!

### Prerequisites

- Node.js 20+
- `pnpm` (or `npm`/`yarn`/`bun`)

### Installation

1.  **Clone the repo:**

    ```bash
    git clone https://github.com/Avilash2001/black-ink-fe.git
    cd black-ink-fe
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    # or npm install
    ```

3.  **Configure Environment:**

    Ensure your backend URL is correctly set. Check `lib/api/client.ts` to point to your local or hosted backend.

    ```typescript
    // Example in lib/api/client.ts
    const API_URL = "http://localhost:3000"; // for local development
    ```

4.  **Run the development server:**

    ```bash
    pnpm dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal, e.g., 3001) to start your adventure!

## 🗺️ Project Structure

Here's a quick tour of the castle:

- `/app`: The heart of our application (Next.js App Router).
  - `/adventure`: Where the magic happens - viewing and creating adventures.
  - `/login` & `/register`: User authentication flows.
- `/components`: Reusable UI blocks and spell components.
- `/lib`: Helper functions, API clients, and ancient scrolls of wisdom.
- `/public`: Static assets, images, and shiny things.

## 🤝 Contributing

We ❤️ contributors!

Got a cool idea? Found a bug? Want to fix a typo?

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/epic-feature`).
3.  Commit your changes (`git commit -m 'Add epic feature'`).
4.  Push to the branch (`git push origin feature/epic-feature`).
5.  Open a Pull Request.

Let's build the future of interactive storytelling together! 🚀

---

_Powered by Black Ink_ 🖋️
