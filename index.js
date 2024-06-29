require('dotenv').config();
const imaps = require('imap-simple');
const fs = require('fs');
const { simpleParser } = require('mailparser');
const path = require('path');

// Configurações do IMAP
const config = {
    imap: {
        user: process.env.GMAIL_USER,
        password: process.env.GMAIL_PASSWORD,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 3000,
        tlsOptions: { rejectUnauthorized: false }  // Adicionado para aceitar certificados autoassinados
    }
};

// Função para salvar anexos
function saveAttachment(attachment) {
    const filePath = path.join(__dirname, attachment.filename);
    fs.writeFileSync(filePath, attachment.content);
}

// Função principal para buscar e salvar anexos
async function fetchAttachments() {
    try {
        const connection = await imaps.connect({ imap: config.imap });
        await connection.openBox('INBOX');

        const delay = 24 * 3600 * 1000; // 24 horas
        const yesterday = new Date(Date.now() - delay);
        const searchCriteria = ['UNSEEN', ['SINCE', yesterday.toISOString()]];
        const fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true };

        const messages = await connection.search(searchCriteria, fetchOptions);

        for (const message of messages) {
            const parts = imaps.getParts(message.attributes.struct);
            for (const part of parts) {
                if (part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT') {
                    const partData = await connection.getPartData(message, part);
                    saveAttachment({
                        filename: part.disposition.params.filename,
                        content: partData
                    });
                }
            }
        }

        await connection.end();
        console.log('Download de anexos concluído.');
    } catch (err) {
        console.error('Erro ao buscar anexos:', err);
    }
}

fetchAttachments();
