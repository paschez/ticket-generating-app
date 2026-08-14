import { Form, Link, useActionData, useNavigation } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';

const LoginPage = () => {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="mx-auto max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-2 text-slate-500">Log in to unlock tickets and your dashboard</p>
      </div>

      <Form method="post" className="space-y-5">
        <Input label="Email" type="email" name="email" autoComplete="email" />
        <Input label="Password" type="password" name="password" autoComplete="current-password" />
        {actionData?.error && <p className="text-sm text-red-500">{actionData.error}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
      </Form>

      <div className="mt-6 border-t border-slate-100 pt-5 text-center">
        <p className="text-sm text-slate-500">Need admin access?</p>
        <Link to="/admin/setup" className="mt-2 inline-block font-semibold text-primary hover:underline">
          Set up an Admin account
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
