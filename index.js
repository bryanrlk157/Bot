const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    Events
} = require("discord.js");

const fs = require("fs");

// ===== CONFIGURE AQUI =====
const TOKEN = "MTQ3NDkzMDUzNDQ2MjI1OTI2MA.G3v8IK.DNBN-9XEoXmR84YkF0brkJOrwJFIr2CIe_uwnw";
const CARGO_ID = "1474791757660029088";
const CANAL_AUTH = "1474791826186698856";
const CANAL_LOG = "1474929051742503073";
// ===========================

const DB_PATH = "./database.json";

if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ membros: {} }, null, 2));
}

function readDB() {
    return JSON.parse(fs.readFileSync(DB_PATH));
}

function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

let painelMensagem = null;

function criarEmbed() {
    const agora = new Date();
    const data = agora.toLocaleDateString("pt-BR");
    const hora = agora.toLocaleTimeString("pt-BR");

    return new EmbedBuilder()
        .setColor("#ff6004")
        .setTitle("Seja bem-vindo(a) a nossa Comunidade!")
        .setDescription(
`Antes de mais nada, recomendamos que leia as Regras no canal acima antes de participar do nosso servidor. Qualquer quebra de regra poderá resultar em punição gravíssima ou até mesmo banimento permanente da comunidade.

**Por que se tornar membro?**
• Acesso a todos os canais  
• Participação em sorteios especiais  
• Receber novidades e anúncios em primeira mão  
• E muito mais!  

**Importante**
Você pode clicar no botão novamente a qualquer momento para perder o cargo e o acesso aos canais totais.

Se tiver dúvidas, fale com a equipe de moderação.

**Como funciona?**
1. Clique no botão abaixo.  
2. Aguarde a atribuição automática do cargo.  
3. Aproveite o acesso completo ao servidor!

Safira BOT • ${data}, ${hora}`
        )
        .setFooter({ text: "Sistema oficial de autenticação • Safira" });
}

client.once(Events.ClientReady, async () => {
    console.log("Safira online como " + client.user.tag);

    const canal = await client.channels.fetch(CANAL_AUTH);

    const button = new ButtonBuilder()
        .setCustomId("auth_toggle")
        .setLabel("Quero me tornar membro")
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    painelMensagem = await canal.send({
        embeds: [criarEmbed()],
        components: [row]
    });

    // Atualiza data e hora a cada 30 segundos
    setInterval(async () => {
        if (!painelMensagem) return;
        await painelMensagem.edit({
            embeds: [criarEmbed()]
        });
    }, 30000);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId !== "auth_toggle") return;

    const member = interaction.member;
    const canalLog = await client.channels.fetch(CANAL_LOG).catch(() => null);

    const db = readDB();
    const autenticado = db.membros[member.id];

    if (autenticado) {
        await member.roles.remove(CARGO_ID);
        db.membros[member.id] = false;
        writeDB(db);

        await interaction.reply({ content: "Seu acesso foi removido com sucesso.", ephemeral: true });
        if (canalLog) canalLog.send(member.user.tag + " removeu a autenticação.");

    } else {
        await member.roles.add(CARGO_ID);
        db.membros[member.id] = true;
        writeDB(db);

        await interaction.reply({ content: "Agora você é membro oficial. Aproveite!", ephemeral: true });
        if (canalLog) canalLog.send(member.user.tag + " foi autenticado.");
    }
});

client.login(TOKEN);
