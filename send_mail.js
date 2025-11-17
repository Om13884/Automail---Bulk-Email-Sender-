// send_bulk_email.js
// Node v14+ recommended

require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// ---------------- CONFIG ----------------
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const SENDER_PASSWORD = process.env.SENDER_PASSWORD;

if (!SENDER_EMAIL || !SENDER_PASSWORD) {
    console.error("❌ ERROR: Missing SENDER_EMAIL or SENDER_PASSWORD in .env file.");
    process.exit(1);
}

const EMAIL_SUBJECT = 'Application for Suitable Roles | Omkar Biradar';

const EMAIL_BODY_TEXT = `
Dear Hiring Team,

I hope this message finds you well. I am writing to express my interest in exploring suitable opportunities within your organization. I have completed my B.Tech in Computer Science Engineering and have built a solid foundation in software development, modern technologies, and practical problem-solving through my projects and hands-on experience.

A brief overview of some key projects I worked on:

• Decentralized File Vault Platform – Designed and developed a blockchain-based file vault system using Solidity, Hardhat, and ethers.js. The platform allows users to securely upload, store, and access files on a decentralized network, ensuring transparency, data integrity, and user-controlled privacy.

• NFT-Based Access Feature – Built a utility feature that unlocks premium functionality for users who hold specific NFTs in their wallet. This involved smart contract integration, user verification through Web3, and a complete front-end using React and Vite.

• Python Port Scanner – Developed a functional network scanning tool using Python sockets and Nmap to identify open ports and analyze basic network accessibility. This project strengthened my understanding of networking, scanning methodologies, and system-level operations.

Along with these projects, my internships in cybersecurity and technical simulations helped me build a structured approach to problem-solving, communication, and delivering work with attention to detail and accountability.

I am open to roles where my skills can contribute meaningfully—whether in development, operations, cybersecurity, or engineering support. I am confident that my adaptability, strong work ethic, and willingness to learn make me a dependable addition to a results-driven team.

My resume is attached for your review, and I would appreciate the opportunity to discuss how I can contribute to your organization.

Thank you for your time and consideration.

Regards,  
Omkar Biradar  
+91 9972734513  
omkar13844@gmail.com

`;

// File names
const EMAIL_LIST_FILE = 'hr_emails_company.csv';
const ATTACHMENT_FILE = 'omkar_biradar (2).pdf';
const EMAIL_COLUMN_INDEX = 0; // email column index in CSV

// ----------------------------------------

async function sendBulkEmail() {
    try {
        // Validate files
        if (!fs.existsSync(EMAIL_LIST_FILE)) {
            console.error(`❌ CSV not found: ${EMAIL_LIST_FILE}`);
            return;
        }
        if (!fs.existsSync(ATTACHMENT_FILE)) {
            console.error(`❌ Attachment missing: ${ATTACHMENT_FILE}`);
            return;
        }

        // Read CSV
        const csvContent = fs.readFileSync(EMAIL_LIST_FILE, 'utf-8');
        const lines = csvContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

        if (lines.length <= 1) {
            console.error("❌ No email rows found in CSV!");
            return;
        }

        const dataLines = lines.slice(1);

        // Parse emails
        let hrEmails = dataLines
            .map(line => {
                const columns = line.split(',');
                return columns[EMAIL_COLUMN_INDEX]?.trim();
            })
            .filter(email => email && email.includes('@'))
            .filter((email, index, arr) => arr.indexOf(email) === index); // dedupe

        if (hrEmails.length === 0) {
            console.error("❌ No valid emails in CSV");
            return;
        }

        // Limit to FIRST 400 emails
        hrEmails = hrEmails.slice(401, 800);
       

        console.log(`📨 Sending to first ${hrEmails.length} email(s)...`);

        // Create transporter (Gmail)
        let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    debug: true,
    auth: {
        user: SENDER_EMAIL,
        pass: SENDER_PASSWORD,
    }
   
});


        await transporter.verify();
        console.log("✅ SMTP Verified. Sending emails...\n");

        // Send emails one by one
        for (let i = 0; i < hrEmails.length; i++) {
            const recipient = hrEmails[i];

            const mailOptions = {
                from: `"Omkar Biradar" <${SENDER_EMAIL}>`,
                to: recipient,
                subject: EMAIL_SUBJECT,
                text: EMAIL_BODY_TEXT,
                attachments: [
                    {
                        filename: path.basename(ATTACHMENT_FILE),
                        path: path.resolve(ATTACHMENT_FILE),
                    },
                ],
            };

            try {
                const info = await transporter.sendMail(mailOptions);
                console.log(`[${i + 1}/${hrEmails.length}] Sent → ${recipient} | ID: ${info.messageId}`);
            } catch (err) {
                console.error(`[${i + 1}/${hrEmails.length}] ❌ Failed → ${recipient} | ${err.message}`);
            }

            // Optional delay (helps avoid rate-limiting)
            await new Promise(r => setTimeout(r, 300));
        }

        console.log("\n🎉 ALL DONE! Sent to first 400 emails.");

    } catch (error) {
        console.error("❌ Unhandled Error:", error);
    }
}

sendBulkEmail();
