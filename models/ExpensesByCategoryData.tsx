export interface ExpensesByCategoryData  {
    labels: string[]
    amounts: number[]
    data: any[]
    range: {
        start: string
        end: string
    }
}