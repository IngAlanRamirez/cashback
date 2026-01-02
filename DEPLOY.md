# Guía de Despliegue - Cashback App

Esta guía te ayudará a publicar tu aplicación en plataformas gratuitas.

## 🚀 Opción 1: Vercel (Recomendado)

### Pasos:

1. **Crear cuenta en Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Regístrate con GitHub (recomendado)

2. **Conectar repositorio**
   - Haz push de tu código a GitHub
   - En Vercel, haz clic en "New Project"
   - Conecta tu repositorio de GitHub
   - Vercel detectará automáticamente la configuración

3. **Configuración automática**
   - Framework Preset: Angular
   - Build Command: `npm run build`
   - Output Directory: `www`
   - Vercel usará el archivo `vercel.json` automáticamente

4. **Desplegar**
   - Haz clic en "Deploy"
   - ¡Listo! Tu app estará en línea en minutos

### Despliegue manual (CLI):

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Desplegar
vercel

# Desplegar a producción
vercel --prod
```

---

## 🌐 Opción 2: Netlify

### Pasos:

1. **Crear cuenta en Netlify**
   - Ve a [netlify.com](https://netlify.com)
   - Regístrate con GitHub

2. **Conectar repositorio**
   - Haz push de tu código a GitHub
   - En Netlify, haz clic en "Add new site" > "Import an existing project"
   - Conecta tu repositorio

3. **Configuración**
   - Build command: `npm run build`
   - Publish directory: `www`
   - Netlify usará el archivo `netlify.toml` automáticamente

4. **Desplegar**
   - Haz clic en "Deploy site"
   - ¡Listo!

### Despliegue manual (CLI):

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Build
npm run build

# Desplegar
netlify deploy --prod --dir=www
```

---

## 🔥 Opción 3: Firebase Hosting

### Pasos:

1. **Instalar Firebase CLI**
   ```bash
   npm i -g firebase-tools
   ```

2. **Login**
   ```bash
   firebase login
   ```

3. **Inicializar proyecto**
   ```bash
   firebase init hosting
   ```
   - Selecciona "Use an existing project" o crea uno nuevo
   - Public directory: `www`
   - Configure as single-page app: `Yes`
   - Set up automatic builds: `No` (o `Yes` si quieres CI/CD)

4. **Build y deploy**
   ```bash
   npm run build
   firebase deploy
   ```

---

## 📋 Checklist antes de desplegar

- [ ] Verificar que `npm run build` funciona correctamente
- [ ] Revisar que todos los assets se copian correctamente
- [ ] Probar la aplicación localmente con `npm start`
- [ ] Verificar que las rutas funcionan (SPA routing)
- [ ] Revisar variables de entorno si las hay

---

## 🔧 Solución de problemas

### Error: "Cannot find module"
- Ejecuta `npm install` antes de hacer build

### Error: "Route not found" (404)
- Verifica que el archivo de configuración tiene los redirects correctos
- Para SPAs, todas las rutas deben redirigir a `/index.html`

### Assets no se cargan
- Verifica que la ruta base en `index.html` es correcta
- Revisa que los assets están en la carpeta `www/assets` después del build

---

## 🌍 URLs de ejemplo

Después del despliegue, tendrás URLs como:
- **Vercel**: `tu-proyecto.vercel.app`
- **Netlify**: `tu-proyecto.netlify.app`
- **Firebase**: `tu-proyecto.web.app` o `tu-proyecto.firebaseapp.com`

---

## 💡 Recomendación

**Vercel es la opción más fácil y rápida** porque:
- ✅ Configuración automática
- ✅ Despliegue en segundos
- ✅ CDN global incluido
- ✅ SSL automático
- ✅ Integración perfecta con GitHub

¡Buena suerte con tu despliegue! 🚀

