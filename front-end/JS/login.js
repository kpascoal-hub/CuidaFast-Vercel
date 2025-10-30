// login.js - Sistema de login para modais (index.html e sobre-nos.html)

document.addEventListener('DOMContentLoaded', function() {
  console.log('[Login] Sistema de login inicializado');

  // Tentar selecionar formulário do index.html ou sobre-nos.html
  const loginForm = document.getElementById('loginForm') || document.getElementById('loginFormSobre');
  if (!loginForm) {
    console.warn('[Login] Formulário de login não encontrado');
    return;
  }

  // Selecionar campos de input (index ou sobre-nos)
  const emailInput = document.getElementById('loginEmail') || document.getElementById('loginEmailSobre');
  const passwordInput = document.getElementById('loginPassword') || document.getElementById('loginPasswordSobre');

  if (!emailInput || !passwordInput) {
    console.warn('[Login] Campos de email ou senha não encontrados');
    return;
  }

  // Event listener para o formulário de login
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('[Login] Tentativa de login iniciada');

    const email = emailInput.value.trim();
    const senha = passwordInput.value.trim();

    // Validar campos
    if (!email || !senha) {
      alert('❌ Por favor, preencha todos os campos.');
      return;
    }

    // Tentar fazer login
    const loginResult = realizarLogin(email, senha);

    if (loginResult.success) {
      // Login bem-sucedido
      console.log('[Login] Login bem-sucedido:', loginResult.userData);
      
      // Fechar modal
      const loginModal = document.getElementById('loginModal');
      const modalInstance = bootstrap.Modal.getInstance(loginModal);
      if (modalInstance) {
        modalInstance.hide();
      }

      // Mostrar mensagem de sucesso
      alert(`✅ Bem-vindo(a), ${loginResult.userData.primeiroNome || loginResult.userData.nome}!`);

      // Redirecionar baseado no tipo de usuário
      setTimeout(() => {
        const currentPath = window.location.pathname;
        let pathPrefix = '';
        
        // Determinar o prefixo correto baseado na localização atual
        if (currentPath.includes('index.html') || currentPath === '/' || currentPath.endsWith('/')) {
          pathPrefix = 'front-end/HTML/';
        } else if (currentPath.includes('/HTML/')) {
          pathPrefix = '';
        } else {
          pathPrefix = '../HTML/';
        }
        
        console.log('[Login] Redirecionando...', { tipo: loginResult.userData.tipo, pathPrefix });
        
        if (loginResult.userData.tipo === 'cuidador') {
          window.location.href = pathPrefix + 'dashboard-cuidador.html';
        } else if (loginResult.userData.tipo === 'cliente') {
          window.location.href = pathPrefix + 'homeCliente.html';
        } else {
          console.error('[Login] Tipo de usuário desconhecido:', loginResult.userData.tipo);
          alert('❌ Erro: Tipo de usuário não identificado.');
        }
      }, 500);
    } else {
      // Login falhou
      console.warn('[Login] Falha no login:', loginResult.message);
      alert(loginResult.message);
      
      // Limpar senha
      passwordInput.value = '';
      passwordInput.focus();
    }
  });

  // Verificar se já está logado
  verificarSessaoAtiva();

  // Botão de login com Google no modal (index ou sobre-nos)
  const btnGoogleLogin = document.getElementById('btnGoogleLogin') || document.getElementById('btnGoogleLoginSobre');
  if (btnGoogleLogin) {
    btnGoogleLogin.addEventListener('click', function() {
      console.log('[Login] Login com Google clicado');
      
      // Código para login com Google (Firebase Auth já configurado!)
      import('https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js')
        .then(({ signInWithPopup, GoogleAuthProvider }) => {
          import('../JS/firebase-init.js').then(({ auth }) => {
            
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider)
              .then((result) => {
                const user = result.user;
                
                // Salvar no localStorage
                const userData = {
                  nome: user.displayName,
                  email: user.email,
                  photoURL: user.photoURL,
                  tipo: 'cliente',
                  dataCadastro: new Date().toISOString(),
                  primeiroNome: user.displayName.split(' ')[0]
                };
                
                localStorage.setItem('cuidafast_user', JSON.stringify(userData));
                localStorage.setItem('cuidafast_isLoggedIn', 'true');
                salvarUsuarioNaLista(userData);
                
                // Fechar modal
                const loginModal = document.getElementById('loginModal');
                const modalInstance = bootstrap.Modal.getInstance(loginModal);
                if (modalInstance) modalInstance.hide();
                
                // Redirecionar (ajustar path se estiver em sobre-nos)
                alert(`✅ Bem-vindo(a), ${userData.primeiroNome}!`);
                const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname === '/';
                window.location.href = isIndexPage ? 'front-end/HTML/homeCliente.html' : '../HTML/homeCliente.html';
              })
              .catch((error) => {
                console.error('Erro no login com Google:', error);
                alert('❌ Erro ao fazer login com Google: ' + error.message);
              });
          });
        });
    });
  }
});

/**
 * Realiza o login verificando as credenciais no localStorage
 */
function realizarLogin(email, senha) {
  console.log('[Login] Verificando credenciais para:', email);

  // Buscar todos os usuários cadastrados
  const usuarios = buscarTodosUsuarios();
  console.log('[Login] Total de usuários encontrados:', usuarios.length);

  // Procurar usuário com email correspondente
  const usuario = usuarios.find(u => 
    u.email.toLowerCase() === email.toLowerCase()
  );

  if (!usuario) {
    return {
      success: false,
      message: 'E-mail não encontrado. Verifique seus dados ou cadastre-se.'
    };
  }

  // Verificar senha
  // Se o usuário fez login com Google, a senha será o UID do Google
  if (usuario.loginGoogle && usuario.senha) {
    // Para usuários do Google, não verificamos senha no login manual
    return {
      success: false,
      message: 'Esta conta foi criada com Google. Use o botão "Login com Google".'
    };
  }
  
  // Para usuários normais, verificar senha
  if (usuario.senha && usuario.senha !== senha) {
    return {
      success: false,
      message: 'Senha incorreta. Tente novamente.'
    };
  }

  // Se não houver senha cadastrada, aceitar qualquer senha (compatibilidade)
  if (!usuario.senha) {
    console.warn('[Login] Usuário sem senha cadastrada. Atualizando...');
    usuario.senha = senha;
    salvarUsuarioNaLista(usuario);
  }

  // Login bem-sucedido
  // Salvar sessão ativa
  localStorage.setItem('cuidafast_user', JSON.stringify(usuario));
  localStorage.setItem('cuidafast_isLoggedIn', 'true');

  return {
    success: true,
    userData: usuario
  };
}

/**
 * Busca todos os usuários cadastrados no localStorage
 * Como estamos usando apenas 'cuidafast_user', vamos buscar esse único usuário
 * Em um sistema real, teríamos uma lista de usuários
 */
function buscarTodosUsuarios() {
  const usuarios = [];

  // Buscar usuário atual (se existir)
  const usuarioAtual = localStorage.getItem('cuidafast_user');
  if (usuarioAtual) {
    try {
      const userData = JSON.parse(usuarioAtual);
      usuarios.push(userData);
    } catch (error) {
      console.error('[Login] Erro ao parsear usuário:', error);
    }
  }

  // Em um sistema real, buscaríamos de um banco de dados
  // Por enquanto, vamos simular buscando de uma chave específica
  const usuariosCadastrados = localStorage.getItem('cuidafast_usuarios');
  if (usuariosCadastrados) {
    try {
      const lista = JSON.parse(usuariosCadastrados);
      if (Array.isArray(lista)) {
        usuarios.push(...lista);
      }
    } catch (error) {
      console.error('[Login] Erro ao parsear lista de usuários:', error);
    }
  }

  return usuarios;
}

/**
 * Verifica se já existe uma sessão ativa
 */
function verificarSessaoAtiva() {
  const isLoggedIn = localStorage.getItem('cuidafast_isLoggedIn');
  const userData = localStorage.getItem('cuidafast_user');

  if (isLoggedIn === 'true' && userData) {
    try {
      const user = JSON.parse(userData);
      console.log('[Login] Sessão ativa detectada para:', user.nome);
      
      // Redirecionar automaticamente se já estiver logado e estiver na página inicial
      const isIndexPage = window.location.pathname.includes('index.html') || 
                         window.location.pathname === '/' ||
                         window.location.pathname.includes('sobre-nos.html');
      
      if (isIndexPage) {
        console.log('[Login] Redirecionando usuário logado...');
        const pathPrefix = window.location.pathname.includes('sobre-nos.html') ? '../HTML/' : 'front-end/HTML/';
        
        if (user.tipo === 'cuidador') {
          window.location.href = pathPrefix + 'dashboard-cuidador.html';
        } else if (user.tipo === 'cliente') {
          window.location.href = pathPrefix + 'homeCliente.html';
        }
      }
    } catch (error) {
      console.error('[Login] Erro ao verificar sessão:', error);
      // Limpar dados corrompidos
      localStorage.removeItem('cuidafast_isLoggedIn');
      localStorage.removeItem('cuidafast_user');
    }
  }
}

/**
 * Função auxiliar para salvar usuário na lista de cadastrados
 * Deve ser chamada no cadastro.js
 */
function salvarUsuarioNaLista(userData) {
  let usuarios = [];
  
  const usuariosExistentes = localStorage.getItem('cuidafast_usuarios');
  if (usuariosExistentes) {
    try {
      usuarios = JSON.parse(usuariosExistentes);
    } catch (error) {
      console.error('[Login] Erro ao carregar lista de usuários:', error);
    }
  }

  // Verificar se usuário já existe (por email)
  const index = usuarios.findIndex(u => u.email === userData.email);
  if (index !== -1) {
    // Atualizar usuário existente
    usuarios[index] = userData;
  } else {
    // Adicionar novo usuário
    usuarios.push(userData);
  }

  localStorage.setItem('cuidafast_usuarios', JSON.stringify(usuarios));
  console.log('[Login] Usuário salvo na lista. Total:', usuarios.length);
}

// Exportar função para uso em outros arquivos
if (typeof window !== 'undefined') {
  window.salvarUsuarioNaLista = salvarUsuarioNaLista;
}
