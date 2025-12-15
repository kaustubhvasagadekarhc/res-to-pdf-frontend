import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Forgot Password - ResToPDF',
    description: 'Reset your password',
};

export default function ForgotPasswordPage() {
    return <ForgotPasswordForm />;
}
