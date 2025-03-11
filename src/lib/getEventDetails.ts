export function getEventDetails(event: string) {
    switch(event) {
        case 'dominican-republic':
            return {
                name: '2024 Awards Dominican Republic',
                date: '15 – 18 Dec 24 '
            }
        case 'botswana':
            return {
                name: 'Symposium Botswana',
                date: '3 – 6 Sep 25'
            }
        default:
            throw new Error(`Invalid event: ${event}`)
    }
}