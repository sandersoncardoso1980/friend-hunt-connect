import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignInForm } from "@/components/auth/SignInForm";

const SignIn = () => {
  return (
    <AuthLayout
      title="Entre na sua conta"
      subtitle="Encontre eventos esportivos incríveis na sua cidade"
    >
      <SignInForm />
    </AuthLayout>
  );
};

export default SignIn;