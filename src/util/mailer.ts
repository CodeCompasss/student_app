import nodemailer from 'nodemailer';

export async function sendMail(to: string, subject: string, text: string) {
    // Ensure to use environment variables for sensitive information
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Your Gmail email
            pass: process.env.EMAIL_PASS, // Your Gmail password or app password
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender address
        to: to, // List of receivers
        subject: subject, // Subject line
        text: text, // Plain text body
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}
