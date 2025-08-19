# KolayEkstre - Easy Bank Statement Parser

**KolayEkstre** (Turkish for "Easy Statement") is a privacy-focused web application that allows you to parse, analyze, and visualize your Turkish bank statements locally in your browser. Your financial data never leaves your device.

## 🚀 Features

### 🏦 Multi-Bank Support
- **Ziraat Bankası** - Full support for Ziraat Bank Excel statements
- **Enpara.com** - Complete support for Enpara.com bank statements
- **Auto-Detection** - Automatically detects bank type from file structure
- **Extensible** - Easy to add support for additional Turkish banks

### 📊 Data Analysis & Visualization
- **Interactive Charts** - Monthly income/expense trends with Chart.js
- **Statistics Dashboard** - Comprehensive financial summaries
- **Transaction Table** - Sortable and filterable transaction lists
- **Date Range Filtering** - Analyze specific time periods

### 🔒 Privacy & Security
- **100% Local Processing** - All data processing happens in your browser
- **No Server Communication** - Your financial data never leaves your device
- **IndexedDB Storage** - Secure local storage with duplicate detection
- **IBAN Validation** - Ensures data integrity and proper account identification

### 🌍 Internationalization
- **Turkish** - Native language support
- **English** - Full English translation
- **Auto Language Detection** - Detects browser language preferences

### 🎨 Modern User Experience
- **Dark/Light Theme** - Automatic system theme detection with manual override
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Material-UI Components** - Modern and accessible user interface
- **Step-by-Step Wizard** - Guided import process for ease of use

## 🛠️ Technical Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v7
- **Charts**: MUI X-Charts
- **File Processing**: SheetJS (xlsx)
- **Internationalization**: i18next + react-i18next
- **Storage**: IndexedDB for local data persistence
- **Testing**: Vitest with comprehensive test coverage
- **Code Quality**: ESLint + TypeScript strict mode

## 📦 Installation & Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/username/kolayekstre.git
cd kolayekstre

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler checks
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once

## 🏗️ Architecture

### Parser System
The application uses a modular parser architecture:

```
src/parsers/
├── BaseParser.ts          # Abstract base class for all parsers
├── BankStatementParser.ts # Main parser orchestrator
└── banks/
    ├── ZiraatParser.ts    # Ziraat Bank specific implementation
    └── EnparaParser.ts    # Enpara.com specific implementation
```

### Key Components
- **UploadWizard** - 3-step guided import process
- **TransactionTable** - Data grid with sorting/filtering
- **TransactionChart** - Monthly trend visualization
- **StatsPanel** - Financial summary dashboard
- **ThemeContext** - Dark/light theme management

## 🧪 Testing

The project maintains high test coverage with:
- **85+ Unit Tests** covering all parsers and utilities
- **Component Tests** for UI functionality
- **Real File Testing** using actual bank statement samples
- **TypeScript Integration** for type safety

Run tests with: `npm test`

## 📁 Supported File Formats

- **Excel Files**: `.xlsx`, `.xls`
- **Bank Formats**: 
  - Ziraat Bankası Excel exports
  - Enpara.com account movement reports

## 🔧 Configuration

### Adding New Banks
1. Create a new parser class extending `BaseParser`
2. Implement required methods for your bank's format
3. Register the parser in `BankStatementParser.ts`
4. Add translations and UI components

### Environment Variables
The app works entirely client-side with no backend configuration needed.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 🐛 Troubleshooting

### Common Issues
- **File not parsing**: Ensure the file is a genuine bank statement in supported format
- **Missing translations**: Check that your browser language is supported
- **Performance issues**: Clear browser data/cache if experiencing slowdowns

### Getting Help
- Check existing GitHub issues
- Create a new issue with file format examples (remove sensitive data)

## 📄 License

This project is licensed under a **Non-Commercial License** - see the [LICENSE](LICENSE) file for details.

**Key Points:**
- ✅ Free for personal, educational, and open-source use
- ❌ Commercial use requires explicit permission
- ✅ Modification and distribution allowed for non-commercial purposes
- ❌ No warranty provided

## 🙏 Acknowledgments

- Turkish banking community for format specifications
- Material-UI team for excellent React components
- SheetJS team for robust Excel file processing
- React and Vite communities for outstanding development tools

---

**Made with ❤️ for the Turkish banking community**
