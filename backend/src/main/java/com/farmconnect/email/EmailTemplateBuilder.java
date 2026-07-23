package com.farmconnect.email;

import com.farmconnect.domain.enums.NotificationType;

/**
 * Builds a single branded, table-based HTML email shared by every notification type.
 * Inline styles only - table layout - no external assets, so it renders consistently
 * across Gmail, Outlook and other clients that strip <style> blocks or block images.
 */
final class EmailTemplateBuilder {

    private EmailTemplateBuilder() {
    }

    static String build(String recipientName, String title, String message, NotificationType type, String appUrl) {
        Accent accent = accentFor(type);
        String firstName = firstNameOf(recipientName);

        return """
                <!doctype html>
                <html>
                  <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
                      <tr>
                        <td align="center">
                          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:480px;max-width:100%%;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.08);">

                            <tr>
                              <td style="background-color:#16a34a;padding:24px 32px;">
                                <table role="presentation" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="width:36px;height:36px;background-color:rgba(255,255,255,0.18);border-radius:10px;text-align:center;vertical-align:middle;font-size:18px;">🌱</td>
                                    <td style="padding-left:10px;color:#ffffff;font-size:18px;font-weight:700;">FarmConnect</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:32px;">
                                <div style="display:inline-block;background-color:%s;color:%s;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;padding:4px 10px;border-radius:999px;margin-bottom:16px;">%s %s</div>
                                <p style="margin:0 0 4px 0;font-size:14px;color:#64748b;">Hi %s,</p>
                                <h1 style="margin:0 0 16px 0;font-size:20px;line-height:1.3;color:#0f172a;">%s</h1>
                                <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#334155;">%s</p>

                                <table role="presentation" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="background-color:#16a34a;border-radius:10px;">
                                      <a href="%s" style="display:inline-block;padding:11px 22px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">Open FarmConnect</a>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:20px 32px 28px 32px;border-top:1px solid #e2e8f0;">
                                <p style="margin:0 0 4px 0;font-size:13px;color:#16a34a;font-weight:600;">Thanks for growing with FarmConnect 🌾</p>
                                <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">You're receiving this email because of recent activity on your FarmConnect account. This is an automated message - no need to reply.</p>
                              </td>
                            </tr>

                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """.formatted(
                accent.bg(), accent.fg(), accent.emoji(), accent.label(),
                escape(firstName), escape(title), escape(message),
                appUrl);
    }

    private static String firstNameOf(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return "there";
        }
        return fullName.trim().split("\\s+")[0];
    }

    private static String escape(String text) {
        if (text == null) {
            return "";
        }
        return text
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }

    private static Accent accentFor(NotificationType type) {
        return switch (type) {
            case ORDER_UPDATE -> new Accent("#dcfce7", "#166534", "📦", "Order update");
            case PAYMENT -> new Accent("#fef3c7", "#92400e", "💰", "Payment");
            case AI_ALERT -> new Accent("#ede9fe", "#5b21b6", "🤖", "AI insight");
            case WEATHER -> new Accent("#e0f2fe", "#075985", "🌦️", "Weather alert");
            case SYSTEM -> new Accent("#e2e8f0", "#334155", "🔔", "Notification");
        };
    }

    private record Accent(String bg, String fg, String emoji, String label) {
    }
}
