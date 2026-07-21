import { Resend } from 'resend';

import ResetPasswordEmail from '@/components/emails/ResetPasswordEmail';
import VerifyEmail from '@/components/emails/VerifyEmail';

const resend = new Resend(
  process.env.RESEND_API_KEY || 're_dummy_key_for_build_bypass',
);
const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface EmailLabels {
  subject: string;
  greeting: string;
  message: string;
  button: string;
  ignore: string;
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  locale: string,
  labels: EmailLabels,
) {
  const verifyLink = `${domain}/${locale}/verify-email?token=${token}`;
  const dir = locale === 'fa' ? 'rtl' : 'ltr';

  try {
    const { error } = await resend.emails.send({
      from: 'Waypoint <noreply@mail.way-point.ir>',
      to: email,
      subject: labels.subject,
      react: VerifyEmail({ verifyLink, labels, dir }) as React.ReactElement,
    });

    if (error) {
      console.error('Resend Error:', error);
      return { success: false, error };
    }
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  locale: string,
  labels: EmailLabels,
) {
  const resetLink = `${domain}/${locale}/reset-password?token=${token}`;
  const dir = locale === 'fa' ? 'rtl' : 'ltr';

  try {
    const { error } = await resend.emails.send({
      from: 'Waypoint <noreply@mail.way-point.ir>',
      to: email,
      subject: labels.subject,
      react: ResetPasswordEmail({
        resetLink,
        labels,
        dir,
      }) as React.ReactElement,
    });

    if (error) return { success: false, error };
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
