<?php
// ── Service d'envoi d'e-mails (PHPMailer + SMTP) ──────────────
// Configuration dans backend/.env :
//   MAIL_HOST=smtp.gmail.com
//   MAIL_PORT=587
//   MAIL_USER=adresse@gmail.com
//   MAIL_PASS=mot_de_passe_application
//   MAIL_FROM_NAME=CAPEDIG-COOP CA
//
// Si MAIL_USER est vide, les mails sont simplement ignorés (mode dev)
// sans jamais faire échouer l'API.

require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;

/** Charge backend/.env dans $_ENV (idempotent). */
function chargerEnv(): void
{
    static $done = false;
    if ($done) return;
    $done = true;

    $envFile = __DIR__ . '/../.env';
    if (!file_exists($envFile)) return;
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), '#')) continue;
        [$k, $v] = array_map('trim', explode('=', $line, 2)) + [1 => ''];
        if ($k && !isset($_ENV[$k])) $_ENV[$k] = $v;
    }
}

/**
 * Envoie un e-mail à TOUS les administrateurs (pas seulement le premier).
 * À utiliser pour toute notification qui concerne l'équipe admin dans son
 * ensemble (nouvelle inscription, nouveau message producteur, etc.).
 */
function notifierTousLesAdmins(
    PDO $pdo,
    string $sujet,
    string $corpsHtml,
    ?string $eyebrow = null,
    ?array $cta = null
): void {
    $admins = $pdo->query("SELECT email FROM admin WHERE email IS NOT NULL")->fetchAll();
    foreach ($admins as $adm) {
        envoyerMail($adm['email'], $sujet, $corpsHtml, $eyebrow, $cta);
    }
}

/** URL publique du site (pour construire les liens dans les e-mails). */
function siteUrl(string $chemin = ''): string
{
    chargerEnv();
    $base = rtrim($_ENV['APP_URL'] ?? 'http://localhost:5173', '/');
    return $base . '/' . ltrim($chemin, '/');
}

/**
 * Envoie un e-mail HTML. Ne lève jamais d'exception vers l'appelant :
 * en cas d'échec, log l'erreur et retourne false.
 *
 * @param string      $destinataire
 * @param string      $sujet
 * @param string      $corpsHtml   Corps du message (paragraphes HTML simples)
 * @param string|null $eyebrow     Petit label au-dessus du titre (ex: "INSCRIPTION")
 * @param array|null  $cta         Bouton d'action ['label' => ..., 'url' => ...]
 */
function envoyerMail(
    string $destinataire,
    string $sujet,
    string $corpsHtml,
    ?string $eyebrow = null,
    ?array $cta = null
): bool {
    chargerEnv();

    $user = $_ENV['MAIL_USER'] ?? '';
    $pass = $_ENV['MAIL_PASS'] ?? '';

    // Mode dev : pas de config SMTP → on log et on sort proprement
    if (!$user || !$pass) {
        error_log("MAIL (dev, non envoyé) → $destinataire : $sujet");
        return false;
    }

    if (!filter_var($destinataire, FILTER_VALIDATE_EMAIL)) {
        error_log("MAIL : adresse invalide « $destinataire »");
        return false;
    }

    try {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = $_ENV['MAIL_HOST'] ?? 'smtp.gmail.com';
        $mail->Port       = (int)($_ENV['MAIL_PORT'] ?? 587);
        $mail->SMTPAuth   = true;
        $mail->Username   = $user;
        $mail->Password   = $pass;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->CharSet    = 'UTF-8';
        $mail->Timeout    = 10;

        $mail->setFrom($user, $_ENV['MAIL_FROM_NAME'] ?? 'CAPEDIG-COOP CA');
        $mail->addAddress($destinataire);
        $mail->isHTML(true);
        $mail->Subject = $sujet;

        // Logo encodé en base64 directement dans le HTML (data URI) : contrairement
        // à une image jointe en CID, Gmail ne le détache jamais en pièce jointe
        // affichée en bas du message — c'est un vrai bloc HTML inline, fiable
        // sur tous les clients mail sans dépendre d'une URL publique.
        $logoPath = __DIR__ . '/../../frontend/public/logo/cape_logo_new.png';
        $logoDataUri = null;
        if (file_exists($logoPath)) {
            $logoDataUri = 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath));
        }

        $mail->Body    = gabaritMail($sujet, $corpsHtml, $logoDataUri, $eyebrow, $cta);
        $mail->AltBody = strip_tags($corpsHtml) . ($cta ? "\n\n{$cta['label']} : {$cta['url']}" : '');

        $mail->send();
        return true;
    } catch (MailException $e) {
        error_log('MAIL : échec envoi à ' . $destinataire . ' — ' . $e->getMessage());
        return false;
    }
}

/** Gabarit HTML commun (logo + en-tête + bouton d'action + signature + pied de page). */
function gabaritMail(
    string $titre,
    string $contenu,
    ?string $logoDataUri = null,
    ?string $eyebrow = null,
    ?array $cta = null
): string {
    $annee   = date('Y');
    $siteUrl = siteUrl();

    $logoHtml = $logoDataUri
        ? "<img src=\"$logoDataUri\" alt=\"CAPEDIG-COOP CA\" width=\"38\" height=\"38\"
                style=\"display:block;border-radius:8px;background:#fff;padding:3px;\">"
        : '';

    $eyebrowHtml = $eyebrow
        ? "<p style=\"margin:0 0 8px;color:#D4641A;font-size:11px;font-weight:bold;
                      letter-spacing:1.2px;text-transform:uppercase;\">$eyebrow</p>"
        : '';

    $ctaHtml = '';
    if ($cta) {
        $label = htmlspecialchars($cta['label']);
        $url   = htmlspecialchars($cta['url']);
        $ctaHtml = <<<CTA
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 6px;">
          <tr><td style="border-radius:9px;background:#D4641A;">
            <a href="$url" target="_blank"
               style="display:inline-block;padding:13px 28px;color:#fff;font-size:14px;
                      font-weight:bold;text-decoration:none;border-radius:9px;">
              $label →
            </a>
          </td></tr>
        </table>
        CTA;
    }

    return <<<HTML
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#F5F0E8;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;
              border:1px solid #E8DFD0;">
    <div style="background:#D4641A;padding:18px 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td width="46" valign="middle" style="width:46px;padding-right:12px;">$logoHtml</td>
          <td valign="middle">
            <p style="margin:0;color:#fff;font-size:17px;font-weight:bold;">CAPEDIG-COOP CA</p>
            <p style="margin:1px 0 0;color:rgba(255,255,255,0.85);font-size:11.5px;">
              Coopérative Agricole de Production et de Digitalisation
            </p>
          </td>
        </tr>
      </table>
    </div>
    <div style="padding:30px 28px 26px;">
      $eyebrowHtml
      <h2 style="margin:0 0 16px;color:#1F2937;font-size:18px;">$titre</h2>
      <div style="color:#4B5563;font-size:14.5px;line-height:1.65;">$contenu</div>
      $ctaHtml
      <p style="margin:30px 0 0;color:#374151;font-size:14px;line-height:1.6;">
        Cordialement,<br>
        <strong>L'équipe CAPEDIG-COOP CA</strong>
      </p>
    </div>
    <div style="padding:18px 28px;background:#FAF7F0;border-top:1px solid #E8DFD0;">
      <p style="margin:0 0 6px;color:#6B7280;font-size:12px;">
        <a href="$siteUrl" style="color:#D4641A;text-decoration:none;font-weight:bold;">$siteUrl</a>
        &nbsp;·&nbsp; Dibobly, Région du Guémon, Côte d'Ivoire
      </p>
      <p style="margin:0;color:#9CA3AF;font-size:11.5px;">
        © $annee CAPEDIG-COOP CA. Ceci est un message automatique, merci de ne pas y répondre directement.
      </p>
    </div>
  </div>
</body>
</html>
HTML;
}
