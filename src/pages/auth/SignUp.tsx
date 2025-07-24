import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignUpForm } from "@/components/auth/SignUpForm";

const SignUp = () => {
  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle="Junte-se à maior rede de eventos esportivos do Brasil"
    >
      <SignUpForm />
    </AuthLayout>
  );
};

export default SignUp;