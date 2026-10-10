import { ResetPasswordForm } from "./form";

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Set a new password</h1>
      <p className="text-text-secondary text-sm mb-6">Choose something you haven't used before.</p>
      <ResetPasswordForm token={token} />
    </div>
  );
}
