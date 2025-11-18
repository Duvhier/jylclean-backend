const nodemailer = require('nodemailer');

// Configuración del transporter (para Gmail)
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Función para enviar email de recuperación de contraseña
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: `"J&L Clean Co." <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Recuperación de Contraseña - J&L Clean Co.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">J&L Clean Co.</h2>
          <h3 style="color: #333;">Recuperación de Contraseña</h3>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">
            Restablecer Contraseña
          </a>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">&copy; 2025 J&L Clean Co. Todos los derechos reservados.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de recuperación enviado a: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return false;
  }
};

// Función para enviar email de confirmación de venta
const sendSaleConfirmationEmail = async (email, saleData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"J&L Clean Co." <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Confirmación de Compra #${saleData.saleNumber} - J&L Clean Co.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">J&L Clean Co.</h2>
          <h3 style="color: #333;">¡Gracias por tu compra!</h3>
          <p>Tu pedido ha sido procesado exitosamente.</p>
          
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h4>Detalles del Pedido:</h4>
            <p><strong>Número de Pedido:</strong> ${saleData.saleNumber}</p>
            <p><strong>Fecha:</strong> ${new Date(saleData.createdAt).toLocaleDateString()}</p>
            <p><strong>Total:</strong> $${saleData.totalAmount}</p>
          </div>

          <div style="margin: 16px 0;">
            <h4>Productos:</h4>
            ${saleData.items.map(item => `
              <div style="border-bottom: 1px solid #e5e5e5; padding: 8px 0;">
                <strong>${item.name}</strong><br>
                Cantidad: ${item.quantity} × $${item.price} = $${(item.quantity * item.price).toFixed(2)}
              </div>
            `).join('')}
          </div>

          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">&copy; 2025 J&L Clean Co. Todos los derechos reservados.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de confirmación de venta enviado a: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email de confirmación:', error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendSaleConfirmationEmail
};