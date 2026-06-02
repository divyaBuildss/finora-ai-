import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { parseFirebaseError } from '../services/firebase';
import Navbar from '../components/Navbar';
import Button from '../components/Button';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup, googleLogin, currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect automatically if client already authenticated
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password !== confirmPassword) {
      return setError("Passcodes do not match.");
    }

    setLoading(true);
    try {
      await signup(email, password, fullName);
      setSuccess('Private credentials successfully created. Opening mandate setup...');
      setTimeout(() => {
        navigate('/onboarding');
      }, 1000);
    } catch (err) {
      setError(parseFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await googleLogin();
      setSuccess('Authorized via Google. Synchronizing secure profile...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError(parseFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen">
      <Navbar />
      
      <main className="pt-32 flex items-center justify-center px-4 relative hero-gradient">
        <div className="w-full max-w-md glass-card rounded-2xl p-8 relative z-10 animate-slide-up">
          <div className="text-center mb-8">
            <span className="font-label-sm text-label-sm text-primary bg-primary-container/20 px-4 py-1 rounded-full mb-4 inline-block uppercase tracking-widest border border-primary/30">
              Request Private Access
            </span>
            <h2 className="font-display-lg text-headline-lg font-bold">Client Enrollment</h2>
            <p className="text-xs text-on-surface-variant mt-2">Join an elite class of algorithmic wealth generators.</p>
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-300 p-3 rounded-lg text-xs mb-6 text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-primary-container/10 border border-primary/30 text-primary p-3 rounded-lg text-xs mb-6 text-center emerald-glow">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-1 font-label-md">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Lord / Lady Client"
                className="w-full bg-surface-container border-b-2 border-subtle focus:border-primary px-4 py-3 rounded-lg text-on-surface outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-1 font-label-md">
                Institutional Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@finora-trust.com"
                className="w-full bg-surface-container border-b-2 border-subtle focus:border-primary px-4 py-3 rounded-lg text-on-surface outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-1 font-label-md">
                Master Passcode
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-surface-container border-b-2 border-subtle focus:border-primary px-4 py-3 rounded-lg text-on-surface outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-1 font-label-md">
                Confirm Passcode
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your passcode"
                className="w-full bg-surface-container border-b-2 border-subtle focus:border-primary px-4 py-3 rounded-lg text-on-surface outline-none transition-all"
              />
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full py-4 text-center justify-center flex items-center mt-6"
            >
              {loading ? (
                <span className="animate-pulse font-bold">Enrolling Client...</span>
              ) : (
                'Generate Security Keys'
              )}
            </Button>
          </form>

          {/* Federated Auth Divider */}
          <div className="relative my-6 text-center">
            <hr className="border-subtle" />
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 text-[10px] uppercase font-bold text-on-surface-variant bg-[#0b0f0d] tracking-widest">
              Or Connect Via
            </span>
          </div>

          {/* Google signup Trigger Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-subtle hover:bg-surface-glass text-on-surface rounded-lg text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 font-bold"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.717 1.058 15.01 0 12 0 7.354 0 3.307 2.682 1.341 6.59l3.925 3.175z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.275c0-.825-.075-1.612-.213-2.373H12v4.512h6.447a5.51 5.51 0 0 1-2.39 3.613l3.723 2.888c2.178-2.008 3.71-4.957 3.71-8.64z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.958-1.077 7.946-2.912l-3.722-2.888C15.19 18.91 13.722 19.09 12 19.09c-3.159 0-5.832-2.134-6.787-5.013L1.242 17.22C3.208 21.16 7.278 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.213 14.077A7.16 7.16 0 0 1 4.91 12c0-.73.12-1.428.324-2.09l-3.925-3.175A11.956 11.956 0 0 0 0 12c0 2.234.61 4.323 1.673 6.134l3.54-4.057z"
              />
            </svg>
            Request Access via Google
          </button>

          <div className="text-center mt-6">
            <p className="text-xs text-on-surface-variant">
              Already registered?{' '}
              <Link to="/login" className="text-secondary hover:underline font-bold">
                Authenticate Credentials
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -z-10"></div>
      </main>
    </div>
  );
}
