# Misiones Nacionales

Aplicacion React + Vite conectada a Supabase para registro, login, contenido, ranking, misiones y perfil.

## Desarrollo local

```bash
npm install
npm run dev
```

Variables locales:

```bash
cp .env.example .env.local
```

## Variables de entorno en Vercel

En Vercel, agrega estas variables en `Project Settings > Environment Variables`:

```bash
VITE_API_MODE=supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_PUBLIC_SITE_URL=https://tu-dominio.com
VITE_AUTH_REDIRECT_URL=https://tu-dominio.com
```

`VITE_PUBLIC_SITE_URL` y `VITE_AUTH_REDIRECT_URL` evitan que los correos de Supabase Auth apunten a `localhost`.

## Supabase Auth Redirects

En Supabase Dashboard:

1. Ve a `Authentication > URL Configuration`.
2. En `Site URL`, pon tu dominio final, por ejemplo `https://tu-dominio.com`.
3. En `Redirect URLs`, agrega:

```text
https://tu-dominio.com/**
https://www.tu-dominio.com/**
http://localhost:5173/**
```

El wildcard local sirve solo para pruebas. En produccion, Supabase debe tener permitido tu dominio real.

## Dominio personalizado con Hostinger y Vercel

1. En Vercel, ve a `Project Settings > Domains`.
2. Agrega `tu-dominio.com` y tambien `www.tu-dominio.com`.
3. Vercel te dira que registros DNS crear.
4. En Hostinger, abre la zona DNS del dominio y crea/actualiza esos registros.
5. Cuando Vercel marque el dominio como verificado, vuelve a desplegar si cambiaste variables.

Recomendado:

```text
tu-dominio.com      A      76.76.21.21
www.tu-dominio.com  CNAME  cname.vercel-dns.com
```

Si Vercel te muestra valores distintos, usa los valores exactos que te da Vercel.

## Build

```bash
npm run lint
npm run build
```
