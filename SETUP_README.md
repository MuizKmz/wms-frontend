# WMS Frontend Setup Guide 🚀

Welcome to the WMS (Warehouse Management System) Frontend! This guide will help you set up your development environment step by step.

---

## 📋 Prerequisites

Before you begin, make sure you have a Windows computer with internet access.

---

## 🛠️ Step-by-Step Installation

### Step 1: Install Node.js

Node.js is required to run the frontend application.

1. **Download Node.js:**
   - Visit: https://nodejs.org/
   - Download the **LTS version** (Long Term Support) - recommended for most users
   - At the time of writing, Node.js 20.x or later is recommended

2. **Install Node.js:**
   - Run the downloaded installer
   - Click "Next" through the installation wizard
   - ✅ Make sure to check "Automatically install the necessary tools" if prompted
   - Complete the installation

3. **Verify Installation:**
   - Open **PowerShell** or **Command Prompt**
   - Type the following commands:
   ```powershell
   node --version
   ```
   - You should see something like `v20.x.x`
   
   ```powershell
   npm --version
   ```
   - You should see something like `10.x.x`

---

### Step 2: Install Git (Optional but Recommended)

Git helps you manage code versions and collaborate with the team.

1. **Download Git:**
   - Visit: https://git-scm.com/download/win
   - Download the latest version

2. **Install Git:**
   - Run the installer
   - Use default settings (just click "Next")
   - Complete the installation

3. **Verify Installation:**
   ```powershell
   git --version
   ```
   - You should see something like `git version 2.x.x`

---

### Step 3: Install Visual Studio Code (Code Editor)

VS Code is the recommended code editor for this project.

1. **Download VS Code:**
   - Visit: https://code.visualstudio.com/
   - Download for Windows

2. **Install VS Code:**
   - Run the installer
   - ✅ Check "Add to PATH" during installation
   - ✅ Check "Create a desktop icon" if you want
   - Complete the installation

3. **Install Recommended Extensions:**
   - Open VS Code
   - Click the Extensions icon (or press `Ctrl+Shift+X`)
   - Install these extensions:
     - **Vue - Official** (Vue Language Features)
     - **ESLint** (Code linting)
     - **Prettier - Code formatter** (Code formatting)
     - **Tailwind CSS IntelliSense** (CSS helper)
     - **TypeScript Vue Plugin (Volar)** (TypeScript support)

---

### Step 4: Get the Project Files

1. **Navigate to Project Folder:**
   - Open **PowerShell** or **Command Prompt**
   - Navigate to the WMS folder:
   ```powershell
   cd "C:\Users\Lenovo\Desktop\Job\Evolve Technology\WMS\New WMS\wms-frontend"
   ```

   > **Note:** If you're cloning from Git, use:
   > ```powershell
   > git clone <repository-url>
   > cd wms-frontend
   > ```

---

### Step 5: Install Project Dependencies

1. **Install all required packages:**
   ```powershell
   npm install
   ```
   - This will take a few minutes
   - It downloads all the libraries and tools needed for the project
   - ☕ Grab a coffee while you wait!

2. **Wait for completion:**
   - You should see a progress bar
   - When done, you'll see a summary of installed packages

---

### Step 6: Start the Development Server

1. **Run the development server:**
   ```powershell
   npm run dev
   ```

2. **Access the application:**
   - Open your web browser
   - Go to: **http://localhost:5173** (or the URL shown in the terminal)
   - You should see the WMS frontend running! 🎉

---

## 🎯 Common Commands

Here are the commands you'll use regularly:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (with hot reload) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code for errors |
| `npm run format` | Format code with Prettier |

---

## 📁 Project Structure

Here's what you'll find in the project:

```
wms-frontend/
├── src/                    # Source code
│   ├── assets/            # Images, fonts, etc.
│   ├── components/        # Reusable Vue components
│   ├── views/             # Page components
│   ├── router/            # Navigation/routing
│   ├── App.vue            # Main app component
│   └── main.ts            # Entry point
├── public/                # Static files
├── package.json           # Project dependencies
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

---

## 🔧 Technology Stack

This project uses:

- **Vue 3** - JavaScript framework for building user interfaces
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Vue Router** - Navigation between pages
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **ApexCharts** - Beautiful charts and graphs
- **SweetAlert2** - Beautiful popup alerts
- **ESLint & Prettier** - Code quality and formatting tools

---

## 🆘 Troubleshooting

### Problem: `npm install` fails

**Solution:**
1. Delete `node_modules` folder and `package-lock.json` file
2. Run `npm cache clean --force`
3. Run `npm install` again

### Problem: Port 5173 is already in use

**Solution:**
1. Stop the other application using that port
2. Or the dev server will automatically use the next available port

### Problem: Hot reload not working

**Solution:**
1. Stop the dev server (`Ctrl+C`)
2. Run `npm run dev` again

### Problem: TypeScript errors

**Solution:**
1. Make sure VS Code is using the workspace TypeScript version
2. Restart VS Code
3. Run `npm run type-check` to see all type errors

---

## 📚 Learning Resources

If you're new to these technologies:

- **Vue 3:** https://vuejs.org/guide/introduction.html
- **TypeScript:** https://www.typescriptlang.org/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Vite:** https://vitejs.dev/guide/

---

## ✅ Quick Checklist

Before you start coding, make sure:

- [ ] Node.js is installed and verified
- [ ] VS Code is installed with recommended extensions
- [ ] Project dependencies are installed (`npm install` completed)
- [ ] Dev server starts successfully (`npm run dev`)
- [ ] You can access the app in your browser
- [ ] You understand the basic project structure

---

## 👥 Need Help?

If you get stuck:

1. Check the troubleshooting section above
2. Search for the error message online (Google/Stack Overflow)
3. Ask your team lead or senior developer

---

## 🎓 Development Workflow

1. **Make sure the dev server is running:** `npm run dev`
2. **Edit files** in the `src/` folder
3. **Save your changes** - the browser will auto-refresh
4. **Test your changes** in the browser
5. **Run linting** before committing: `npm run lint`
6. **Format your code:** `npm run format`

---

## 🚀 Ready to Code!

You're all set! Start by exploring the code in the `src/` folder. Happy coding! 💻

---

**Last Updated:** October 2025  
**Maintained by:** Backend Team Lead
