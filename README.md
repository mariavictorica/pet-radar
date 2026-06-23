# 🐾 PetRadar API

API REST construida con **NestJS**, **TypeORM** y **PostgreSQL + PostGIS** para reportar mascotas perdidas y encontradas, con notificaciones por email y búsqueda geoespacial.

---

## Endpoints

| Método | Ruta                  | Descripción                              |
|--------|-----------------------|------------------------------------------|
| GET    | `/api/lost-pets`      | Lista mascotas perdidas activas          |
| GET    | `/api/lost-pets?species=perro` | Filtra por especie                |
| POST   | `/api/lost-pets`      | Registra una mascota perdida             |
| GET    | `/api/found-pets`     | Lista mascotas encontradas               |
| POST   | `/api/found-pets`     | Registra una mascota encontrada (+ notifica por email si hay coincidencias en 500m) |

---

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```env
PORT=3000
DB_HOST=...
DB_PORT=5432
DB_NAME=petradar
DB_USER=postgres
DB_PASSWORD=...
MAPBOX_TOKEN=...
MAILER_SERVICE=gmail
MAILER_EMAIL=...
MAILER_PASSWORD=...
NOTIFICATION_EMAIL=...
```

---

## 🚀 Deploy en Railway (recomendado — gratis)

### 1. Base de datos PostgreSQL + PostGIS

Railway **no** ofrece PostGIS nativo, por lo que usamos **Supabase** para la BD:

1. Crea cuenta en [supabase.com](https://supabase.com) (gratis).
2. Crea un nuevo proyecto.
3. En **Settings → Database**, copia los datos de conexión (host, port, user, password, database).
4. PostGIS ya viene habilitado en Supabase por defecto ✅.
5. Ejecuta las migraciones (ver sección abajo).

### 2. Subir código a GitHub

```bash
git init
git add .
git commit -m "feat: PetRadar API lista para deploy"
git remote add origin https://github.com/TU_USUARIO/pet-radar.git
git push -u origin main
```

### 3. Deploy en Railway

1. Ve a [railway.app](https://railway.app) y crea cuenta (gratis con GitHub).
2. Click **New Project → Deploy from GitHub repo**.
3. Selecciona tu repositorio `pet-radar`.
4. Railway detectará el `Dockerfile` automáticamente.
5. Ve a la pestaña **Variables** y agrega todas las variables del `.env`:

```
PORT=3000
DB_HOST=db.xxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu_password_supabase
MAPBOX_TOKEN=pk.xxx
MAILER_SERVICE=gmail
MAILER_EMAIL=tu@gmail.com
MAILER_PASSWORD=tu_app_password
NOTIFICATION_EMAIL=tu@gmail.com
```

6. En **Settings → Networking → Generate Domain** para obtener tu URL pública.

### 4. Ejecutar migraciones

Desde tu máquina local (con el `.env` apuntando a Supabase):

```bash
npm install
npm run migration:run
```

O bien en Railway: agrega un **one-time command** en la sección de deploy:
```
node dist/main & sleep 5 && npm run migration:run
```

---

## 🧪 Probar la API

### GET – Mascotas perdidas
```bash
curl https://TU-URL.railway.app/api/lost-pets
```

### POST – Registrar mascota perdida
```bash
curl -X POST https://TU-URL.railway.app/api/lost-pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Firulais",
    "species": "perro",
    "breed": "Labrador",
    "color": "amarillo",
    "size": "grande",
    "description": "Collar rojo con placa",
    "owner_name": "Ana García",
    "owner_email": "ana@email.com",
    "owner_phone": "4771234567",
    "lat": 21.0190,
    "lon": -101.2574,
    "address": "Centro, Guanajuato",
    "lost_date": "2025-06-20T10:00:00Z"
  }'
```

### POST – Registrar mascota encontrada
```bash
curl -X POST https://TU-URL.railway.app/api/found-pets \
  -H "Content-Type: application/json" \
  -d '{
    "species": "perro",
    "color": "amarillo",
    "size": "grande",
    "description": "Perro sin collar encontrado en parque",
    "finder_name": "Luis Pérez",
    "finder_email": "luis@email.com",
    "finder_phone": "4779876543",
    "lat": 21.0193,
    "lon": -101.2571,
    "address": "Parque Embajadoras, Guanajuato",
    "found_date": "2025-06-20T15:00:00Z"
  }'
```

---

## Desarrollo local

```bash
# Levantar base de datos local
docker compose up -d

# Instalar dependencias
npm install

# Copiar y editar variables
cp .env.example .env

# Ejecutar migraciones
npm run migration:run

# Iniciar en modo desarrollo
npm run start:dev
```

---

## Arquitectura

```
src/
├── config/         # Variables de entorno (env-var)
├── core/
│   ├── db/
│   │   ├── entities/    # LostPet, FoundPet (TypeORM + PostGIS)
│   │   └── migrations/  # Esquema inicial con PostGIS
│   └── interfaces/  # DTOs e interfaces
├── lost-pets/       # Módulo mascotas perdidas
├── found-pets/      # Módulo mascotas encontradas + geobúsqueda
└── email/           # Servicio de notificaciones por email
```

La función principal de `found-pets` usa **ST_DWithin** de PostGIS para buscar mascotas perdidas en un radio de **500 metros** y notifica por email a sus dueños automáticamente.
