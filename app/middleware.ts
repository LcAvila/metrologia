import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const path = request.nextUrl.pathname;

  // Criar cliente Supabase com cookies da requisição
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          requestHeaders.append('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`);
        },
        remove(name: string, options: any) {
          requestHeaders.append('Set-Cookie', `${name}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`);
        },
      },
    }
  );

  // Verificar autenticação
  const { data: { session } } = await supabase.auth.getSession();

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login', '/reset-password', '/assets'];
  if (publicRoutes.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }

  // Redirecionar para login se não estiver autenticado
  if (!session) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(redirectUrl);
  }

  // Verificar tipo de usuário normalmente
  const { data: userData } = await supabase
    .from('usuarios')
    .select('tipo_usuario')
    .eq('id', session.user.id)
    .single();

  let userType = userData?.tipo_usuario?.trim().toLowerCase();
  if (userType === 'administrador') userType = 'admin';

  // Regras de acesso baseadas no tipo de usuário
  if (userType) {
    // Admin tem acesso a tudo
    if (userType === 'admin') {
      // Se estiver na raiz, redirecionar para o painel admin
      if (path === '/') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    // Proteger rotas administrativas
    if (path.startsWith('/admin')) {
      if (userType !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      // Admin continua normalmente
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    // Metrologista só pode acessar /metrologia e rotas públicas
    if (userType === 'metrologista') {
      // Se estiver na raiz, redirecionar para metrologia
      if (path === '/') {
        return NextResponse.redirect(new URL('/metrologia', request.url));
      }
      if (!path.startsWith('/metrologia') && !publicRoutes.some(route => path.startsWith(route))) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    // Químico só pode acessar /fispq e rotas públicas
    if (userType === 'quimico') {
      // Se estiver na raiz, redirecionar para fispq
      if (path === '/') {
        return NextResponse.redirect(new URL('/fispq', request.url));
      }
      if (!path.startsWith('/fispq') && !publicRoutes.some(route => path.startsWith(route))) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  // Adicionar headers de segurança
  requestHeaders.set('x-user-type', userType || 'unknown');
  requestHeaders.set('x-middleware-cache', 'no-cache');

  // Retornar resposta com headers atualizados
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
