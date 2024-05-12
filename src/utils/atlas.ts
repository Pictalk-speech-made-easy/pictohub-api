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
                        path: {
                                wildcard: path
                        },
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

export function exactmatch(term: string, path: string, boost: number = 1) {
        return {
                text: {
                        query: term,
                        path: {
                                wildcard: path
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