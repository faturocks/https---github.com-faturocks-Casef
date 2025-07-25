/**
 * Report Templates for PDF Export
 * Provides various templates for different types of reports
 */
class ReportTemplates {
    /**
     * Generate calculation report template
     * @param {Object} calculationData - Calculation data
     * @returns {Object} Template data
     */
    static generateCalculationReport(calculationData) {
        const timestamp = new Date().toLocaleString();
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
                if (remainingDays === 0) {
                    return `${years} year${years !== 1 ? 's' : ''}`;
                } else {
                    const months = Math.floor(remainingDays / 30);
                    return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
                }
            } else if (days >= 30) {
                const months = Math.floor(days / 30);
                return `${months} month${months !== 1 ? 's' : ''}`;
            } else {
                return `${days} day${days !== 1 ? 's' : ''}`;
            }
        };

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Los Santos Penal Code - Calculation Report</title>
                <style>
                    ${this.getCalculationReportStyles()}
                </style>
            </head>
            <body>
                <div class="report-container">
                    <div class="header">
                        <div class="department-logo">
                            <h1>LOS SANTOS POLICE DEPARTMENT</h1>
                            <h2>PENALTY CALCULATION REPORT</h2>
                        </div>
                        <div class="report-info">
                            <table>
                                <tr><td><strong>Generated:</strong></td><td>${timestamp}</td></tr>
                                <tr><td><strong>Report ID:</strong></td><td>CALC-${Date.now()}</td></tr>
                                <tr><td><strong>Articles:</strong></td><td>${calculationData.sections.length}</td></tr>
                            </table>
                        </div>
                    </div>

                    <div class="summary-section">
                        <h3>EXECUTIVE SUMMARY</h3>
                        <div class="summary-grid">
                            <div class="summary-card fine-card">
                                <h4>TOTAL FINANCIAL PENALTY</h4>
                                <div class="amount-range">
                                    <span class="min-amount">${formatCurrency(calculationData.totalFineMin)}</span>
                                    <span class="range-separator">to</span>
                                    <span class="max-amount">${formatCurrency(calculationData.totalFineMax)}</span>
                                </div>
                            </div>
                            <div class="summary-card jail-card">
                                <h4>TOTAL INCARCERATION PERIOD</h4>
                                <div class="amount-range">
                                    <span class="min-amount">${formatDuration(calculationData.totalJailMinDays)}</span>
                                    <span class="range-separator">to</span>
                                    <span class="max-amount">${formatDuration(calculationData.totalJailMaxDays)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="breakdown-section">
                        <h3>DETAILED BREAKDOWN BY PENAL CODE SECTION</h3>
                        <table class="breakdown-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Offense Description</th>
                                    <th>Fine Range</th>
                                    <th>Jail Time Range</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${calculationData.breakdown.map((item, index) => `
                                    <tr class="${index % 2 === 0 ? 'even-row' : 'odd-row'}">
                                        <td class="code-cell">${item.code}</td>
                                        <td class="description-cell">
                                            <strong>${item.title}</strong>
                                            <br><small class="article-ref">${item.articleTitle}</small>
                                        </td>
                                        <td class="fine-cell">${formatCurrency(item.fineMin)} - ${formatCurrency(item.fineMax)}</td>
                                        <td class="jail-cell">${formatDuration(item.jailMinDays)} - ${formatDuration(item.jailMaxDays)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div class="legal-disclaimer">
                        <h3>LEGAL DISCLAIMER</h3>
                        <div class="disclaimer-content">
                            <p><strong>IMPORTANT NOTICE:</strong> This calculation is based on the statutory penalties outlined in the Los Santos Penal Code. Actual sentencing may vary significantly based on the following factors:</p>
                            <ul>
                                <li>Specific circumstances and facts of the case</li>
                                <li>Judicial discretion and established sentencing guidelines</li>
                                <li>Defendant's prior criminal history and background</li>
                                <li>Presence of mitigating or aggravating circumstances</li>
                                <li>Plea agreements, cooperation, or other legal considerations</li>
                                <li>Alternative sentencing options available under the law</li>
                            </ul>
                            <p class="warning"><strong>THIS DOCUMENT IS FOR INFORMATIONAL PURPOSES ONLY AND DOES NOT CONSTITUTE LEGAL ADVICE. CONSULT WITH A QUALIFIED ATTORNEY FOR SPECIFIC LEGAL GUIDANCE.</strong></p>
                        </div>
                    </div>

                    <div class="signature-section">
                        <div class="signature-line">
                            <div class="signature-box">
                                <div class="signature-space"></div>
                                <div class="signature-label">Generated by LSPD Penal Code Calculator</div>
                            </div>
                            <div class="date-box">
                                <div class="date-space">${new Date().toLocaleDateString()}</div>
                                <div class="date-label">Date</div>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        const textContent = this.generateCalculationTextReport(calculationData);

        return {
            type: 'calculation',
            title: 'Penalty Calculation Report',
            html: htmlContent,
            text: textContent,
            data: calculationData
        };
    }

    /**
     * Generate article export template
     * @param {Object} articleData - Article data
     * @returns {Object} Template data
     */
    static generateArticleReport(articleData) {
        const timestamp = new Date().toLocaleString();

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Los Santos Penal Code - Article ${articleData.code}</title>
                <style>
                    ${this.getArticleReportStyles()}
                </style>
            </head>
            <body>
                <div class="report-container">
                    <div class="header">
                        <h1>LOS SANTOS PENAL CODE</h1>
                        <h2>ARTICLE DOCUMENTATION</h2>
                        <div class="article-meta">
                            <span>Article ${articleData.code}</span> | <span>Generated: ${timestamp}</span>
                        </div>
                    </div>

                    <div class="article-content">
                        <div class="article-header">
                            <h3>${articleData.code} - ${articleData.title}</h3>
                            <div class="chapter-info">${articleData.articleTitle}</div>
                        </div>

                        <div class="article-text">
                            <h4>STATUTORY TEXT</h4>
                            <div class="text-content">${articleData.text}</div>
                        </div>

                        ${articleData.punishment || articleData.fine ? `
                            <div class="penalties-section">
                                <h4>PRESCRIBED PENALTIES</h4>
                                <table class="penalties-table">
                                    ${articleData.punishment ? `<tr><td class="penalty-type">Imprisonment:</td><td class="penalty-value">${articleData.punishment}</td></tr>` : ''}
                                    ${articleData.fine ? `<tr><td class="penalty-type">Fine:</td><td class="penalty-value">${articleData.fine}</td></tr>` : ''}
                                </table>
                            </div>
                        ` : ''}

                        ${articleData.definitions && articleData.definitions.length > 0 ? `
                            <div class="definitions-section">
                                <h4>LEGAL DEFINITIONS</h4>
                                <div class="definitions-list">
                                    ${articleData.definitions.map(def => `
                                        <div class="definition-item">
                                            <h5>${def.term}</h5>
                                            <p>${def.definition}</p>
                                            ${def.citation ? `<cite>Reference: ${def.citation}</cite>` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <div class="footer">
                        <p>This document is an official extract from the Los Santos Penal Code.</p>
                        <p>For the most current version, please consult the official legal database.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return {
            type: 'article',
            title: `Penal Code Article ${articleData.code}`,
            html: htmlContent,
            text: this.generateArticleTextReport(articleData),
            data: articleData
        };
    }

    /**
     * Generate search results template
     * @param {Object} searchData - Search results data
     * @returns {Object} Template data
     */
    static generateSearchResultsReport(searchData) {
        const timestamp = new Date().toLocaleString();

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Los Santos Penal Code - Search Results</title>
                <style>
                    ${this.getSearchReportStyles()}
                </style>
            </head>
            <body>
                <div class="report-container">
                    <div class="header">
                        <h1>LOS SANTOS PENAL CODE</h1>
                        <h2>SEARCH RESULTS REPORT</h2>
                    </div>

                    <div class="search-summary">
                        <h3>SEARCH PARAMETERS</h3>
                        <table class="search-info">
                            <tr><td><strong>Query:</strong></td><td>"${searchData.query}"</td></tr>
                            <tr><td><strong>Results Found:</strong></td><td>${searchData.results.length}</td></tr>
                            <tr><td><strong>Search Scope:</strong></td><td>${searchData.searchScope}</td></tr>
                            <tr><td><strong>Generated:</strong></td><td>${timestamp}</td></tr>
                        </table>
                    </div>

                    <div class="results-section">
                        <h3>MATCHING ARTICLES</h3>
                        ${searchData.results.map((result, index) => `
                            <div class="result-item">
                                <div class="result-header">
                                    <h4>${result.code} - ${result.title}</h4>
                                    <div class="result-meta">${result.articleTitle}</div>
                                </div>
                                <div class="result-content">${result.text}</div>
                                ${result.punishment || result.fine ? `
                                    <div class="result-penalties">
                                        ${result.punishment ? `<span class="penalty"><strong>Punishment:</strong> ${result.punishment}</span>` : ''}
                                        ${result.fine ? `<span class="penalty"><strong>Fine:</strong> ${result.fine}</span>` : ''}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </body>
            </html>
        `;

        return {
            type: 'search_results',
            title: 'Search Results Report',
            html: htmlContent,
            text: this.generateSearchTextReport(searchData),
            data: searchData
        };
    }

    /**
     * Generate bookmark collection template
     * @param {Array} bookmarks - Bookmarks data
     * @returns {Object} Template data
     */
    static generateBookmarksReport(bookmarks) {
        const timestamp = new Date().toLocaleString();

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Los Santos Penal Code - Bookmarks Collection</title>
                <style>
                    ${this.getBookmarksReportStyles()}
                </style>
            </head>
            <body>
                <div class="report-container">
                    <div class="header">
                        <h1>LOS SANTOS PENAL CODE</h1>
                        <h2>BOOKMARKS COLLECTION</h2>
                        <div class="collection-info">
                            <span>${bookmarks.length} Bookmarked Articles</span> | <span>Generated: ${timestamp}</span>
                        </div>
                    </div>

                    <div class="bookmarks-section">
                        ${bookmarks.map((bookmark, index) => `
                            <div class="bookmark-item">
                                <div class="bookmark-header">
                                    <h3>${bookmark.title}</h3>
                                    <div class="bookmark-date">Added: ${new Date(bookmark.created_at).toLocaleDateString()}</div>
                                </div>
                                ${bookmark.notes ? `
                                    <div class="bookmark-notes">
                                        <h4>Notes:</h4>
                                        <p>${bookmark.notes}</p>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </body>
            </html>
        `;

        return {
            type: 'bookmarks',
            title: 'Bookmarks Collection',
            html: htmlContent,
            text: this.generateBookmarksTextReport(bookmarks),
            data: bookmarks
        };
    }

    // Text report generators
    static generateCalculationTextReport(data) {
        const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
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

        return `
LOS SANTOS POLICE DEPARTMENT
PENALTY CALCULATION REPORT

Generated: ${new Date().toLocaleString()}
Report ID: CALC-${Date.now()}

EXECUTIVE SUMMARY:
=================
Total Financial Penalty: ${formatCurrency(data.totalFineMin)} to ${formatCurrency(data.totalFineMax)}
Total Incarceration Period: ${formatDuration(data.totalJailMinDays)} to ${formatDuration(data.totalJailMaxDays)}
Articles Applied: ${data.sections.length}

DETAILED BREAKDOWN:
==================
${data.breakdown.map((item, index) => `
${index + 1}. ${item.code} - ${item.title}
   Chapter: ${item.articleTitle}
   Fine: ${formatCurrency(item.fineMin)} - ${formatCurrency(item.fineMax)}
   Jail: ${formatDuration(item.jailMinDays)} - ${formatDuration(item.jailMaxDays)}
`).join('')}

LEGAL DISCLAIMER:
================
This calculation is based on statutory penalties in the Los Santos Penal Code.
Actual sentencing may vary based on case circumstances, judicial discretion,
criminal history, and other legal factors.

THIS DOCUMENT IS FOR INFORMATIONAL PURPOSES ONLY AND DOES NOT CONSTITUTE LEGAL ADVICE.
        `.trim();
    }

    static generateArticleTextReport(data) {
        return `
LOS SANTOS PENAL CODE
ARTICLE DOCUMENTATION

Article: ${data.code} - ${data.title}
Chapter: ${data.articleTitle}
Generated: ${new Date().toLocaleString()}

STATUTORY TEXT:
==============
${data.text}

PRESCRIBED PENALTIES:
====================
${data.punishment ? `Imprisonment: ${data.punishment}` : ''}
${data.fine ? `Fine: ${data.fine}` : ''}

${data.definitions && data.definitions.length > 0 ? `
LEGAL DEFINITIONS:
=================
${data.definitions.map(def => `
${def.term}:
${def.definition}
${def.citation ? `Reference: ${def.citation}` : ''}
`).join('')}` : ''}

This document is an official extract from the Los Santos Penal Code.
        `.trim();
    }

    static generateSearchTextReport(data) {
        return `
LOS SANTOS PENAL CODE
SEARCH RESULTS REPORT

Search Query: "${data.query}"
Results Found: ${data.results.length}
Search Scope: ${data.searchScope}
Generated: ${new Date().toLocaleString()}

MATCHING ARTICLES:
=================
${data.results.map((result, index) => `
${index + 1}. ${result.code} - ${result.title}
   Chapter: ${result.articleTitle}
   
   ${result.text}
   
   ${result.punishment ? `Punishment: ${result.punishment}` : ''}
   ${result.fine ? `Fine: ${result.fine}` : ''}
   
   ---
`).join('')}
        `.trim();
    }

    static generateBookmarksTextReport(bookmarks) {
        return `
LOS SANTOS PENAL CODE
BOOKMARKS COLLECTION

Total Bookmarks: ${bookmarks.length}
Generated: ${new Date().toLocaleString()}

BOOKMARKED ARTICLES:
===================
${bookmarks.map((bookmark, index) => `
${index + 1}. ${bookmark.title}
   Added: ${new Date(bookmark.created_at).toLocaleDateString()}
   ${bookmark.notes ? `Notes: ${bookmark.notes}` : ''}
   
`).join('')}
        `.trim();
    }

    // CSS Styles for different report types
    static getCalculationReportStyles() {
        return `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #000; }
            .report-container { max-width: 100%; margin: 0; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { font-size: 18pt; font-weight: bold; margin-bottom: 5px; }
            .header h2 { font-size: 14pt; margin-bottom: 15px; }
            .report-info table { margin: 0 auto; border-collapse: collapse; }
            .report-info td { padding: 2px 10px; border: none; }
            .summary-section { margin: 30px 0; }
            .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .summary-card { border: 2px solid #000; padding: 15px; text-align: center; }
            .summary-card h4 { font-size: 12pt; margin-bottom: 10px; }
            .amount-range { font-size: 14pt; font-weight: bold; }
            .range-separator { font-size: 10pt; margin: 0 5px; }
            .breakdown-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .breakdown-table th, .breakdown-table td { border: 1px solid #000; padding: 8px; text-align: left; }
            .breakdown-table th { background-color: #f0f0f0; font-weight: bold; }
            .code-cell { font-weight: bold; text-align: center; width: 15%; }
            .description-cell { width: 40%; }
            .fine-cell, .jail-cell { text-align: center; width: 22.5%; }
            .even-row { background-color: #f9f9f9; }
            .legal-disclaimer { margin: 40px 0; padding: 20px; border: 2px solid #000; background-color: #fffacd; }
            .legal-disclaimer h3 { margin-bottom: 15px; text-align: center; }
            .disclaimer-content ul { margin: 10px 0 10px 20px; }
            .warning { font-weight: bold; margin-top: 15px; text-align: center; }
            .signature-section { margin-top: 50px; }
            .signature-line { display: flex; justify-content: space-between; align-items: end; }
            .signature-box, .date-box { text-align: center; }
            .signature-space, .date-space { border-bottom: 1px solid #000; width: 200px; height: 30px; margin-bottom: 5px; }
            .date-space { width: 100px; }
        `;
    }

    static getArticleReportStyles() {
        return `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #000; }
            .report-container { max-width: 100%; margin: 0; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { font-size: 18pt; font-weight: bold; margin-bottom: 5px; }
            .header h2 { font-size: 14pt; margin-bottom: 10px; }
            .article-meta { font-size: 10pt; color: #666; }
            .article-header { text-align: center; margin: 30px 0; }
            .article-header h3 { font-size: 16pt; font-weight: bold; }
            .chapter-info { font-style: italic; margin-top: 5px; }
            .article-text { margin: 30px 0; }
            .article-text h4 { font-size: 14pt; margin-bottom: 10px; text-decoration: underline; }
            .text-content { text-align: justify; text-indent: 20px; margin: 15px 0; }
            .penalties-section { margin: 30px 0; }
            .penalties-table { border-collapse: collapse; width: 100%; }
            .penalties-table td { border: 1px solid #000; padding: 8px; }
            .penalty-type { font-weight: bold; width: 25%; }
            .definitions-section { margin: 30px 0; }
            .definition-item { margin: 15px 0; padding: 10px; border: 1px solid #ccc; background-color: #f9f9f9; }
            .definition-item h5 { text-decoration: underline; margin-bottom: 5px; }
            .footer { margin-top: 50px; text-align: center; font-size: 10pt; color: #666; border-top: 1px solid #000; padding-top: 20px; }
        `;
    }

    static getSearchReportStyles() {
        return `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #000; }
            .report-container { max-width: 100%; margin: 0; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { font-size: 18pt; font-weight: bold; margin-bottom: 5px; }
            .header h2 { font-size: 14pt; }
            .search-summary { margin: 30px 0; }
            .search-info { border-collapse: collapse; width: 100%; }
            .search-info td { border: 1px solid #000; padding: 8px; }
            .result-item { margin: 30px 0; padding: 20px; border: 1px solid #000; }
            .result-header h4 { font-size: 14pt; margin-bottom: 5px; }
            .result-meta { font-style: italic; color: #666; }
            .result-content { margin: 15px 0; text-align: justify; }
            .result-penalties { margin-top: 10px; }
            .penalty { display: block; margin: 2px 0; }
        `;
    }

    static getBookmarksReportStyles() {
        return `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #000; }
            .report-container { max-width: 100%; margin: 0; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { font-size: 18pt; font-weight: bold; margin-bottom: 5px; }
            .header h2 { font-size: 14pt; margin-bottom: 10px; }
            .collection-info { font-size: 10pt; color: #666; }
            .bookmark-item { margin: 20px 0; padding: 15px; border: 1px solid #000; }
            .bookmark-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
            .bookmark-header h3 { font-size: 14pt; }
            .bookmark-date { font-size: 10pt; color: #666; }
            .bookmark-notes h4 { font-size: 12pt; margin-bottom: 5px; }
        `;
    }
}

module.exports = ReportTemplates;
