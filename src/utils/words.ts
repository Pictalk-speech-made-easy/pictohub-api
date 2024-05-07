export function charDiff(str1: string, str2: string): number {
        const length = Math.max(str1.length, str2.length);
        let differences = 0;

        for (let i = 0; i < length; i++) {
                if (str1[i] !== str2[i]) {
                        differences++;
                }
        }

        return differences;
}
