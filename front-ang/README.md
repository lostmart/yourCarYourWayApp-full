# Front

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.7.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Project Structure

```bash
src/
├── app/
│   ├── core/                 # Services singleton, guards, interceptors
│   │   ├── services/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── models/
│   ├── features/             # Modules fonctionnels
│   │   ├── auth/
│   │   ├── user/
│   │   ├── rental/
│   │   └── support/
│   ├── shared/               # Composants, directives, pipes réutilisables
│   │   ├── components/
│   │   ├── directives/
│   │   └── pipes/
│   └── store/                # NgRx store
│       ├── actions/
│       ├── reducers/
│       ├── effects/
│       └── selectors/
├── assets/
├── environments/
└── styles/
```
