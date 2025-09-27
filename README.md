# Enfyra

[Enfyra](https://demo.enfyra.io/login) is the open-source backend platform.  
We’re building the flexibility backend framework that automatically generates APIs from your database. You create tables through a visual interface, and Enfyra instantly provides REST & GraphQL APIs for them - no coding required. It's like having a backend developer that never sleeps.

<<<<<<< HEAD
<<<<<<< HEAD
A modern, extensible headless CMS built with Nuxt 4, featuring dynamic table management, extension system, API composables with automatic error handling, and a responsive Vue.js interface. Updated deployment structure.
=======
## 🚀 What is Enfyra?
=======
## Documentation
>>>>>>> upstream/main

For full documentation, visit [docs](https://github.com/Enfyra/documents)

To see how to contribute, visit [Contributing](https://github.com/Enfyra/backend/blob/main/CONTRIBUTING.md)

## Community & Support

- [Community Forum](https://github.com/enfyra/enfyra/discussions)
- [GitHub Issues](https://github.com/Enfyra/app/issues)
- [Discord](https://discord.enfyra.io)

## How it works
**Architecture**

Enfyra is a self-hosted and locally developed, easy-to-install. Cloud coming soon.

<<<<<<< HEAD
### ⚡ Key Differentiators

**🔥 Real-time Everything**
- **Live Extension System**: Write Vue/JavaScript extensions that compile and load instantly from the database - no server restarts, no deployments
- **Zero-downtime Schema Updates**: Change your data structure while your API stays 100% available
- **Instant API Generation**: Every table immediately becomes a full REST & GraphQL API with advanced querying

**🛡️ Enterprise-Grade Security**
- **Visual Permission Builder**: Create complex permission logic with AND/OR conditions, nested rules, and field-level access control
- **Dynamic Role System**: Permissions that adapt based on data relationships and user context
- **Handler Isolation**: Custom code runs in isolated processes for security and stability

**🚀 Beyond Traditional CMS**
- **Meta-Programming Core**: The entire API structure is generated from database metadata in real-time
- **Multi-Instance Coordination**: Run multiple instances with automatic schema synchronization via Redis
- **Smart Caching**: SWR (Stale-While-Revalidate) pattern for optimal performance without sacrificing freshness

### 🎯 Core Capabilities

| Feature | How It Works |
|---------|--------------|
| **Extension System** | Write custom features that compile and load instantly from the database |
| **Schema Changes** | Modify your data structure with zero downtime - APIs stay available |
| **Permission System** | Visual builder for complex access control with field-level granularity |
| **API Generation** | Every table instantly becomes a full REST & GraphQL API |
| **Custom Code** | Execute business logic in isolated processes with full request context |
| **Multi-Instance** | Run multiple servers with automatic synchronization |

### 💡 Perfect For

- **Rapid Development**: Go from idea to production API in minutes, not days
- **Complex Projects**: Handle sophisticated data relationships and business logic without limitations
- **Scale-Ready Applications**: Start small and scale to enterprise without architectural changes
- **Team Collaboration**: Intuitive interface for non-technical users, powerful tools for developers
- **Custom Solutions**: Build exactly what you need without fighting framework limitations

### 🏗️ Built With Modern Technology

**Backend**: NestJS + TypeORM + Redis + GraphQL Yoga
**Frontend**: Nuxt 4 + Vue 3 + TypeScript + TailwindCSS
**Database**: MySQL, PostgreSQL, SQLite (your choice)
**Real-time**: WebSockets + Redis Pub/Sub
**Extensions**: Dynamic Vue SFC compilation via Vite
>>>>>>> upstream/main

## Features

- **Dynamic Table Management** - Create and modify database tables on the fly
- **Built-in API Composables** - `useApi` and `useApiLazy` with automatic error handling
- **Toast Notifications** - Automatic error notifications with context
- **TypeScript Support** - Full type safety throughout the application
- **Extension System** - Extensible architecture with dynamic extension loading
- **Responsive Design** - Mobile-friendly interface
- **Authentication System** - Built-in user authentication and roles
- **Permission System** - Comprehensive role-based access control (RBAC)
- **Menu Registry** - Dynamic sidebar and menu management
- **Header Actions** - Configurable header button system

## 📚 Documentation

For complete documentation, please visit our dedicated documentation repository:

**🔗 [Enfyra Documentation](https://github.com/dothinh115/enfyra-docs)**

### 📖 **What's Covered:**

**🚀 Getting Started**
- Complete setup and installation guide
- Your first Enfyra project walkthrough
- Data management basics

**🏗️ Architecture & Development**
- Extension system with live compilation
- API integration and composables
- Permission system and security
- Custom handlers and hooks
- Filter system and querying

**⚡ Advanced Features**
- Header actions and UI registry
- Form systems and components
- Routing and menu management
- Real-time features

**📚 Complete Learning Path**
- Structured progression from beginner to advanced
- Goal-oriented paths for specific use cases
- Cross-referenced documentation


## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type checking
npx nuxi typecheck

# Build for production
npm run build
```

## Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/enfyra-app.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/amazing-feature`
5. Make your changes and commit: `git commit -m 'Add amazing feature'`
6. Push to your branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://github.com/dothinh115/enfyra-docs)
- 🐛 [Issues](https://github.com/dothinh115/dynamiq_cms/issues)
- 💬 [Discussions](https://github.com/dothinh115/dynamiq_cms/discussions)

## Credits

Built with ❤️ using:

- [Nuxt.js](https://nuxt.com/) - The Vue.js Framework
- [Vue.js](https://vuejs.org/) - The Progressive JavaScript Framework
- [Nuxt UI](https://ui.nuxt.com/) - UI Components
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
=======
- **Query Engine**: high-performance engine for filtering, joins, aggregates, and search directly through your API.
- **Realtime**: push updates to clients when rows change using websockets.
- **REST/GraphQL API**: automatically generated from your schema.
- **Auth Service**: JWT-based authentication API for sign-ups, logins, and session management.
- **Storage**: RESTful API for managing files and permissions.
- **Functions**: run server-side code close to your data.
>>>>>>> upstream/main
