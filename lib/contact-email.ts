/**
 * Generates the HTML body for the contact form email.
 * Pure function — no side effects, easy to test.
 */

interface ContactEmailData {
  name: string
  email: string
  subject: string
  message: string
}

export function buildContactHtml({ name, email, subject, message }: ContactEmailData): string {
  // Escape HTML entities to prevent injection in the email body
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  const safeName = esc(name)
  const safeEmail = esc(email)
  const safeSubject = esc(subject)
  // Preserve line breaks in the message
  const safeMessage = esc(message).replace(/\n/g, '<br>')

  return /* html */ `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeSubject}</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
    style="background-color:#0f1117;padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600"
          style="max-width:600px;width:100%;background-color:#1a1d27;border-radius:16px;
                 border:1px solid #2a2d3a;overflow:hidden;">

          <!-- Header accent bar -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);
                       height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 32px;border-bottom:1px solid #2a2d3a;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:3px;
                               text-transform:uppercase;color:#6366f1;">
                      Portfolio Contact
                    </p>
                    <h1 style="margin:0;font-size:22px;font-weight:700;color:#f1f5f9;
                                line-height:1.3;">
                      Nuevo mensaje de <span style="color:#a78bfa;">${safeName}</span>
                    </h1>
                  </td>
                  <td align="right" valign="top" style="padding-left:16px;">
                    <!-- Icon -->
                    <div style="width:48px;height:48px;background:rgba(99,102,241,0.15);
                                border-radius:12px;border:1px solid rgba(99,102,241,0.3);
                                text-align:center;line-height:48px;font-size:22px;">
                      ✉️
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sender info pills -->
          <tr>
            <td style="padding:28px 40px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <!-- Name row -->
                <tr>
                  <td style="padding-bottom:12px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:28px;vertical-align:middle;padding-right:10px;">
                          <span style="font-size:15px;">👤</span>
                        </td>
                        <td style="vertical-align:middle;">
                          <span style="font-size:11px;color:#64748b;font-weight:600;
                                       text-transform:uppercase;letter-spacing:1.5px;
                                       display:block;margin-bottom:2px;">Nombre</span>
                          <span style="font-size:14px;color:#e2e8f0;font-weight:500;">
                            ${safeName}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Email row -->
                <tr>
                  <td style="padding-bottom:12px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:28px;vertical-align:middle;padding-right:10px;">
                          <span style="font-size:15px;">📧</span>
                        </td>
                        <td style="vertical-align:middle;">
                          <span style="font-size:11px;color:#64748b;font-weight:600;
                                       text-transform:uppercase;letter-spacing:1.5px;
                                       display:block;margin-bottom:2px;">Email</span>
                          <a href="mailto:${safeEmail}"
                             style="font-size:14px;color:#6366f1;font-weight:500;
                                    text-decoration:none;">
                            ${safeEmail}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Subject row -->
                <tr>
                  <td style="padding-bottom:4px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:28px;vertical-align:middle;padding-right:10px;">
                          <span style="font-size:15px;">📌</span>
                        </td>
                        <td style="vertical-align:middle;">
                          <span style="font-size:11px;color:#64748b;font-weight:600;
                                       text-transform:uppercase;letter-spacing:1.5px;
                                       display:block;margin-bottom:2px;">Asunto</span>
                          <span style="font-size:14px;color:#e2e8f0;font-weight:500;">
                            ${safeSubject}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:24px 40px 0;">
              <hr style="border:none;border-top:1px solid #2a2d3a;margin:0;" />
            </td>
          </tr>

          <!-- Message body -->
          <tr>
            <td style="padding:28px 40px 36px;">
              <p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:2px;
                         text-transform:uppercase;color:#64748b;">Mensaje</p>
              <div style="background:#0f1117;border-radius:12px;border:1px solid #2a2d3a;
                          padding:20px 24px;">
                <p style="margin:0;font-size:14px;line-height:1.75;color:#cbd5e1;
                           white-space:pre-wrap;">
                  ${safeMessage}
                </p>
              </div>
            </td>
          </tr>

          <!-- Reply CTA -->
          <tr>
            <td style="padding:0 40px 36px;text-align:center;">
              <a href="mailto:${safeEmail}?subject=Re:%20${safeSubject}"
                 style="display:inline-block;padding:12px 28px;
                        background:linear-gradient(135deg,#6366f1,#8b5cf6);
                        color:#fff;font-weight:600;font-size:14px;
                        border-radius:10px;text-decoration:none;
                        letter-spacing:0.5px;">
                Responder a ${safeName}
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;background:#13151f;
                       border-top:1px solid #2a2d3a;border-radius:0 0 16px 16px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <p style="margin:0;font-size:12px;color:#475569;">
                      Enviado desde
                      <a href="https://carlosperaza.dev"
                         style="color:#6366f1;text-decoration:none;font-weight:600;">
                        carlosperaza.dev
                      </a>
                    </p>
                  </td>
                  <td align="right">
                    <p style="margin:0;font-size:11px;color:#374151;">
                      Portfolio · 2026
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
  <!-- /Wrapper -->

</body>
</html>`
}

/** Plain-text fallback for email clients that don't render HTML */
export function buildContactText({ name, email, subject, message }: ContactEmailData): string {
  return [
    `Nuevo mensaje desde carlosperaza.dev`,
    ``,
    `Nombre:  ${name}`,
    `Email:   ${email}`,
    `Asunto:  ${subject}`,
    ``,
    `Mensaje:`,
    message,
    ``,
    `---`,
    `Enviado desde carlosperaza.dev`,
  ].join('\n')
}
