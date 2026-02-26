/**
 * Script to generate Ethereal.email test credentials
 * Run this script to get test SMTP credentials for development
 */

const nodemailer = require('nodemailer');

async function generateEtherealCredentials() {
    try {
        // Generate SMTP credentials for testing
        const testAccount = await nodemailer.createTestAccount();
        
        console.log('Ethereal.email Test Credentials:');
        console.log('================================');
        console.log(`SMTP_HOST: ${testAccount.smtp.host}`);
        console.log(`SMTP_PORT: ${testAccount.smtp.port}`);
        console.log(`SMTP_SECURE: ${testAccount.smtp.secure}`);
        console.log(`SMTP_USER: ${testAccount.user}`);
        console.log(`SMTP_PASS: ${testAccount.pass}`);
        console.log(`Preview URL: https://ethereal.email/message/${testAccount.user}`);
        console.log('');
        console.log('Update your .env file with these credentials for email testing.');
        
        // Also create a test email to verify the credentials work
        const transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });

        const info = await transporter.sendMail({
            from: '"Digital Menu Card" <no-reply@digitalmenucard.com>',
            to: testAccount.user,
            subject: 'Test Email from Digital Menu Card',
            text: 'This is a test email to verify that your email configuration is working correctly.',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Test Email</h2>
                    <p>If you're seeing this email, your email configuration is working correctly!</p>
                    <p>You can now test the password reset functionality.</p>
                    <hr>
                    <p style="font-size: 12px; color: #666;">
                        This is an automated test email from the Digital Menu Card system.
                    </p>
                </div>
            `
        });

        console.log('Test email sent successfully!');
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        
    } catch (error) {
        console.error('Error generating Ethereal credentials:', error);
    }
}

// Run the function if this script is executed directly
if (require.main === module) {
    generateEtherealCredentials();
}

module.exports = { generateEtherealCredentials };