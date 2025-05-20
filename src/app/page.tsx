'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import cn from '@/lib/cn';

import { useAPI } from '@/context/APIContext';

import TextInput from '@/component/primitive/TextInput';
import Button from '@/component/primitive/Button';

export default function AuthPage() {

  const router = useRouter();
  const { login, register } = useAPI();

  const [ username, setUsername ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ isSubmitting, setIsSubmitting ] = useState(false);
  const [ userMessage, setUserMessage ] = useState('');

  const preCheck = () => {
    if (!username) {
      setUserMessage('Please enter a username');
      return false;
    }
    if (!password) {
      setUserMessage('Please enter a password');
      return false;
    }
    return true;
  }

  const handleLogin = async () => {
    if (!preCheck()) return;
    setIsSubmitting(true);

    try {
      const response = await login({ username, password });
      router.push('/home');
    } catch (error) {
      console.error('login', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleRegister = async () => {
    if (!preCheck()) return;
    setIsSubmitting(true);

    try {
      const response = await register({ username, password });
      router.push('/onboard');
    } catch (error) {
      console.error('signup', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn(
      'container mx-auto',
      'h-screen w-full md:w-1/3',
      'flex flex-col gap-6',
      'items-center justify-center'
    )}>

      <TextInput
        label="Username"
        placeholder="monkey-business"
        value={username}
        onChange={(username) => setUsername(username)}
      />

      <TextInput
        label="Password"
        placeholder="********"
        value={password}
        type="password"
        onChange={(password) => setPassword(password)}
      />

      <div className={cn(
        'flex flex-row gap-4'
      )}>
        
        <Button onClick={handleRegister} isDisabled={isSubmitting}>
          Register
        </Button>

        <Button onClick={handleLogin} isDisabled={isSubmitting}>
          Login
        </Button>

      </div>

      {userMessage && (
        <div className={cn(
          'text-center italic',
          'text-sm'
        )}>
          {userMessage}
        </div>
      )}

    </div>
  );
}
