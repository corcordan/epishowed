export const getOrder = (hoverCredit: number | null, selectedCreds: Map<number, number[]>) => {
    if (hoverCredit) return [hoverCredit]
    return Array.from(selectedCreds.keys())
}