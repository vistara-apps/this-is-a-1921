# Reddit Snippetter

> Capture, compile, and export Reddit insights effortlessly.

Reddit Snippetter is a powerful browser extension and web application that allows users to highlight relevant text across multiple Reddit threads and automatically compile it into structured documents with source links.

![Reddit Snippetter Demo](https://via.placeholder.com/800x400/667eea/ffffff?text=Reddit+Snippetter+Demo)

## 🚀 Features

### Core Features

- **🎯 Seamless Highlight-to-Save**: Instantly capture key Reddit text snippets without manual copy-pasting
- **🔗 Automated Source Linking**: Automatically links highlighted text back to its original Reddit thread and comment
- **📋 Structured Document Compilation**: Automatically compiles highlighted text into a clean, organized document
- **📤 Exportable Research Packages**: Export compiled notes in various formats (Markdown, PDF, CSV, JSON) with sources intact

### Advanced Features (Pro)

- **🤖 AI-Powered Summarization**: Generate intelligent summaries of your captured snippets using OpenAI
- **📊 Multiple Export Formats**: PDF, CSV, and JSON exports for different use cases
- **☁️ Cloud Sync**: Sync your snippets across devices (coming soon)
- **🔍 Advanced Search & Filtering**: Enhanced search capabilities with categorization
- **🔗 Shareable Links**: Create shareable links to your snippet collections

## 🛠️ Technology Stack

- **Frontend**: React 18, Tailwind CSS, Vite
- **State Management**: React Context API with useReducer
- **Browser Extension**: Chrome Extension Manifest V3
- **Export**: jsPDF, html2canvas for PDF generation
- **AI Integration**: OpenAI API for summarization
- **Storage**: Chrome Storage API, localStorage fallback
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📦 Installation

### As a Web Application

1. Clone the repository:
```bash
git clone https://github.com/vistara-apps/reddit-snippetter.git
cd reddit-snippetter
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### As a Browser Extension

1. Build the extension:
```bash
npm run build
```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right

4. Click "Load unpacked" and select the `dist` folder

5. The Reddit Snippetter extension should now appear in your extensions list

## 🎯 Usage

### Web Application Mode

1. **Reddit Simulator**: Practice highlighting text on a simulated Reddit interface
2. **Dashboard**: View, search, and manage your captured snippets
3. **Export**: Download your snippets in various formats

### Browser Extension Mode

1. **Install the extension** and visit any Reddit page
2. **Highlight text** on Reddit posts or comments
3. **Click the "Capture" button** that appears
4. **Access your snippets** by clicking the extension icon
5. **Export your research** in your preferred format

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
```

### API Keys

- **OpenAI API Key**: Required for AI summarization features (Pro only)
- **Reddit API**: Currently uses public JSON endpoints (no key required)

## 📋 API Documentation

### Core Data Models

#### Snippet
```typescript
interface Snippet {
  id: string;
  textContent: string;
  redditUrl: string;
  threadUrl: string;
  commentUrl?: string;
  timestamp: string;
  userId: string;
  context: {
    subreddit: string;
    author: string;
    title: string;
  };
  category?: string;
}
```

#### User
```typescript
interface User {
  userId: string;
  email: string;
  subscriptionStatus: 'free' | 'pro';
  createdAt: string;
  isAuthenticated: boolean;
}
```

### Export Formats

- **Markdown**: Human-readable format with source links
- **PDF**: Professional document format with formatting
- **CSV**: Spreadsheet-compatible format
- **JSON**: Machine-readable format for data portability

## 🎨 Design System

The application follows a consistent design system:

- **Colors**: 
  - Primary: `hsl(240, 80%, 50%)`
  - Accent: `hsl(170, 70%, 50%)`
  - Background: `hsl(230, 20%, 95%)`
  - Surface: `hsl(0, 0%, 100%)`

- **Typography**: System fonts with clear hierarchy
- **Spacing**: 8px base unit with lg(20px), md(12px), sm(8px)
- **Border Radius**: lg(16px), md(10px), sm(6px)
- **Animations**: Smooth transitions with cubic-bezier easing

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## 🚀 Deployment

### Web Application

Build for production:

```bash
npm run build
```

Deploy the `dist` folder to your preferred hosting service.

### Browser Extension

1. Build the extension:
```bash
npm run build
```

2. Package the `dist` folder as a ZIP file

3. Submit to the Chrome Web Store

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Reddit for providing accessible JSON endpoints
- OpenAI for AI summarization capabilities
- The React and Tailwind CSS communities
- All contributors and users who provide feedback

## 📞 Support

- **Documentation**: [docs.reddit-snippetter.com](https://docs.reddit-snippetter.com)
- **Issues**: [GitHub Issues](https://github.com/vistara-apps/reddit-snippetter/issues)
- **Email**: support@reddit-snippetter.com
- **Discord**: [Join our community](https://discord.gg/reddit-snippetter)

## 🗺️ Roadmap

- [ ] **Mobile App**: React Native mobile application
- [ ] **Firefox Extension**: Support for Firefox browser
- [ ] **Team Collaboration**: Share snippets with team members
- [ ] **Advanced AI Features**: Categorization, sentiment analysis
- [ ] **Integration APIs**: Notion, Obsidian, Roam Research
- [ ] **Bulk Operations**: Batch export, delete, categorize
- [ ] **Custom Templates**: User-defined export templates
- [ ] **Analytics Dashboard**: Usage statistics and insights

---

Made with ❤️ by the Reddit Snippetter team
