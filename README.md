# BCP Exchange Platform

Plataforma web para la gestión de tipos de cambio y parámetros del sistema, construida con Angular 19 y autenticación Azure AD.

![Angular](https://img.shields.io/badge/Angular-19-red?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square)
![PrimeNG](https://img.shields.io/badge/PrimeNG-19-orange?style=flat-square)

## Características

- **Autenticación Azure AD**: Login seguro con Microsoft Authentication Library (MSAL)
- **Gestión de Tipos de Cambio**: CRUD completo con filtros y paginación
- **Administración de Parámetros**: Configuración de parámetros del sistema
- **Responsive**: Diseño adaptable con Tailwind CSS
- **SSR**: Server-Side Rendering para mejor rendimiento

## Tecnologías

- **Angular 19** con Standalone Components
- **PrimeNG 19** para componentes UI
- **Tailwind CSS v4** para estilos
- **MSAL Browser** para autenticación Azure AD
- **RxJS** para programación reactiva
- **NGX-Toastr** para notificaciones

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

## Compilación

```bash
npm run build
```

## Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run lint` | Ejecuta ESLint |
| `npm test` | Ejecuta pruebas unitarias |

## Estructura del Proyecto

```
src/app/
├── core/                    # Funcionalidades core
│   ├── guards/              # Guardias de rutas
│   ├── interceptors/        # Interceptores HTTP
│   ├── models/              # Modelos e interfaces
│   └── services/            # Servicios de autenticación
├── features/                # Módulos de funcionalidades
│   ├── configuration/       # Configuración de la app
│   ├── exchange-rates/      # Gestión de tipos de cambio
│   ├── parameters/          # Gestión de parámetros
│   └── welcome/             # Página de bienvenida
├── pages/                   # Páginas principales
│   └── login/               # Página de login
└── shared/                  # Componentes compartidos
    ├── components/          # Componentes reutilizables
    └── services/            # Servicios compartidos
```

## Configuración de Azure AD

Configura las variables de entorno en `src/environments/`:

```typescript
export const environment = {
  production: false,
  azureAd: {
    clientId: 'your-client-id',
    authority: 'https://login.microsoftonline.com/your-tenant-id',
    redirectUri: 'http://localhost:4200'
  },
  apiUrl: 'https://your-api-url.com'
};
```

## Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.
