/**
 * Clipboard Utility
 * Enhanced clipboard operations for desktop and web environments
 */
class ClipboardUtil {
    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @param {string} format - Format type ('plain', 'html', 'rich')
     * @returns {Promise<boolean>} Success status
     */
    static async copyText(text, format = 'plain') {
        try {
            if (window.electronAPI) {
                // Desktop mode - use Electron clipboard
                return await window.electronAPI.copyToClipboard(text);
            } else {
                // Web mode - use Clipboard API
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                    return true;
                } else {
                    // Fallback for older browsers
                    return this.fallbackCopyText(text);
                }
            }
        } catch (error) {
            console.error('Failed to copy text to clipboard:', error);
            return false;
        }
    }

    /**
     * Copy rich content to clipboard (HTML + plain text)
     * @param {string} html - HTML content
     * @param {string} plainText - Plain text fallback
     * @returns {Promise<boolean>} Success status
     */
    static async copyRichContent(html, plainText) {
        try {
            if (window.electronAPI) {
                // For desktop, we'll copy as plain text for now
                // Future enhancement: support rich clipboard formats
                return await window.electronAPI.copyToClipboard(plainText);
            } else {
                // Web mode - use Clipboard API with multiple formats
                if (navigator.clipboard && window.isSecureContext) {
                    const clipboardItem = new ClipboardItem({
                        'text/html': new Blob([html], { type: 'text/html' }),
                        'text/plain': new Blob([plainText], { type: 'text/plain' })
                    });
                    await navigator.clipboard.write([clipboardItem]);
                    return true;
                } else {
                    // Fallback to plain text
                    return this.fallbackCopyText(plainText);
                }
            }
        } catch (error) {
            console.error('Failed to copy rich content to clipboard:', error);
            // Fallback to plain text
            return this.copyText(plainText);
        }
    }

    /**
     * Copy calculation results in multiple formats
     * @param {Object} calculationData - Calculation data
     * @returns {Promise<boolean>} Success status
     */
    static async copyCalculationResults(calculationData) {
        const plainText = this.formatCalculationAsText(calculationData);
        const htmlContent = this.formatCalculationAsHTML(calculationData);
        const csvContent = this.formatCalculationAsCSV(calculationData);

        try {
            if (window.electronAPI) {
                // Desktop: copy structured text
                const structuredText = this.formatCalculationStructured(calculationData);
                return await window.electronAPI.copyToClipboard(structuredText);
            } else {
                // Web: try rich content first, fallback to plain text
                return await this.copyRichContent(htmlContent, plainText);
            }
        } catch (error) {
            console.error('Failed to copy calculation results:', error);
            return false;
        }
    }

    /**
     * Copy article content
     * @param {Object} articleData - Article data
     * @returns {Promise<boolean>} Success status
     */
    static async copyArticleContent(articleData) {
        const plainText = this.formatArticleAsText(articleData);
        const htmlContent = this.formatArticleAsHTML(articleData);

        try {
            return await this.copyRichContent(htmlContent, plainText);
        } catch (error) {
            console.error('Failed to copy article content:', error);
            return false;
        }
    }

    /**
     * Copy search results
     * @param {Array} searchResults - Search results array
     * @param {string} query - Search query
     * @returns {Promise<boolean>} Success status
     */
    static async copySearchResults(searchResults, query) {
        const plainText = this.formatSearchResultsAsText(searchResults, query);
        const htmlContent = this.formatSearchResultsAsHTML(searchResults, query);

        try {
            return await this.copyRichContent(htmlContent, plainText);
        } catch (error) {
            console.error('Failed to copy search results:', error);
            return false;
        }
    }

    /**
     * Fallback copy method for older browsers
     * @param {string} text - Text to copy
     * @returns {boolean} Success status
     */
    static fallbackCopyText(text) {
        try {
            // Create temporary textarea
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            textarea.style.pointerEvents = 'none';
            
            document.body.appendChild(textarea);
            textarea.select();
            textarea.setSelectionRange(0, text.length);
            
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            
            return success;
        } catch (error) {
            console.error('Fallback copy failed:', error);
            return false;
        }
    }

    /**
     * Format calculation as plain text
     * @param {Object} data - Calculation data
     * @returns {string} Formatted text
     */
    static formatCalculationAsText(data) {
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount);
        };

        const formatDuration = (days) => {
            if (days >= 365) {
                const years = Math.floor(days / 365);
                const remainingDays = days % 365;
                if (remainingDays === 0) return `${years} year${years !== 1 ? 's' : ''}`;
                const months = Math.floor(remainingDays / 30);
                return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
            } else if (days >= 30) {
                const months = Math.floor(days / 30);
                return `${months} month${months !== 1 ? 's' : ''}`;
            } else {
                return `${days} day${days !== 1 ? 's' : ''}`;
            }
        };

        return `LOS SANTOS PENAL CODE - CALCULATION RESULTS

SUMMARY:
Total Fine: ${formatCurrency(data.totalFineMin)} - ${formatCurrency(data.totalFineMax)}
Total Jail Time: ${formatDuration(data.totalJailMinDays)} - ${formatDuration(data.totalJailMaxDays)}
Articles Applied: ${data.sections.length}

BREAKDOWN:
${data.breakdown.map((item, index) => `${index + 1}. ${item.code} - ${item.title}
   Fine: ${formatCurrency(item.fineMin)} - ${formatCurrency(item.fineMax)}
   Jail: ${formatDuration(item.jailMinDays)} - ${formatDuration(item.jailMaxDays)}`).join('\n\n')}

Generated: ${new Date().toLocaleString()}`;
    }

    /**
     * Format calculation as HTML
     * @param {Object} data - Calculation data
     * @returns {string} Formatted HTML
     */
    static formatCalculationAsHTML(data) {
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount);
        };

        const formatDuration = (days) => {
            if (days >= 365) {
                const years = Math.floor(days / 365);
                const remainingDays = days % 365;
                if (remainingDays === 0) return `${years} year${years !== 1 ? 's' : ''}`;
                const months = Math.floor(remainingDays / 30);
                return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
            } else if (days >= 30) {
                const months = Math.floor(days / 30);
                return `${months} month${months !== 1 ? 's' : ''}`;
            } else {
                return `${days} day${days !== 1 ? 's' : ''}`;
            }
        };

        return `<div style="font-family: Arial, sans-serif;">
<h2>LOS SANTOS PENAL CODE - CALCULATION RESULTS</h2>

<h3>SUMMARY:</h3>
<ul>
<li><strong>Total Fine:</strong> ${formatCurrency(data.totalFineMin)} - ${formatCurrency(data.totalFineMax)}</li>
<li><strong>Total Jail Time:</strong> ${formatDuration(data.totalJailMinDays)} - ${formatDuration(data.totalJailMaxDays)}</li>
<li><strong>Articles Applied:</strong> ${data.sections.length}</li>
</ul>

<h3>BREAKDOWN:</h3>
<ol>
${data.breakdown.map(item => `<li><strong>${item.code}</strong> - ${item.title}
<ul>
<li>Fine: ${formatCurrency(item.fineMin)} - ${formatCurrency(item.fineMax)}</li>
<li>Jail: ${formatDuration(item.jailMinDays)} - ${formatDuration(item.jailMaxDays)}</li>
</ul>
</li>`).join('')}
</ol>

<p><em>Generated: ${new Date().toLocaleString()}</em></p>
</div>`;
    }

    /**
     * Format calculation as CSV
     * @param {Object} data - Calculation data
     * @returns {string} Formatted CSV
     */
    static formatCalculationAsCSV(data) {
        const header = 'Code,Title,Fine Min,Fine Max,Jail Min Days,Jail Max Days\n';
        const rows = data.breakdown.map(item => 
            `"${item.code}","${item.title}",${item.fineMin},${item.fineMax},${item.jailMinDays},${item.jailMaxDays}`
        ).join('\n');

        return header + rows;
    }

    /**
     * Format calculation as structured text for desktop
     * @param {Object} data - Calculation data
     * @returns {string} Structured text
     */
    static formatCalculationStructured(data) {
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount);
        };

        const formatDuration = (days) => {
            if (days >= 365) {
                const years = Math.floor(days / 365);
                const remainingDays = days % 365;
                if (remainingDays === 0) return `${years} year${years !== 1 ? 's' : ''}`;
                const months = Math.floor(remainingDays / 30);
                return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
            } else if (days >= 30) {
                const months = Math.floor(days / 30);
                return `${months} month${months !== 1 ? 's' : ''}`;
            } else {
                return `${days} day${days !== 1 ? 's' : ''}`;
            }
        };

        // Structured format for easy pasting into documents
        return `LOS SANTOS PENAL CODE - CALCULATION RESULTS
${'='.repeat(50)}

EXECUTIVE SUMMARY
${'-'.repeat(20)}
Total Financial Penalty: ${formatCurrency(data.totalFineMin)} to ${formatCurrency(data.totalFineMax)}
Total Incarceration Period: ${formatDuration(data.totalJailMinDays)} to ${formatDuration(data.totalJailMaxDays)}
Number of Violations: ${data.sections.length}

DETAILED BREAKDOWN
${'-'.repeat(20)}
${data.breakdown.map((item, index) => {
    return `${(index + 1).toString().padStart(2, '0')}. ${item.code.padEnd(10)} ${item.title}
    Fine Range: ${formatCurrency(item.fineMin).padEnd(12)} to ${formatCurrency(item.fineMax)}
    Jail Range: ${formatDuration(item.jailMinDays).padEnd(15)} to ${formatDuration(item.jailMaxDays)}
    Reference: ${item.articleTitle}`;
}).join('\n\n')}

REPORT METADATA
${'-'.repeat(20)}
Generated: ${new Date().toLocaleString()}
Calculator Version: 1.0.0
Source: Los Santos Penal Code Desktop Application

DISCLAIMER: This calculation is for informational purposes only.
Actual sentencing may vary based on circumstances and judicial discretion.`;
    }

    /**
     * Format article as plain text
     * @param {Object} data - Article data
     * @returns {string} Formatted text
     */
    static formatArticleAsText(data) {
        return `LOS SANTOS PENAL CODE - ARTICLE ${data.code}

${data.title}
${data.articleTitle}

DESCRIPTION:
${data.text}

${data.punishment ? `PUNISHMENT: ${data.punishment}` : ''}
${data.fine ? `FINE: ${data.fine}` : ''}

Generated: ${new Date().toLocaleString()}`;
    }

    /**
     * Format article as HTML
     * @param {Object} data - Article data
     * @returns {string} Formatted HTML
     */
    static formatArticleAsHTML(data) {
        return `<div style="font-family: Arial, sans-serif;">
<h2>LOS SANTOS PENAL CODE - ARTICLE ${data.code}</h2>
<h3>${data.title}</h3>
<p><em>${data.articleTitle}</em></p>

<h4>DESCRIPTION:</h4>
<p>${data.text}</p>

${data.punishment ? `<p><strong>PUNISHMENT:</strong> ${data.punishment}</p>` : ''}
${data.fine ? `<p><strong>FINE:</strong> ${data.fine}</p>` : ''}

<p><em>Generated: ${new Date().toLocaleString()}</em></p>
</div>`;
    }

    /**
     * Format search results as plain text
     * @param {Array} results - Search results
     * @param {string} query - Search query
     * @returns {string} Formatted text
     */
    static formatSearchResultsAsText(results, query) {
        return `LOS SANTOS PENAL CODE - SEARCH RESULTS

Query: "${query}"
Results: ${results.length} articles found

${results.map((result, index) => `${index + 1}. ${result.code} - ${result.title}
${result.text}
${result.punishment ? `Punishment: ${result.punishment}` : ''}
${result.fine ? `Fine: ${result.fine}` : ''}`).join('\n\n')}

Generated: ${new Date().toLocaleString()}`;
    }

    /**
     * Format search results as HTML
     * @param {Array} results - Search results
     * @param {string} query - Search query
     * @returns {string} Formatted HTML
     */
    static formatSearchResultsAsHTML(results, query) {
        return `<div style="font-family: Arial, sans-serif;">
<h2>LOS SANTOS PENAL CODE - SEARCH RESULTS</h2>
<p><strong>Query:</strong> "${query}"</p>
<p><strong>Results:</strong> ${results.length} articles found</p>

${results.map((result, index) => `<div style="margin: 20px 0; padding: 10px; border: 1px solid #ccc;">
<h3>${index + 1}. ${result.code} - ${result.title}</h3>
<p>${result.text}</p>
${result.punishment ? `<p><strong>Punishment:</strong> ${result.punishment}</p>` : ''}
${result.fine ? `<p><strong>Fine:</strong> ${result.fine}</p>` : ''}
</div>`).join('')}

<p><em>Generated: ${new Date().toLocaleString()}</em></p>
</div>`;
    }

    /**
     * Show copy success notification
     * @param {string} message - Success message
     */
    static showCopySuccess(message = 'Copied to clipboard!') {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
        });

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Show copy error notification
     * @param {string} message - Error message
     */
    static showCopyError(message = 'Failed to copy to clipboard') {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
        });

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.ClipboardUtil = ClipboardUtil;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClipboardUtil;
}
