import nodemailer from 'nodemailer';

export interface SendEmailResult {
  success: boolean;
  simulated?: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

export class EmailService {
  private static getTransporter() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  /**
   * Envia e-mail de confirmação de cadastro para o usuário
   */
  static async sendVerificationEmail(
    toEmail: string,
    userName: string,
    token: string,
    code: string
  ): Promise<SendEmailResult> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const confirmUrl = `${appUrl}/confirm-email?token=${token}&email=${encodeURIComponent(toEmail)}`;
    const transporter = this.getTransporter();

    const fromAddress = process.env.SMTP_FROM || `BolsaAlert <${process.env.SMTP_USER || 'no-reply@bolsaalert.com'}>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 30px; }
          .container { max-width: 540px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px; }
          .logo { font-size: 20px; font-weight: 800; color: #ffffff; margin-bottom: 24px; }
          .logo span { color: #10b981; }
          h2 { font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 0; }
          p { color: #a1a1aa; font-size: 14px; line-height: 1.6; }
          .button { display: inline-block; background-color: #059669; color: #ffffff !important; padding: 12px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; margin: 24px 0; }
          .code-box { background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; }
          .code-box span { font-family: monospace; font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #34d399; }
          .footer { margin-top: 32px; border-top: 1px solid #27272a; padding-top: 20px; font-size: 12px; color: #71717a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">Bolsa<span>Alert</span></div>
          <h2>Confirme seu cadastro</h2>
          <p>Olá, <strong>${userName}</strong>!</p>
          <p>Obrigado por se cadastrar na <strong>BolsaAlert</strong>. Para ativar sua conta e acessar seus alertas de mercado, clique no botão abaixo:</p>
          
          <div style="text-align: center;">
            <a href="${confirmUrl}" class="button">Confirmar Meu E-mail</a>
          </div>

          <p>Ou, se preferir, digite este código de 6 dígitos na tela de confirmação:</p>
          <div class="code-box">
            <span>${code}</span>
          </div>

          <p style="font-size: 12px; color: #71717a;">Se você não realizou este cadastro, desconsidere esta mensagem com segurança.</p>

          <div class="footer">
            BolsaAlert — Sistema Inteligente de Controle de Ativos e Alertas de Compra e Venda.<br>
            Link direto: <a href="${confirmUrl}" style="color: #10b981;">${confirmUrl}</a>
          </div>
        </div>
      </body>
      </html>
    `;

    if (!transporter) {
      console.log('====================================================');
      console.log('✉️ [SIMULAÇÃO DE ENVIO DE E-MAIL DE CONFIRMAÇÃO]');
      console.log(`Para: ${toEmail}`);
      console.log(`Código de Verificação: ${code}`);
      console.log(`URL de Confirmação: ${confirmUrl}`);
      console.log('Para enviar e-mails reais via Gmail, configure SMTP_USER e SMTP_PASS no .env');
      console.log('====================================================');

      return {
        success: true,
        simulated: true,
        previewUrl: confirmUrl,
      };
    }

    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `Código ${code} — Confirmação de Cadastro BolsaAlert`,
        html: htmlContent,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: any) {
      console.error('Falha ao enviar e-mail via SMTP:', err);
      return {
        success: false,
        error: err.message || 'Erro ao enviar e-mail.',
      };
    }
  }

  /**
   * Envia notificação para o administrador sobre novo usuário
   */
  static async sendAdminNotification(registeredUser: { name: string; email: string }): Promise<SendEmailResult> {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;
    if (!adminEmail) {
      return { success: true, simulated: true };
    }

    const transporter = this.getTransporter();
    const fromAddress = process.env.SMTP_FROM || `BolsaAlert <${process.env.SMTP_USER || 'no-reply@bolsaalert.com'}>`;

    const htmlContent = `
      <div style="font-family: sans-serif; background-color: #09090b; color: #f4f4f5; padding: 24px;">
        <div style="max-width: 500px; margin: 0 auto; background: #18181b; padding: 24px; border-radius: 12px; border: 1px solid #27272a;">
          <h3 style="color: #10b981; margin-top: 0;">Novo Usuário Cadastrado!</h3>
          <p>Um novo investidor acaba de se cadastrar no BolsaAlert:</p>
          <ul style="color: #d4d4d8;">
            <li><strong>Nome:</strong> ${registeredUser.name}</li>
            <li><strong>E-mail:</strong> ${registeredUser.email}</li>
            <li><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</li>
          </ul>
        </div>
      </div>
    `;

    if (!transporter) {
      console.log(`🔔 [NOTIFICAÇÃO ADMIN]: Novo usuário registrado: ${registeredUser.name} (${registeredUser.email})`);
      return { success: true, simulated: true };
    }

    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: adminEmail,
        subject: `[BolsaAlert] Novo Investidor Cadastrado: ${registeredUser.name}`,
        html: htmlContent,
      });
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.warn('Erro ao notificar admin por e-mail:', err);
      return { success: false, error: err.message };
    }
  }
}
