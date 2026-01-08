# Research Papers - MTUANN

A modern, responsive web application for browsing and searching research papers by topic. Built with Next.js and deployed via GitHub Actions to GitHub Pages.

## Features

- 🔍 **Global Search**: Case-insensitive search across all fields
- 📊 **Advanced Filtering**: Column-specific filters for precise searches
- 🔄 **Sorting**: Sort by any column in ascending or descending order
- 📄 **Pagination**: Configurable entries per page (5, 10, 25, 50, 100)
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🎨 **Modern UI**: Clean and intuitive interface with Tailwind CSS
- 🚀 **CI/CD**: Automatic deployment to GitHub Pages on every push to main

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd mtuann.papers
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Adding New Topics

1. Place your CSV file in the `public/data/` directory with the naming pattern: `paper_<topic_name>.csv`

2. Update the `getAvailableTopics()` function in `lib/utils.ts` to include your new topic:
```typescript
export function getAvailableTopics(): string[] {
  return ['backdoor_attack', 'your_new_topic']
}
```

3. Ensure your CSV file has the following columns:
   - `title`
   - `author`
   - `venue_name`
   - `publish_date`
   - `url`
   - `code`
   - `crawl_timestamp`

## Project Structure

```
mtuann.papers/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Sidebar.tsx        # Left navigation sidebar
│   └── DataTable.tsx      # Main data table component
├── lib/                   # Utility functions
│   └── utils.ts           # CSV parsing and helper functions
├── public/                # Static assets
│   └── data/              # CSV data files
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions CI/CD
└── package.json
```

## Deployment

The project is automatically deployed to GitHub Pages using GitHub Actions. The workflow is triggered on:
- Push to `main` branch
- Manual workflow dispatch

To enable GitHub Pages deployment:

1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "GitHub Actions"

## Technologies Used

- **Next.js 14**: React framework with static export
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **PapaParse**: CSV parsing library
- **GitHub Actions**: CI/CD pipeline

## License

MIT License - feel free to use this project for your own research paper collections.

