type ClassValue = string | undefined | null | false | ClassValue[];
export function cn(...classes: ClassValue[]): string {
    const flatten = (arr: ClassValue[]): string[] => {
        return arr.flatMap(item => {
            if (Array.isArray(item)) {
                return flatten(item);
            }
            return item ? String(item) : [];
        });
    };
    return flatten(classes).filter(Boolean).join(' ');
}
