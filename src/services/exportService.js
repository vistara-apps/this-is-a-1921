import jsPDF from 'jspdf';
import { format } from 'date-fns';

export class ExportService {
  /**
   * Generate and download Markdown file
   */
  static exportMarkdown(snippets, options = {}) {
    const {
      includeMetadata = true,
      groupBySubreddit = false,
      includeTimestamps = true
    } = options;

    let markdown = '# Reddit Snippets Collection\n\n';
    
    if (includeMetadata) {
      markdown += `**Generated:** ${format(new Date(), 'PPP')}\n`;
      markdown += `**Total Snippets:** ${snippets.length}\n\n`;
    }

    if (groupBySubreddit) {
      const groupedSnippets = this.groupSnippetsBySubreddit(snippets);
      
      Object.entries(groupedSnippets).forEach(([subreddit, subredditSnippets]) => {
        markdown += `## ${subreddit}\n\n`;
        subredditSnippets.forEach((snippet, index) => {
          markdown += this.formatSnippetMarkdown(snippet, index + 1, includeTimestamps);
        });
        markdown += '\n---\n\n';
      });
    } else {
      snippets.forEach((snippet, index) => {
        markdown += this.formatSnippetMarkdown(snippet, index + 1, includeTimestamps);
      });
    }

    this.downloadFile(markdown, 'reddit-snippets.md', 'text/markdown');
  }

  /**
   * Generate and download PDF file
   */
  static exportPDF(snippets, options = {}) {
    const {
      includeMetadata = true,
      groupBySubreddit = false,
      includeTimestamps = true,
      fontSize = 12,
      margin = 20
    } = options;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const maxLineWidth = pageWidth - (margin * 2);
    
    let yPosition = margin;

    // Title
    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    pdf.text('Reddit Snippets Collection', margin, yPosition);
    yPosition += 15;

    // Metadata
    if (includeMetadata) {
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Generated: ${format(new Date(), 'PPP')}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Total Snippets: ${snippets.length}`, margin, yPosition);
      yPosition += 15;
    }

    // Process snippets
    if (groupBySubreddit) {
      const groupedSnippets = this.groupSnippetsBySubreddit(snippets);
      
      Object.entries(groupedSnippets).forEach(([subreddit, subredditSnippets]) => {
        yPosition = this.addSubredditSection(pdf, subreddit, subredditSnippets, yPosition, margin, maxLineWidth, fontSize, includeTimestamps);
      });
    } else {
      snippets.forEach((snippet, index) => {
        yPosition = this.addSnippetToPDF(pdf, snippet, index + 1, yPosition, margin, maxLineWidth, fontSize, includeTimestamps);
      });
    }

    pdf.save('reddit-snippets.pdf');
  }

  /**
   * Export as JSON for data portability
   */
  static exportJSON(snippets, options = {}) {
    const {
      includeMetadata = true,
      prettyPrint = true
    } = options;

    const exportData = {
      ...(includeMetadata && {
        metadata: {
          exportDate: new Date().toISOString(),
          totalSnippets: snippets.length,
          version: '1.0.0'
        }
      }),
      snippets: snippets.map(snippet => ({
        id: snippet.id,
        textContent: snippet.textContent,
        source: {
          redditUrl: snippet.redditUrl,
          threadUrl: snippet.threadUrl,
          commentUrl: snippet.commentUrl,
          subreddit: snippet.context?.subreddit,
          author: snippet.context?.author,
          title: snippet.context?.title
        },
        timestamp: snippet.timestamp,
        userId: snippet.userId
      }))
    };

    const jsonString = prettyPrint 
      ? JSON.stringify(exportData, null, 2)
      : JSON.stringify(exportData);

    this.downloadFile(jsonString, 'reddit-snippets.json', 'application/json');
  }

  /**
   * Export as CSV for spreadsheet applications
   */
  static exportCSV(snippets) {
    const headers = [
      'ID',
      'Content',
      'Subreddit',
      'Author',
      'Thread Title',
      'Thread URL',
      'Comment URL',
      'Timestamp',
      'Date'
    ];

    const csvRows = [
      headers.join(','),
      ...snippets.map(snippet => [
        snippet.id,
        `"${snippet.textContent.replace(/"/g, '""')}"`,
        snippet.context?.subreddit || '',
        snippet.context?.author || '',
        `"${(snippet.context?.title || '').replace(/"/g, '""')}"`,
        snippet.threadUrl || '',
        snippet.commentUrl || '',
        snippet.timestamp,
        format(new Date(snippet.timestamp), 'yyyy-MM-dd HH:mm:ss')
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    this.downloadFile(csvContent, 'reddit-snippets.csv', 'text/csv');
  }

  /**
   * Create shareable link (mock implementation)
   */
  static async createShareableLink(snippets, options = {}) {
    const {
      expiresIn = '7d',
      password = null,
      allowDownload = true
    } = options;

    // Mock implementation - in real app, this would upload to your backend
    const shareData = {
      id: 'share_' + Date.now(),
      snippets: snippets.map(s => ({
        textContent: s.textContent,
        source: s.context?.subreddit,
        author: s.context?.author,
        timestamp: s.timestamp
      })),
      options: {
        expiresIn,
        password: password ? 'protected' : null,
        allowDownload
      },
      createdAt: new Date().toISOString()
    };

    // Store in localStorage for demo
    localStorage.setItem(`share_${shareData.id}`, JSON.stringify(shareData));

    return {
      shareUrl: `${window.location.origin}/share/${shareData.id}`,
      shareId: shareData.id,
      expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString()
    };
  }

  // Helper methods
  static groupSnippetsBySubreddit(snippets) {
    return snippets.reduce((groups, snippet) => {
      const subreddit = snippet.context?.subreddit || 'Unknown';
      if (!groups[subreddit]) {
        groups[subreddit] = [];
      }
      groups[subreddit].push(snippet);
      return groups;
    }, {});
  }

  static formatSnippetMarkdown(snippet, index, includeTimestamps) {
    let markdown = `### Snippet ${index}\n\n`;
    
    if (snippet.context?.subreddit) {
      markdown += `**Subreddit:** ${snippet.context.subreddit}\n`;
    }
    
    if (snippet.context?.author) {
      markdown += `**Author:** ${snippet.context.author}\n`;
    }
    
    if (includeTimestamps) {
      markdown += `**Date:** ${format(new Date(snippet.timestamp), 'PPP')}\n`;
    }
    
    markdown += '\n';
    markdown += `> ${snippet.textContent}\n\n`;
    
    if (snippet.threadUrl) {
      markdown += `[View Source](${snippet.threadUrl})\n\n`;
    }
    
    markdown += '---\n\n';
    
    return markdown;
  }

  static addSubredditSection(pdf, subreddit, snippets, yPosition, margin, maxLineWidth, fontSize, includeTimestamps) {
    // Check if we need a new page
    if (yPosition > pdf.internal.pageSize.getHeight() - 50) {
      pdf.addPage();
      yPosition = margin;
    }

    // Subreddit header
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text(subreddit, margin, yPosition);
    yPosition += 12;

    // Add snippets
    snippets.forEach((snippet, index) => {
      yPosition = this.addSnippetToPDF(pdf, snippet, index + 1, yPosition, margin, maxLineWidth, fontSize, includeTimestamps);
    });

    return yPosition + 10;
  }

  static addSnippetToPDF(pdf, snippet, index, yPosition, margin, maxLineWidth, fontSize, includeTimestamps) {
    const lineHeight = fontSize * 0.4;

    // Check if we need a new page
    if (yPosition > pdf.internal.pageSize.getHeight() - 80) {
      pdf.addPage();
      yPosition = margin;
    }

    // Snippet header
    pdf.setFontSize(fontSize + 2);
    pdf.setFont(undefined, 'bold');
    pdf.text(`Snippet ${index}`, margin, yPosition);
    yPosition += lineHeight + 5;

    // Metadata
    pdf.setFontSize(fontSize - 2);
    pdf.setFont(undefined, 'normal');
    
    if (snippet.context?.subreddit) {
      pdf.text(`Subreddit: ${snippet.context.subreddit}`, margin, yPosition);
      yPosition += lineHeight;
    }
    
    if (snippet.context?.author) {
      pdf.text(`Author: ${snippet.context.author}`, margin, yPosition);
      yPosition += lineHeight;
    }
    
    if (includeTimestamps) {
      pdf.text(`Date: ${format(new Date(snippet.timestamp), 'PPP')}`, margin, yPosition);
      yPosition += lineHeight;
    }

    yPosition += 5;

    // Content
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(snippet.textContent, maxLineWidth);
    lines.forEach(line => {
      if (yPosition > pdf.internal.pageSize.getHeight() - 30) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += lineHeight;
    });

    // Source link
    if (snippet.threadUrl) {
      yPosition += 3;
      pdf.setFontSize(fontSize - 2);
      pdf.setTextColor(0, 0, 255);
      pdf.text('View Source', margin, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += lineHeight;
    }

    return yPosition + 10;
  }

  static downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
