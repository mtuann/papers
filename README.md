# Research Papers - MTUANN

A modern, responsive web application for browsing and searching research papers by topic. Built with Next.js and deployed via GitHub Actions to GitHub Pages.

![Star History Chart](https://api.star-history.com/svg?repos=mtuann/papers&type=Date)

## Features

- 🔍 **Global Search**: Case-insensitive search across all fields with debounced input for better performance
- 📊 **Advanced Filtering**: Column-specific filters for precise searches
- 🔄 **Sorting**: Sort by any column in ascending or descending order
- 📄 **Pagination**: Configurable entries per page (25, 50, 100, 200)
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🎨 **Modern UI**: Clean and intuitive interface with Tailwind CSS
- 📥 **Export to CSV**: Export filtered results to CSV format
- 🚀 **CI/CD**: Automatic deployment to GitHub Pages on every push to main

## Topics

The application currently supports the following research paper topics:

1. **Federated Learning** (`federated`)
   - Research papers on federated learning and distributed machine learning

2. **FL - Awesome (by Yuwen Yang)** (`fl_awe`)
   - Curated collection of federated learning papers by Yuwen Yang

3. **Backdoor Learning** (`backdoor_attack`)
   - Papers on backdoor attacks and defenses in machine learning

4. **Adversarial Learning (by Nicholas Carlini)** (`advex`)
   - Adversarial machine learning papers curated by Nicholas Carlini

5. **Machine Unlearning** (`unlearning`)
   - Research on machine unlearning and data removal from models

6. **Large Language Models** (`llm`)
   - Papers on large language models, transformers, and NLP

7. **Multimodal Machine Learning** (`multi_modal`)
   - Research on multimodal learning combining different data types

8. **Serverless Computing** (`serverless`)
   - Papers on serverless computing architectures and applications

## Data Sources

The research papers in this collection are sourced from the following academic databases and platforms:

- **IEEE Xplore**: IEEE Digital Library
- **ACM Digital Library**: Association for Computing Machinery
- **ScienceDirect**: Elsevier's scientific database
- **Springer**: Springer Nature publications
- **OpenReview**: Open peer review platform
- **arXiv**: Preprint repository
- **DBLP**: Computer Science Bibliography
- **OpenAlex**: Open scholarly metadata
- **Google Scholar**: Academic search engine

All data is collected and curated to provide a comprehensive view of research papers across these topics.

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

1. Place your CSV file in the `public/data/` directory with the naming pattern: `papers_<topic_name>.csv` or `paper_<topic_name>.csv`

2. Update the `getAvailableTopics()` function in `lib/utils.ts` to include your new topic:
```typescript
export function getAvailableTopics(): string[] {
  return [
    'advex',
    'backdoor_attack',
    'federated',
    'fl_awe',
    'llm',
    'multi_modal',
    'serverless',
    'unlearning',
    'your_new_topic'  // Add your new topic here
  ]
}
```

3. Add a display name mapping in the `formatTopicName()` function:
```typescript
export function formatTopicName(topic: string): string {
  const topicMap: Record<string, string> = {
    // ... existing topics ...
    'your_new_topic': 'Your New Topic Display Name',
  }
  // ...
}
```

4. Ensure your CSV file has the following columns:
   - `title`: Paper title
   - `author`: Author(s) name(s)
   - `venue_name`: Conference or journal name
   - `publish_date`: Publication date
   - `url`: Link to the paper
   - `code`: Link to code repository (if available)
   - `crawl_timestamp`: Timestamp when the data was collected

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

