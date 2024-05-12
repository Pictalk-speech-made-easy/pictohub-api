import { compareTwoStrings } from "string-similarity";

export function sortResults(results: any[], locale: string, term: string): any[] {
        const fields = [
                { key: "word", factor: 1 },
                { key: "plural", factor: 1 },
                { key: "lexical_siblings", factor: 0.5 },
                { key: "definition", factor: 0.25 },
                { key: "synonyms", factor: 0.75 },
                {
                        key: "conjugates",
                        factor: 0.75,
                        config: {
                                fields: [
                                        { key: "verbe_m" },
                                ],
                                filter: (conjugate: any) => {
                                        return ['présent', 'futur simple', 'imparfait', 'passé composé'].includes(conjugate.temps) && 
                                        ['indicatif'].includes(conjugate.mode) &&
                                        ['actif'].includes(conjugate.forme)
                                }
                        }
                },
        ]
        const tags = [
                { key: 'usual verbs', factor: 1.5 },
                { key: 'core vocabulary', factor: 1.5 }
        ]
        const sortingMap: Map<string, {index: number, score: number}> = new Map();
        results.map((result: any) => {
                if (!result || !result.translations[locale]) return;
                let tagFactor = 1;
                for (const tag of tags) {
                        if (result.tags.includes(tag.key)) {
                                tagFactor += 0.25;
                        }
                }
                const translations: any[] = result.translations[locale];
                for (let i = 0; i < translations.length; i++) {
                        let maxscore = 0;
                        for (const field of fields) {
                                if (translations[i][field.key]) {
                                        if (field.config && field.config.filter) {
                                                translations[i][field.key] = translations[i][field.key].filter(field.config.filter);
                                        }
                                        const keyScore = extractTextAndComputeScore(translations[i][field.key], term) * field.factor * tagFactor;
                                        if (keyScore > maxscore) {
                                                maxscore = keyScore;
                                        }
                                }
                                if(!sortingMap.has(result._id) || sortingMap.get(result._id)!.score < maxscore) {
                                        sortingMap.set(result._id, {index: i, score: maxscore});
                                }
                        }
                }
        });
        const sortingScores = Array.from(sortingMap).map(([id, score]) => ({id, ...score}));
        sortingScores.sort((a, b) => {
                if (a.index === b.index) {
                        return b.score - a.score;
                }
                return a.index - b.index;
        });
        const sortedResults: any[] = [];
        for (const score of sortingScores) {
                const result = results.find((result) => result._id === score.id);
                if (result) sortedResults.push(result);
        }
        return sortedResults;
}

function extractTextAndComputeScore(obj: any, term: string, config: any = null) {
        let maxScore = 0;
        function recurse(obj: any, config?: any) {
                if (Array.isArray(obj)) {
                        obj.forEach(element => {
                                const elementConfig = config && config.arrayFields ? config.arrayFields : null;
                                recurse(element, elementConfig);
                        });
                } else if (typeof obj === 'object' && obj !== null) {
                        if (config && config.fields) {
                                config.fields.forEach(field => {
                                        if (obj.hasOwnProperty(field.key)) {
                                                recurse(obj[field.key], field.config);
                                        }
                                });
                        } else {
                                Object.values(obj).forEach(value => recurse(value));
                        }
                } else if (typeof obj === 'string') {
                        const score = compareTwoStrings(obj, term);
                        if (score > maxScore) {
                                maxScore = score;
                        }
                }
        }
        recurse(obj, config);
        return maxScore;
}