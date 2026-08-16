
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toast from '../../components/Toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register', { 
        name: formData.name, 
        email: formData.email, 
        password: formData.password 
      });
      const { user, accessToken, refreshToken } = response.data.data;
      
      setTokens(accessToken, refreshToken);
      setUser(user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <h2 className="mt-6 text-center text-3xl font-serif font-bold text-on-surface">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-outline">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-semibold text-primary hover:text-primary-container">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-outline-variant">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input label="Full Name" type="text" id="name" required fullWidth value={formData.name} onChange={handleChange} />
            <Input label="Email address" type="email" id="email" required fullWidth value={formData.email} onChange={handleChange} />
            <Input label="Password (min 8 chars)" type="password" id="password" required fullWidth value={formData.password} onChange={handleChange} />
            <Input label="Confirm Password" type="password" id="confirmPassword" required fullWidth value={formData.confirmPassword} onChange={handleChange} />

            <Button type="submit" fullWidth isLoading={isLoading}>
              Sign up
            </Button>
          </form>
        </div>
      </div>
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
    </div>
  );
}
