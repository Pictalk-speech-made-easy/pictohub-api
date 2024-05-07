export function autocomplete(term: string, path: string, boost: number = 2) {
        return {
                autocomplete: {
                        query: term,
                        path: path,
                        score: {
                                boost: {
                                        value: boost
                                }
                        }
                },
        }
}

export function fuzzysearch(term: string, path: string, boost: number = 1, maxEdits: number = 1, prefixLength: number = 3) {
        return {
                text: {
                        query: term,
                        path: path,
                        fuzzy: {
                                maxEdits: maxEdits,
                                prefixLength: prefixLength
                        },
                        score: {
                                boost: {
                                        value: boost
                                }
                        }
                }
        }
}

export function findmorelike(term: string, paths: string[], boost: number = 1) {
        return {
                moreLikeThis: {
                        like: paths.map((pa: string) => {
                                const obj = {};
                                obj[pa] = term;
                                return obj;
                        }),
                        score: {
                                boost: {
                                        value: boost
                                }
                        }
                }
        }
}

export function sortByRelevance(term: string, path: string, locale: string) {
        return [
                {
                        $addFields: {
                                searchScore: { $meta: "searchScore" }
                        }
                },
                {
                        $unwind: {
                                path: `$translations.${locale}`,
                                includeArrayIndex: "arrayIndex"
                        }
                },
                {
                        $addFields: {
                                wordLength: { $strLenCP: `$${path}` },
                                lengthDifference: { $abs: { $subtract: [term.length, { $strLenCP: `$${path}` }] } }
                        }
                },
                {
                        $addFields: {
                                score: {
                                        $multiply: [
                                                { $divide: [1, { $add: ["$lengthDifference", 1] }] },
                                                "$searchScore"
                                        ]
                                }
                        }
                },
                {
                        $sort: {
                                score: -1
                        }
                },
                {
                        $group: {
                                _id: "$_id",
                                originalDoc: { $first: "$$ROOT" },
                                translations: { $push: `$translations.${locale}` },
                                bestMatchWord: { $first: `$${path}` },
                                bestScore: { $first: "$score" },
                                bestWordIndex: { $first: "$arrayIndex" }
                        }
                },
                {
                        $addFields: {
                                [`originalDoc.translations.${locale}`]: "$translations",
                                "originalDoc.bestMatchWord": "$bestMatchWord",
                                "originalDoc.bestScore": "$bestScore",
                                "originalDoc.bestWordIndex": "$bestWordIndex"
                        }
                },
                {
                        $replaceRoot: {
                                newRoot: "$originalDoc"
                        }
                },
                {
                        $sort: {
                                bestWordIndex: 1,
                                score: -1
                        }
                },
                {
                        $project: {
                                searchScore: 0,
                                wordLength: 0,
                                lengthDifference: 0,
                                score: 0,
                                arrayIndex: 0,
                        }
                }
        ]
}