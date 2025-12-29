import React, { useState } from 'react';
import { Lock, User, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from './AuthContext';

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) return;
    
    const success = await login(username, password);
    if (success) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-white">Welcome Back</h2>
        <p className="text-dark-400 text-sm mt-1">
          Sign in to your Hummingbot Dashboard
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-loss/10 border border-loss/20 rounded-lg text-loss text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Input
        label="Username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter your username"
        leftIcon={<User className="w-4 h-4" />}
        autoComplete="username"
        autoFocus
        disabled={isLoading}
      />

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        leftIcon={<Lock className="w-4 h-4" />}
        autoComplete="current-password"
        disabled={isLoading}
      />

      <Button
        type="submit"
        className="w-full"
        size="lg"
        isLoading={isLoading}
        disabled={!username || !password}
      >
        Sign In
      </Button>

      <p className="text-center text-dark-500 text-xs">
        Uses HTTP Basic Authentication with your Hummingbot API credentials
      </p>
    </form>
  );
}


