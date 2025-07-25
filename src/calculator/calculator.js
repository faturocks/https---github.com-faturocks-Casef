/**
 * Fine & Jail Calculator
 * Advanced calculator for Los Santos Penal Code punishments
 */
class PenalCodeCalculator {
    constructor() {
        this.selectedSections = new Map(); // Map of section ID to section data
        this.calculations = [];
        this.currentCalculation = null;
        this.isVisible = false;
        
        this.init();
    }

    init() {
        this.createCalculatorUI();
        this.setupEventListeners();
        this.loadCalculationHistory();
        
        // Make globally available
        window.penalCodeCalculator = this;
        
        console.log('Penal Code Calculator initialized');
    }

    createCalculatorUI() {
        // Create calculator modal
        const calculatorHTML = `
            <div id="calculator-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div class="bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                        <!-- Header -->
                        <div class="bg-gray-800 px-6 py-4 flex items-center justify-between">
                            <h2 class="text-xl font-bold text-white flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Fine & Jail Calculator
                            </h2>
                            <button id="close-calculator" class="text-gray-400 hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div class="flex h-[calc(90vh-4rem)]">
                            <!-- Left Panel: Article Selection -->
                            <div class="w-1/3 bg-gray-800 border-r border-gray-700 flex flex-col">
                                <div class="p-4 border-b border-gray-700">
                                    <h3 class="font-semibold text-white mb-3">Select Articles</h3>
                                    <input type="text" id="calculator-search" placeholder="Search articles..." 
                                           class="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-sky-400 focus:outline-none">
                                </div>
                                <div id="calculator-articles" class="flex-1 overflow-y-auto p-4 space-y-2">
                                    <!-- Articles will be loaded here -->
                                </div>
                            </div>

                            <!-- Center Panel: Selected Articles & Calculation -->
                            <div class="w-1/3 bg-gray-900 flex flex-col">
                                <div class="p-4 border-b border-gray-700">
                                    <h3 class="font-semibold text-white mb-3">Selected Articles</h3>
                                    <div class="flex gap-2">
                                        <button id="calculate-totals" class="flex-1 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded font-medium">
                                            Calculate
                                        </button>
                                        <button id="clear-selection" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium">
                                            Clear
                                        </button>
                                    </div>
                                </div>
                                <div id="selected-articles" class="flex-1 overflow-y-auto p-4 space-y-3">
                                    <div id="no-selection" class="text-center text-gray-400 mt-8">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <p>Select articles from the left panel</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Right Panel: Results & Actions -->
                            <div class="w-1/3 bg-gray-800 flex flex-col">
                                <div class="p-4 border-b border-gray-700">
                                    <h3 class="font-semibold text-white mb-3">Calculation Results</h3>
                                    <div class="flex gap-2">
                                        <button id="save-calculation" class="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm" disabled>
                                            Save
                                        </button>
                                        <button id="export-calculation" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm" disabled>
                                            Export
                                        </button>
                                        <button id="copy-results" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm" disabled>
                                            Copy
                                        </button>
                                    </div>
                                </div>
                                <div id="calculation-results" class="flex-1 overflow-y-auto p-4">
                                    <div id="no-calculation" class="text-center text-gray-400 mt-8">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2z" />
                                        </svg>
                                        <p>Results will appear here after calculation</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Footer: History -->
                        <div class="bg-gray-800 border-t border-gray-700 p-4">
                            <div class="flex items-center justify-between mb-2">
                                <h4 class="font-medium text-white">Recent Calculations</h4>
                                <button id="view-all-history" class="text-sky-400 hover:text-sky-300 text-sm">View All</button>
                            </div>
                            <div id="calculation-history" class="flex gap-2 overflow-x-auto">
                                <!-- History items will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', calculatorHTML);
    }

    setupEventListeners() {
        // Modal controls
        document.getElementById('close-calculator').addEventListener('click', () => {
            this.hideCalculator();
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hideCalculator();
            }
        });

        // Close on outside click
        document.getElementById('calculator-modal').addEventListener('click', (e) => {
            if (e.target.id === 'calculator-modal') {
                this.hideCalculator();
            }
        });

        // Search functionality
        document.getElementById('calculator-search').addEventListener('input', (e) => {
            this.filterArticles(e.target.value);
        });

        // Calculation controls
        document.getElementById('calculate-totals').addEventListener('click', () => {
            this.calculateTotals();
        });

        document.getElementById('clear-selection').addEventListener('click', () => {
            this.clearSelection();
        });

        // Result actions
        document.getElementById('save-calculation').addEventListener('click', () => {
            this.saveCalculation();
        });

        document.getElementById('export-calculation').addEventListener('click', () => {
            this.exportCalculation();
        });

        document.getElementById('copy-results').addEventListener('click', () => {
            this.copyResults();
        });

        // History
        document.getElementById('view-all-history').addEventListener('click', () => {
            this.showCalculationHistory();
        });

        // Electron menu integration
        if (window.electronAPI) {
            window.electronAPI.onOpenCalculator(() => this.showCalculator());
            window.electronAPI.onClearCalculator(() => this.clearSelection());
            window.electronAPI.onCopyResults(() => this.copyResults());
        }
    }

    async loadArticles() {
        try {
            let articles;
            if (window.electronAPI) {
                // Desktop mode: load from database
                const currentLang = window.languageManager ? window.languageManager.currentLang : 'en';
                articles = await window.electronAPI.getArticles(currentLang);
            } else {
                // Web mode: load from JSON (fallback)
                const currentLang = window.currentLang || 'en';
                const response = await fetch(`data/penal-code-${currentLang}.json`);
                articles = await response.json();
            }

            this.renderArticles(articles);
        } catch (error) {
            console.error('Error loading articles for calculator:', error);
            this.showError('Failed to load articles. Please try again.');
        }
    }

    renderArticles(articles) {
        const container = document.getElementById('calculator-articles');
        let html = '';

        articles.forEach(article => {
            html += `
                <div class="article-group mb-4">
                    <h4 class="text-sky-300 font-medium mb-2 text-sm">${article.title}</h4>
                    <div class="space-y-1">
            `;

            article.sections.forEach(section => {
                const isSelected = this.selectedSections.has(section.id);
                html += `
                    <div class="section-item p-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-sky-600' : 'bg-gray-700 hover:bg-gray-600'}" 
                         data-section-id="${section.id}">
                        <div class="flex items-center justify-between">
                            <div class="flex-1">
                                <div class="font-medium text-white text-sm">${section.code}</div>
                                <div class="text-gray-300 text-xs truncate">${section.name || section.title || ''}</div>
                            </div>
                            <div class="ml-2">
                                ${isSelected ? 
                                    '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>' :
                                    '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>'
                                }
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Add click handlers for section selection
        container.querySelectorAll('.section-item').forEach(item => {
            item.addEventListener('click', () => {
                const sectionId = item.dataset.sectionId;
                this.toggleSectionSelection(sectionId, articles);
            });
        });
    }

    toggleSectionSelection(sectionId, articles) {
        // Find the section data
        let sectionData = null;
        for (const article of articles) {
            const section = article.sections.find(s => s.id === sectionId);
            if (section) {
                sectionData = {
                    ...section,
                    articleTitle: article.title
                };
                break;
            }
        }

        if (!sectionData) return;

        if (this.selectedSections.has(sectionId)) {
            // Remove from selection
            this.selectedSections.delete(sectionId);
        } else {
            // Add to selection
            this.selectedSections.set(sectionId, sectionData);
        }

        // Update UI
        this.updateSelectedSections();
        this.loadArticles(); // Refresh to update selection indicators
    }

    updateSelectedSections() {
        const container = document.getElementById('selected-articles');
        const noSelection = document.getElementById('no-selection');

        if (this.selectedSections.size === 0) {
            noSelection.style.display = 'block';
            return;
        }

        noSelection.style.display = 'none';
        let html = '';

        this.selectedSections.forEach((section, sectionId) => {
            const punishmentData = this.parsePunishment(section.punishment, section.fine);
            
            html += `
                <div class="selected-section bg-gray-800 p-3 rounded border border-gray-700">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex-1">
                            <div class="font-medium text-white text-sm">${section.code}</div>
                            <div class="text-gray-300 text-xs">${section.articleTitle}</div>
                        </div>
                        <button class="remove-section text-red-400 hover:text-red-300" data-section-id="${sectionId}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div class="text-xs text-gray-400">
                        ${punishmentData.fineText ? `Fine: ${punishmentData.fineText}` : ''}
                        ${punishmentData.fineText && punishmentData.jailText ? ' • ' : ''}
                        ${punishmentData.jailText ? `Jail: ${punishmentData.jailText}` : ''}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Add remove handlers
        container.querySelectorAll('.remove-section').forEach(btn => {
            btn.addEventListener('click', () => {
                const sectionId = btn.dataset.sectionId;
                this.selectedSections.delete(sectionId);
                this.updateSelectedSections();
                this.loadArticles(); // Refresh to update selection indicators
            });
        });
    }

    calculateTotals() {
        if (this.selectedSections.size === 0) {
            this.showError('Please select at least one article to calculate.');
            return;
        }

        const calculation = {
            sections: [],
            totalFineMin: 0,
            totalFineMax: 0,
            totalJailMinDays: 0,
            totalJailMaxDays: 0,
            breakdown: []
        };

        this.selectedSections.forEach((section, sectionId) => {
            const punishmentData = this.parsePunishment(section.punishment, section.fine);
            
            calculation.sections.push(sectionId);
            calculation.totalFineMin += punishmentData.fineMin || 0;
            calculation.totalFineMax += punishmentData.fineMax || 0;
            calculation.totalJailMinDays += punishmentData.jailMinDays || 0;
            calculation.totalJailMaxDays += punishmentData.jailMaxDays || 0;

            calculation.breakdown.push({
                sectionId: sectionId,
                code: section.code,
                title: section.name || section.title,
                articleTitle: section.articleTitle,
                fineMin: punishmentData.fineMin,
                fineMax: punishmentData.fineMax,
                jailMinDays: punishmentData.jailMinDays,
                jailMaxDays: punishmentData.jailMaxDays,
                fineText: punishmentData.fineText,
                jailText: punishmentData.jailText
            });
        });

        this.currentCalculation = calculation;
        this.renderCalculationResults(calculation);
        this.enableResultActions();
    }

    parsePunishment(punishment, fine) {
        const result = {
            fineMin: 0,
            fineMax: 0,
            jailMinDays: 0,
            jailMaxDays: 0,
            fineText: fine || '',
            jailText: punishment || ''
        };

        // Parse fine amounts
        if (fine) {
            const fineMatch = fine.match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)/);
            if (fineMatch) {
                result.fineMin = parseInt(fineMatch[1].replace(/,/g, ''));
                result.fineMax = parseInt(fineMatch[2].replace(/,/g, ''));
            } else {
                const singleFineMatch = fine.match(/\$?([\d,]+)/);
                if (singleFineMatch) {
                    result.fineMin = result.fineMax = parseInt(singleFineMatch[1].replace(/,/g, ''));
                }
            }
        }

        // Parse jail time
        if (punishment) {
            // Years
            const yearsMatch = punishment.match(/(\d+)\s*-\s*(\d+)\s*years?/);
            if (yearsMatch) {
                result.jailMinDays = parseInt(yearsMatch[1]) * 365;
                result.jailMaxDays = parseInt(yearsMatch[2]) * 365;
            } else {
                const singleYearMatch = punishment.match(/(\d+)\s*years?/);
                if (singleYearMatch) {
                    result.jailMinDays = result.jailMaxDays = parseInt(singleYearMatch[1]) * 365;
                }
            }

            // Months
            const monthsMatch = punishment.match(/(\d+)\s*-\s*(\d+)\s*months?/);
            if (monthsMatch) {
                result.jailMinDays = parseInt(monthsMatch[1]) * 30;
                result.jailMaxDays = parseInt(monthsMatch[2]) * 30;
            } else {
                const singleMonthMatch = punishment.match(/(\d+)\s*months?/);
                if (singleMonthMatch) {
                    result.jailMinDays = result.jailMaxDays = parseInt(singleMonthMatch[1]) * 30;
                }
            }

            // Life imprisonment
            if (punishment.toLowerCase().includes('life')) {
                result.jailMinDays = result.jailMaxDays = 36500; // 100 years equivalent
            }
        }

        return result;
    }

    renderCalculationResults(calculation) {
        const container = document.getElementById('calculation-results');
        const noCalculation = document.getElementById('no-calculation');
        
        noCalculation.style.display = 'none';

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

        let html = `
            <div class="calculation-summary">
                <h4 class="font-bold text-white mb-4">Total Punishment</h4>
                
                <div class="bg-gray-900 p-4 rounded mb-4">
                    <div class="grid grid-cols-2 gap-4 mb-3">
                        <div class="text-center">
                            <div class="text-red-400 font-bold text-lg">
                                ${formatCurrency(calculation.totalFineMin)} - ${formatCurrency(calculation.totalFineMax)}
                            </div>
                            <div class="text-gray-400 text-xs">Total Fine</div>
                        </div>
                        <div class="text-center">
                            <div class="text-orange-400 font-bold text-lg">
                                ${formatDuration(calculation.totalJailMinDays)} - ${formatDuration(calculation.totalJailMaxDays)}
                            </div>
                            <div class="text-gray-400 text-xs">Total Jail Time</div>
                        </div>
                    </div>
                    <div class="text-center">
                        <div class="text-gray-300 text-sm">
                            ${calculation.sections.length} Article${calculation.sections.length !== 1 ? 's' : ''} Selected
                        </div>
                    </div>
                </div>

                <h5 class="font-semibold text-white mb-3">Breakdown by Article</h5>
                <div class="space-y-2">
        `;

        calculation.breakdown.forEach(item => {
            html += `
                <div class="bg-gray-900 p-3 rounded text-sm">
                    <div class="font-medium text-white mb-1">${item.code}</div>
                    <div class="text-gray-300 text-xs mb-2">${item.title}</div>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <span class="text-red-400">${formatCurrency(item.fineMin)} - ${formatCurrency(item.fineMax)}</span>
                        </div>
                        <div>
                            <span class="text-orange-400">${formatDuration(item.jailMinDays)} - ${formatDuration(item.jailMaxDays)}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    enableResultActions() {
        document.getElementById('save-calculation').disabled = false;
        document.getElementById('export-calculation').disabled = false;
        document.getElementById('copy-results').disabled = false;
    }

    async saveCalculation() {
        if (!this.currentCalculation) return;

        const name = prompt('Enter a name for this calculation:');
        if (!name) return;

        const calculationData = {
            name: name,
            sections: this.currentCalculation.sections,
            totalFineMin: this.currentCalculation.totalFineMin,
            totalFineMax: this.currentCalculation.totalFineMax,
            totalJailMinDays: this.currentCalculation.totalJailMinDays,
            totalJailMaxDays: this.currentCalculation.totalJailMaxDays,
            breakdown: this.currentCalculation.breakdown
        };

        try {
            if (window.electronAPI) {
                await window.electronAPI.saveCalculation(calculationData);
                this.showSuccess('Calculation saved successfully!');
                this.loadCalculationHistory();
            } else {
                // Web fallback - save to localStorage
                const saved = JSON.parse(localStorage.getItem('savedCalculations') || '[]');
                saved.unshift({ ...calculationData, id: Date.now(), created_at: new Date().toISOString() });
                localStorage.setItem('savedCalculations', JSON.stringify(saved.slice(0, 50))); // Keep last 50
                this.showSuccess('Calculation saved locally!');
            }
        } catch (error) {
            console.error('Error saving calculation:', error);
            this.showError('Failed to save calculation.');
        }
    }

    async exportCalculation() {
        if (!this.currentCalculation) return;

        try {
            const reportData = this.generateCalculationReport();
            
            if (window.electronAPI) {
                const result = await window.electronAPI.exportPDF(reportData, {
                    title: 'Los Santos Penal Code - Calculation Report',
                    format: 'legal'
                });
                
                if (result.success) {
                    this.showSuccess(`Report exported to: ${result.path}`);
                }
            } else {
                // Web fallback - download as text file
                const blob = new Blob([reportData.text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `penal-code-calculation-${Date.now()}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                this.showSuccess('Report downloaded!');
            }
        } catch (error) {
            console.error('Error exporting calculation:', error);
            this.showError('Failed to export calculation.');
        }
    }

    generateCalculationReport() {
        const calculation = this.currentCalculation;
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

        let text = `
LOS SANTOS PENAL CODE
CALCULATION REPORT

Generated: ${timestamp}

SUMMARY:
Total Fine: ${formatCurrency(calculation.totalFineMin)} - ${formatCurrency(calculation.totalFineMax)}
Total Jail Time: ${formatDuration(calculation.totalJailMinDays)} - ${formatDuration(calculation.totalJailMaxDays)}
Articles Applied: ${calculation.sections.length}

DETAILED BREAKDOWN:
`;

        calculation.breakdown.forEach((item, index) => {
            text += `
${index + 1}. ${item.code} - ${item.title}
   Article: ${item.articleTitle}
   Fine: ${formatCurrency(item.fineMin)} - ${formatCurrency(item.fineMax)}
   Jail: ${formatDuration(item.jailMinDays)} - ${formatDuration(item.jailMaxDays)}
`;
        });

        text += `

This report was generated by the Los Santos Penal Code Calculator.
The calculations are based on the statutory penalties outlined in the applicable penal code sections.
Actual sentencing may vary based on circumstances, judicial discretion, and other legal factors.
`;

        return {
            text: text,
            html: text.replace(/\n/g, '<br>'),
            title: 'Los Santos Penal Code - Calculation Report'
        };
    }

    async copyResults() {
        if (!this.currentCalculation) return;

        try {
            const reportData = this.generateCalculationReport();
            
            if (window.electronAPI) {
                await window.electronAPI.copyToClipboard(reportData.text);
            } else {
                await navigator.clipboard.writeText(reportData.text);
            }
            
            this.showSuccess('Results copied to clipboard!');
        } catch (error) {
            console.error('Error copying results:', error);
            this.showError('Failed to copy results.');
        }
    }

    clearSelection() {
        this.selectedSections.clear();
        this.currentCalculation = null;
        this.updateSelectedSections();
        this.loadArticles();
        
        // Clear results
        const container = document.getElementById('calculation-results');
        const noCalculation = document.getElementById('no-calculation');
        container.innerHTML = '';
        container.appendChild(noCalculation);
        noCalculation.style.display = 'block';

        // Disable action buttons
        document.getElementById('save-calculation').disabled = true;
        document.getElementById('export-calculation').disabled = true;
        document.getElementById('copy-results').disabled = true;
    }

    filterArticles(searchTerm) {
        const articles = document.querySelectorAll('.article-group');
        const sections = document.querySelectorAll('.section-item');
        
        if (!searchTerm.trim()) {
            articles.forEach(article => article.style.display = 'block');
            sections.forEach(section => section.style.display = 'block');
            return;
        }

        const term = searchTerm.toLowerCase();
        
        sections.forEach(section => {
            const text = section.textContent.toLowerCase();
            const matches = text.includes(term);
            section.style.display = matches ? 'block' : 'none';
        });

        // Hide article groups with no visible sections
        articles.forEach(article => {
            const visibleSections = article.querySelectorAll('.section-item[style*="block"], .section-item:not([style])');
            article.style.display = visibleSections.length > 0 ? 'block' : 'none';
        });
    }

    async loadCalculationHistory() {
        try {
            let calculations = [];
            
            if (window.electronAPI) {
                calculations = await window.electronAPI.getCalculations();
            } else {
                calculations = JSON.parse(localStorage.getItem('savedCalculations') || '[]');
            }

            this.renderCalculationHistory(calculations.slice(0, 5)); // Show last 5
        } catch (error) {
            console.error('Error loading calculation history:', error);
        }
    }

    renderCalculationHistory(calculations) {
        const container = document.getElementById('calculation-history');
        
        if (calculations.length === 0) {
            container.innerHTML = '<div class="text-gray-400 text-sm">No saved calculations</div>';
            return;
        }

        let html = '';
        calculations.forEach(calc => {
            const date = new Date(calc.created_at).toLocaleDateString();
            html += `
                <div class="history-item bg-gray-700 p-2 rounded min-w-[200px] cursor-pointer hover:bg-gray-600" data-calc-id="${calc.id}">
                    <div class="font-medium text-white text-sm truncate">${calc.name}</div>
                    <div class="text-gray-300 text-xs">${calc.sections.length} articles • ${date}</div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Add click handlers for history items
        container.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                this.loadCalculation(item.dataset.calcId);
            });
        });
    }

    async loadCalculation(calculationId) {
        // Implementation for loading a saved calculation
        console.log('Loading calculation:', calculationId);
        // This would restore the calculation state and show results
    }

    showCalculator() {
        document.getElementById('calculator-modal').classList.remove('hidden');
        this.isVisible = true;
        this.loadArticles();
    }

    hideCalculator() {
        document.getElementById('calculator-modal').classList.add('hidden');
        this.isVisible = false;
    }

    showError(message) {
        // Simple error notification - could be enhanced with a proper toast system
        alert('Error: ' + message);
    }

    showSuccess(message) {
        // Simple success notification - could be enhanced with a proper toast system
        alert('Success: ' + message);
    }
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window !== 'undefined') {
        window.penalCodeCalculator = new PenalCodeCalculator();
    }
});
