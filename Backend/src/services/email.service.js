// github add krna hai

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();


const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{  
        type:'OAuth2',
        user:process.env.EMAIL_USER,
        clientId:process.env.CLIENT_ID,
        clientSecret:process.env.CLIENT_SECRET,
        refreshToken:process.env.REFRESH_TOKEN
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log('Error connecting to email server:', error);
    } else {
        console.log('Email server is ready to send emails.');
    }
});


const sendEmail = async (to, subject, text,html) => {
    try {
        const info= await transporter.sendMail({
            from: `"Bank Transaction" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        });
        console.log('Email sent: ' + info.response);
        console.log("preview URL: " + nodemailer.getTestMessageUrl(info));  
    } catch (error) {
           console.error(error);
    }   

};



async function sendRegistrationEmail(userEmail, name) {
    const subject = 'Welcome to Our Service!';
    const text = 'Thank you for registering with our service. We are excited to have you on board!';
    const html = `<p>Thank you for registering with our service. We are excited to have you on board!</p>`;
    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, toAmount, amount) {
    const subject = "transaction successful";
    const text = `Dear ${name}, your transaction of amount ${amount} to ${toAmount} was successful.`;
    const html = `<p>Dear ${name}, your transaction of amount ${amount} to ${toAmount} was successful.</p>`;
    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, toAmount, amount) {
    const subject = "transaction failed";
    const text = `Dear ${name}, your transaction of amount ${amount} to ${toAmount} has failed. Please try again later.`;
    const html = `<p>Dear ${name}, your transaction of amount ${amount} to ${toAmount} has failed. Please try again later.</p>`;
    await sendEmail(userEmail, subject, text, html);
}

async function sendPasswordResetEmail(userEmail, resetUrl) {
    const subject = "Password Reset Request";
    const text = `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
Please click on the following link, or paste this into your browser to complete the process:\n\n
${resetUrl}\n\n
If you did not request this, please ignore this email and your password will remain unchanged.\n`;
    
    const html = `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
<p>Please click on the following link, or paste this into your browser to complete the process:</p>
<a href="${resetUrl}">${resetUrl}</a>
<p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`;
    
    await sendEmail(userEmail, subject, text, html);
}

module.exports = {
   sendEmail,  sendRegistrationEmail, sendTransactionEmail, sendTransactionFailureEmail, sendPasswordResetEmail
}