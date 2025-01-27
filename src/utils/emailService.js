// utils/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Utiliser Gmail comme service
    auth: {
        user: process.env.EMAIL_USER, // Email de l'expéditeur
        pass: process.env.EMAIL_PASSWORD, // Mot de passe de l'expéditeur
    },
});

const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email envoyé à ${to}`);
    } catch (error) {
        console.error(`Erreur lors de l'envoi de l'email à ${to}:`, error);
    }
};

module.exports = sendEmail;