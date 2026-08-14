import { Form, Link, useActionData, useNavigation } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';

const RegisterPage = () => {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="mx-auto max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-2 text-slate-500">Join and book your next favorite experience</p>
      </div>

      <Form method="post" className="space-y-5">
        <Input label="Full name" name="name" autoComplete="name" required />
        <Input label="Email" type="email" name="email" autoComplete="email" required />
        <Input label="Password" type="password" name="password" autoComplete="new-password" required />
        <label className="block text-sm font-medium text-slate-700">
          <span className="mb-2 block">Register as</span>
          <select
            name="role"
            defaultValue="user"
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-primary"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        {actionData?.error && <p className="text-sm text-red-500">{actionData.error}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </Form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary">Login</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
