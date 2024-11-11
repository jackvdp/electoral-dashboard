function parseEmails(emailString: string): string[] {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = emailString.match(emailRegex) || [];
    return [...new Set(emails.map(email =>
        email.trim().toLowerCase()
    ))];
}

export default function sendEmail(emailString: string, subject: string = '', body: string = '') {
    const emails = parseEmails(emailString);
    if (emails.length === 0) {
        console.warn('No valid emails found');
        return;
    }

    const cleanEmailList = emails.join(',');
    
    window.location.href = `mailto:${cleanEmailList}`
}