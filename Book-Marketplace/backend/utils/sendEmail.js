//E:\pro-book-marketplace\backend\utils\sendEmail.js
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendNewMessageEmail = async ({ to, fromName, bookTitle, chatLink }) => {
  const msg = {
    to: to, // The recipient's email address
    from: process.env.SENDGRID_VERIFIED_SENDER,
    subject: `You have a new message about "${bookTitle}" on BookMarket`,
    text: `Hi there,\n\n${fromName} sent you a new message regarding your book, "${bookTitle}".\n\nView the conversation here: ${chatLink}\n\nThanks,\nThe BookMarket Team`,
    html: `
      <p>Hi there,</p>
      <p><strong>${fromName}</strong> sent you a new message regarding your book, <strong>"${bookTitle}"</strong>.</p>
      <p><a href="${chatLink}" style="background-color: #1976d2; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">View Conversation</a></p>
      <p>Thanks,<br/>The BookMarket Team</p>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email notification sent to ${to}`);
  } catch (error) {
    console.error('Error sending email notification:', error);
    if (error.response) {
      console.error(error.response.body)
    }
  }
};