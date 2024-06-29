Linkedin 

https://www.linkedin.com/pulse/automatizando-o-download-de-anexos-e-mails-com-nodejs-thiago-mrbuf/

Introdução
No mundo acelerado de hoje, a automação se tornou uma necessidade para otimizar tarefas repetitivas e ganhar tempo. Se você já se viu perdido em uma enxurrada de e-mails, tentando manualmente baixar anexos importantes, temos uma solução perfeita para você. Neste artigo, vou compartilhar um código que desenvolvi em Node.js que faz exatamente isso: baixa automaticamente todos os anexos de e-mails não lidos das últimas 24 horas. Vamos explorar como ele funciona, seu objetivo e sua importância.
Para acessar o Gmail via IMAP usando um script, você precisa criar uma senha de app específica no Gmail, especialmente se você estiver usando a verificação em duas etapas (2FA) em sua conta. Abaixo, vou guiá-lo por todo o processo, desde a configuração até a criação da senha do aplicativo.
Passo 1: Ativar o Acesso IMAP no Gmail
Acesse sua conta do Gmail.
Clique no ícone de engrenagem no canto superior direito e selecione Ver todas as configurações.
Vá para a aba Encaminhamento e POP/IMAP.
Na seção Acesso IMAP, selecione Ativar IMAP.
Clique em Salvar alterações.
Passo 2: Ativar a Verificação em Duas Etapas
Se você ainda não ativou a verificação em duas etapas na sua conta do Google, precisará fazer isso antes de criar uma senha de app.
Acesse a página de verificação em duas etapas do Google.
Clique em Começar e siga as instruções para ativar a verificação em duas etapas.
Passo 3: Criar uma Senha de App
Depois de ativar a verificação em duas etapas, você pode criar uma senha de app específica para o seu script.
Acesse a página de senhas de app do Google.
Se solicitado, faça login na sua conta Google.
Na seção Selecionar o app e o dispositivo que você quer gerar a senha, clique em Selecionar app e escolha Outro (nome personalizado).
Digite um nome para a senha do app, por exemplo, "Node.js IMAP Script" e clique em Gerar.
O Google irá gerar uma senha de app. Anote esta senha, pois você precisará dela para configurar o seu script.
Passo 4: Atualizar o .env com a Senha de App
Agora, você pode atualizar o seu arquivo .env com a nova senha de app gerada.
Crie ou atualize o arquivo .env no diretório do seu projeto com as seguintes informações:
GMAIL_USER=thiago.pereira@meutudo.app
GMAIL_PASSWORD=sua_senha_de_app
O Código
Aqui está o código criado:
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
        tlsOptions: { rejectUnauthorized: false }
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
Objetivo
O objetivo desse código é automatizar o processo de download de anexos de e-mails não lidos nas últimas 24 horas. Com isso, elimina-se a necessidade de buscar manualmente por anexos importantes, economizando tempo e garantindo que nenhum documento crucial seja perdido.
Como Funciona
Configuração do IMAP: O código se conecta ao servidor IMAP do Gmail utilizando as credenciais fornecidas.
Busca de E-mails: Ele abre a caixa de entrada e busca por e-mails não lidos recebidos desde ontem.
Download de Anexos: Para cada e-mail encontrado, o código verifica se há anexos. Se sim, os anexa na pasta especificada, salvando-os no diretório raiz ou em um diretório específico.
Encerramento da Conexão: Após processar todos os e-mails, a conexão com o servidor é encerrada.
Importância
A automação dessa tarefa é crucial por várias razões:
Eficiência: Automatizar o download de anexos economiza tempo, permitindo que você se concentre em tarefas mais importantes.
Confiabilidade: Reduz o risco de perder anexos importantes, especialmente em situações de grande volume de e-mails.
Produtividade: Ao minimizar a intervenção manual, melhora-se a produtividade geral, permitindo uma gestão de e-mails mais eficaz.
Conclusão
Automatizar tarefas repetitivas como o download de anexos de e-mails é um passo importante para melhorar a eficiência e produtividade no ambiente de trabalho. Com um simples script em Node.js, você pode garantir que nenhum anexo importante seja perdido, economizando tempo e esforço. Se você lida com um grande volume de e-mails diariamente, considere integrar essa solução ao seu fluxo de trabalho e experimente a diferença que a automação pode fazer.
Espero que este artigo tenha sido útil e inspirador. Se você tiver alguma dúvida ou quiser saber mais sobre automação com Node.js, não hesite em entrar em contato. Vamos automatizar e simplificar juntos!

Obrigado por ler!
THIAGO PEREIRA DOS SANTOS
ENGENHERIO DE SOFTWARE 
https://www.linkedin.com/in/thiago-pereira-dos-santos-98730110a/
