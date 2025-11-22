import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, serviceRole);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Use Supabase to authenticate
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error || !data.user) {
            return null;
          }

          // Get user details from users table
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email.toLowerCase())
            .single();

          return {
            id: data.user.id,
            email: data.user.email || credentials.email,
            name: userData?.name || credentials.email.split('@')[0],
            image: null,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists in our database
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email?.toLowerCase())
            .single();

          if (!existingUser) {
            // Create new user
            await supabase.from('users').insert({
              email: user.email?.toLowerCase(),
              name: user.name || user.email?.split('@')[0],
              auth_method: 'google',
              google_id: user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          } else if (!existingUser.google_id) {
            // Update existing user with Google ID
            await supabase
              .from('users')
              .update({
                google_id: user.id,
                auth_method: 'google',
                updated_at: new Date().toISOString(),
              })
              .eq('email', user.email?.toLowerCase());
          }
        } catch (error) {
          console.error('Error saving user to database:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
