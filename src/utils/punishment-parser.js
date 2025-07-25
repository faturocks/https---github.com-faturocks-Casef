/**
 * Punishment Parser Utility
 * Advanced parser for extracting fine and jail time information from penal code text
 */
class PunishmentParser {
    /**
     * Parse punishment and fine strings to extract numerical values
     * @param {string} punishment - Punishment description
     * @param {string} fine - Fine description
     * @returns {Object} Parsed punishment data
     */
    static parse(punishment = '', fine = '') {
        const result = {
            fineMin: 0,
            fineMax: 0,
            jailMinDays: 0,
            jailMaxDays: 0,
            fineText: fine,
            jailText: punishment,
            parsed: {
                fine: null,
                jail: null
            }
        };

        // Parse fine amounts
        if (fine) {
            result.parsed.fine = this.parseFine(fine);
            result.fineMin = result.parsed.fine.min;
            result.fineMax = result.parsed.fine.max;
        }

        // Parse jail time
        if (punishment) {
            result.parsed.jail = this.parseJailTime(punishment);
            result.jailMinDays = result.parsed.jail.minDays;
            result.jailMaxDays = result.parsed.jail.maxDays;
        }

        return result;
    }

    /**
     * Parse fine amounts from text
     * @param {string} fineText - Fine description text
     * @returns {Object} Parsed fine data
     */
    static parseFine(fineText) {
        const result = {
            min: 0,
            max: 0,
            currency: 'USD',
            original: fineText,
            pattern: null
        };

        if (!fineText || typeof fineText !== 'string') {
            return result;
        }

        const text = fineText.toLowerCase().replace(/,/g, '');

        // Pattern 1: $X,XXX - $X,XXX or $X,XXX to $X,XXX
        const rangePattern1 = /\$?\s*(\d+(?:\.\d{2})?)\s*[-–—to]\s*\$?\s*(\d+(?:\.\d{2})?)/;
        const rangeMatch1 = text.match(rangePattern1);
        
        if (rangeMatch1) {
            result.min = parseFloat(rangeMatch1[1]);
            result.max = parseFloat(rangeMatch1[2]);
            result.pattern = 'range';
            return result;
        }

        // Pattern 2: up to $X,XXX or maximum $X,XXX
        const upToPattern = /(?:up to|maximum|max|not more than|not exceeding)\s*\$?\s*(\d+(?:\.\d{2})?)/;
        const upToMatch = text.match(upToPattern);
        
        if (upToMatch) {
            result.min = 0;
            result.max = parseFloat(upToMatch[1]);
            result.pattern = 'maximum';
            return result;
        }

        // Pattern 3: at least $X,XXX or minimum $X,XXX
        const atLeastPattern = /(?:at least|minimum|min|not less than)\s*\$?\s*(\d+(?:\.\d{2})?)/;
        const atLeastMatch = text.match(atLeastPattern);
        
        if (atLeastMatch) {
            result.min = parseFloat(atLeastMatch[1]);
            result.max = parseFloat(atLeastMatch[1]) * 2; // Estimate max as double
            result.pattern = 'minimum';
            return result;
        }

        // Pattern 4: Single amount $X,XXX
        const singlePattern = /\$?\s*(\d+(?:\.\d{2})?)/;
        const singleMatch = text.match(singlePattern);
        
        if (singleMatch) {
            const amount = parseFloat(singleMatch[1]);
            result.min = amount;
            result.max = amount;
            result.pattern = 'single';
            return result;
        }

        // Special cases
        if (text.includes('no fine') || text.includes('without fine')) {
            result.pattern = 'none';
            return result;
        }

        return result;
    }

    /**
     * Parse jail time from text
     * @param {string} jailText - Jail time description text
     * @returns {Object} Parsed jail data
     */
    static parseJailTime(jailText) {
        const result = {
            minDays: 0,
            maxDays: 0,
            original: jailText,
            pattern: null,
            components: []
        };

        if (!jailText || typeof jailText !== 'string') {
            return result;
        }

        const text = jailText.toLowerCase().replace(/,/g, '');

        // Handle life imprisonment
        if (this.isLifeImprisonment(text)) {
            result.minDays = 36500; // 100 years equivalent
            result.maxDays = 36500;
            result.pattern = 'life';
            return result;
        }

        // Handle death penalty
        if (this.isDeathPenalty(text)) {
            result.minDays = 999999; // Special value for death penalty
            result.maxDays = 999999;
            result.pattern = 'death';
            return result;
        }

        // Try to parse different time patterns
        const timeComponents = this.extractTimeComponents(text);
        
        if (timeComponents.length > 0) {
            const { minDays, maxDays } = this.calculateDaysFromComponents(timeComponents);
            result.minDays = minDays;
            result.maxDays = maxDays;
            result.components = timeComponents;
            result.pattern = 'parsed';
        }

        return result;
    }

    /**
     * Check if text indicates life imprisonment
     * @param {string} text - Text to check
     * @returns {boolean} True if life imprisonment
     */
    static isLifeImprisonment(text) {
        const lifePatterns = [
            /life\s+(?:in\s+)?(?:prison|imprisonment|incarceration)/,
            /imprisonment\s+for\s+life/,
            /life\s+sentence/,
            /life\s+without\s+parole/,
            /life\s+in\s+prison/,
            /sentenced?\s+to\s+life/
        ];

        return lifePatterns.some(pattern => pattern.test(text));
    }

    /**
     * Check if text indicates death penalty
     * @param {string} text - Text to check
     * @returns {boolean} True if death penalty
     */
    static isDeathPenalty(text) {
        const deathPatterns = [
            /death\s+penalty/,
            /capital\s+punishment/,
            /execution/,
            /sentenced?\s+to\s+death/,
            /punishable\s+by\s+death/
        ];

        return deathPatterns.some(pattern => pattern.test(text));
    }

    /**
     * Extract time components from text
     * @param {string} text - Text to parse
     * @returns {Array} Array of time components
     */
    static extractTimeComponents(text) {
        const components = [];

        // Years patterns
        const yearPatterns = [
            /(\d+(?:\.\d+)?)\s*(?:-|to|–|—)\s*(\d+(?:\.\d+)?)\s*years?/g,
            /(?:up to|maximum|max|not more than|not exceeding)\s*(\d+(?:\.\d+)?)\s*years?/g,
            /(?:at least|minimum|min|not less than)\s*(\d+(?:\.\d+)?)\s*years?/g,
            /(\d+(?:\.\d+)?)\s*years?/g
        ];

        // Months patterns
        const monthPatterns = [
            /(\d+(?:\.\d+)?)\s*(?:-|to|–|—)\s*(\d+(?:\.\d+)?)\s*months?/g,
            /(?:up to|maximum|max|not more than|not exceeding)\s*(\d+(?:\.\d+)?)\s*months?/g,
            /(?:at least|minimum|min|not less than)\s*(\d+(?:\.\d+)?)\s*months?/g,
            /(\d+(?:\.\d+)?)\s*months?/g
        ];

        // Days patterns
        const dayPatterns = [
            /(\d+(?:\.\d+)?)\s*(?:-|to|–|—)\s*(\d+(?:\.\d+)?)\s*days?/g,
            /(?:up to|maximum|max|not more than|not exceeding)\s*(\d+(?:\.\d+)?)\s*days?/g,
            /(?:at least|minimum|min|not less than)\s*(\d+(?:\.\d+)?)\s*days?/g,
            /(\d+(?:\.\d+)?)\s*days?/g
        ];

        // Parse years
        yearPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                if (match[2]) {
                    // Range
                    components.push({
                        type: 'years',
                        min: parseFloat(match[1]),
                        max: parseFloat(match[2]),
                        pattern: 'range'
                    });
                } else {
                    // Single value
                    const value = parseFloat(match[1]);
                    components.push({
                        type: 'years',
                        min: value,
                        max: value,
                        pattern: 'single'
                    });
                }
            }
        });

        // Parse months
        monthPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                if (match[2]) {
                    components.push({
                        type: 'months',
                        min: parseFloat(match[1]),
                        max: parseFloat(match[2]),
                        pattern: 'range'
                    });
                } else {
                    const value = parseFloat(match[1]);
                    components.push({
                        type: 'months',
                        min: value,
                        max: value,
                        pattern: 'single'
                    });
                }
            }
        });

        // Parse days
        dayPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                if (match[2]) {
                    components.push({
                        type: 'days',
                        min: parseFloat(match[1]),
                        max: parseFloat(match[2]),
                        pattern: 'range'
                    });
                } else {
                    const value = parseFloat(match[1]);
                    components.push({
                        type: 'days',
                        min: value,
                        max: value,
                        pattern: 'single'
                    });
                }
            }
        });

        return components;
    }

    /**
     * Calculate total days from time components
     * @param {Array} components - Time components
     * @returns {Object} Min and max days
     */
    static calculateDaysFromComponents(components) {
        let minDays = 0;
        let maxDays = 0;

        components.forEach(component => {
            let minComponentDays = 0;
            let maxComponentDays = 0;

            switch (component.type) {
                case 'years':
                    minComponentDays = component.min * 365;
                    maxComponentDays = component.max * 365;
                    break;
                case 'months':
                    minComponentDays = component.min * 30;
                    maxComponentDays = component.max * 30;
                    break;
                case 'days':
                    minComponentDays = component.min;
                    maxComponentDays = component.max;
                    break;
            }

            // If multiple components, take the largest (assuming they're alternatives)
            if (maxComponentDays > maxDays) {
                minDays = minComponentDays;
                maxDays = maxComponentDays;
            }
        });

        return { minDays: Math.round(minDays), maxDays: Math.round(maxDays) };
    }

    /**
     * Format days back to human-readable duration
     * @param {number} days - Number of days
     * @returns {string} Formatted duration
     */
    static formatDuration(days) {
        if (days === 999999) return 'Death Penalty';
        if (days >= 36500) return 'Life Imprisonment';
        
        if (days >= 365) {
            const years = Math.floor(days / 365);
            const remainingDays = days % 365;
            
            if (remainingDays === 0) {
                return `${years} year${years !== 1 ? 's' : ''}`;
            } else {
                const months = Math.floor(remainingDays / 30);
                const finalDays = remainingDays % 30;
                
                let result = `${years} year${years !== 1 ? 's' : ''}`;
                if (months > 0) result += ` ${months} month${months !== 1 ? 's' : ''}`;
                if (finalDays > 0) result += ` ${finalDays} day${finalDays !== 1 ? 's' : ''}`;
                
                return result;
            }
        } else if (days >= 30) {
            const months = Math.floor(days / 30);
            const remainingDays = days % 30;
            
            let result = `${months} month${months !== 1 ? 's' : ''}`;
            if (remainingDays > 0) result += ` ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
            
            return result;
        } else {
            return `${days} day${days !== 1 ? 's' : ''}`;
        }
    }

    /**
     * Format currency amount
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency code (default: USD)
     * @returns {string} Formatted currency
     */
    static formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    /**
     * Get punishment severity score for comparison
     * @param {Object} punishmentData - Parsed punishment data
     * @returns {number} Severity score (0-1000)
     */
    static getSeverityScore(punishmentData) {
        let score = 0;

        // Fine component (0-200 points)
        if (punishmentData.fineMax > 0) {
            score += Math.min(200, punishmentData.fineMax / 1000);
        }

        // Jail time component (0-800 points)
        if (punishmentData.jailMaxDays === 999999) {
            score += 1000; // Death penalty
        } else if (punishmentData.jailMaxDays >= 36500) {
            score += 800; // Life imprisonment
        } else {
            score += Math.min(800, punishmentData.jailMaxDays / 100);
        }

        return Math.round(score);
    }

    /**
     * Validate parsed data for consistency
     * @param {Object} punishmentData - Parsed punishment data
     * @returns {Object} Validation result
     */
    static validate(punishmentData) {
        const issues = [];
        const warnings = [];

        // Check fine consistency
        if (punishmentData.fineMin > punishmentData.fineMax) {
            issues.push('Fine minimum is greater than maximum');
        }

        // Check jail time consistency
        if (punishmentData.jailMinDays > punishmentData.jailMaxDays) {
            issues.push('Jail time minimum is greater than maximum');
        }

        // Check for unusually high values
        if (punishmentData.fineMax > 10000000) {
            warnings.push('Fine amount seems unusually high');
        }

        if (punishmentData.jailMaxDays > 36500 && punishmentData.jailMaxDays !== 999999) {
            warnings.push('Jail time exceeds 100 years (consider life imprisonment)');
        }

        // Check for zero values when text exists
        if (punishmentData.fineText && punishmentData.fineMax === 0) {
            warnings.push('Fine text exists but no amount was parsed');
        }

        if (punishmentData.jailText && punishmentData.jailMaxDays === 0) {
            warnings.push('Jail text exists but no time was parsed');
        }

        return {
            isValid: issues.length === 0,
            issues: issues,
            warnings: warnings
        };
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.PunishmentParser = PunishmentParser;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PunishmentParser;
}
