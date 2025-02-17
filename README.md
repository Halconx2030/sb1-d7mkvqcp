# 📊 Gym Progress Tracker App

Este repositorio contiene el código fuente de **Gym Progress Tracker App**, una aplicación diseñada para registrar y visualizar el progreso en el gimnasio. Desarrollada con **React**, **Vite**, **TailwindCSS** y **Supabase**, esta aplicación permite gestionar rutinas, registrar avances y establecer metas, todo desde una interfaz amigable y personalizable.

## 📌 Descripción General

Gym Progress Tracker App es una solución integral para entusiastas del fitness que desean llevar un control detallado de su evolución. Con un sistema basado en Supabase y una interfaz moderna en React, la aplicación proporciona herramientas para registrar cada entrenamiento, analizar estadísticas y visualizar el progreso mediante fotos y métricas.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React, Vite, TypeScript, TailwindCSS
- **Backend:** Supabase (PostgreSQL)
- **Configuración:** Bolt.DIY
- **Estilo y Linting:** ESLint, PostCSS
- **Control de Versiones:** Git, GitHub

---

## 📂 Estructura del Proyecto

```plaintext
.
├── .bolt/                  # Configuraciones de Bolt.DIY
├── supabase/               # Migraciones y configuración de Supabase
│   └── migrations/         # Scripts SQL para la base de datos
├── src/                    # Código fuente principal
│   ├── components/         # Componentes reutilizables
│   │   ├── AuthForm.tsx          # Formulario de autenticación
│   │   ├── Dashboard.tsx         # Panel principal
│   │   ├── WorkoutPlanner.tsx    # Planificador de entrenamientos
│   │   └── ProgressTracker.tsx   # Seguimiento de progreso
│   ├── lib/                # Librerías y utilidades
│   │   ├── supabase.ts         # Configuración de Supabase
│   │   └── themes.ts           # Configuración de temas
│   └── main.tsx             # Punto de entrada
├── package.json             # Gestión de dependencias y scripts
└── vite.config.ts           # Configuración de Vite
```

---

## 🚀 Instalación y Configuración

### 1️⃣ Clonar el Repositorio
```bash
git clone https://github.com/Halconx2030/gym-progress-tracker.git
cd gym-progress-tracker
```

### 2️⃣ Configurar Variables de Entorno
Crea un archivo `.env` basado en el ejemplo incluido y completa los valores:

```bash
cp .env.example .env
```

### 3️⃣ Instalar Dependencias
```bash
npm install
```

### 4️⃣ Iniciar la Aplicación
```bash
npm run dev
```

---

## 🗄️ Configuración de Supabase

### Crear Proyecto en Supabase
1. Regístrate en [Supabase](https://supabase.io) y crea un nuevo proyecto.
2. Obtén tu URL y la clave pública (anon key) y configúralas en `.env`.

### Ejecutar Migraciones
```bash
supabase db push
```

---
