import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      const user = data.user;
      const email = user.email;
      
      // 1. Domain Validation (STI Alabang)
      const stiEmailRegex = /^[a-zA-Z.-]+\.\d+@alabang\.sti\.edu\.ph$/i;
      if (email && !stiEmailRegex.test(email.trim())) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/?error=${encodeURIComponent("Only STI Alabang accounts (LastName.IDNumber@alabang.sti.edu.ph) are allowed.")}`);
      }

      // 2. Role Provisioning
      // Check if user already has a role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!roleData) {
        // If no role exists, provision as 'borrower' (default safe role)
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: 'borrower',
            status: 'active'
          });
        
        if (roleError) {
          console.error("Error provisioning role:", roleError.message);
          // We can still proceed, but the user might see limited dashboard functionality
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
    
    if (error) {
      console.error('Auth exchange error:', error.message);
      return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(error.message)}`);
    }
  }

  return NextResponse.redirect(`${origin}/?error=Authentication failed`);
}
