import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-analytics.js";


const firebaseConfig = {
  apiKey: "AIzaSyBsiC8RaCd-6bwuThixa1ZxFkK4JhHgfjk",
  authDomain: "cuidafast-hub-af250.firebaseapp.com",
  projectId: "cuidafast-hub-af250",
  storageBucket: "cuidafast-hub-af250.firebasestorage.app",
  messagingSenderId: "263800638065",
  appId: "1:263800638065:web:9b655c9d3e3acea160e9d0",
  measurementId: "G-701M8B5CZC"
};


const app = initializeApp(firebaseConfig);
getAnalytics(app);


const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Inicializar botão do Google após DOM carregar
document.addEventListener('DOMContentLoaded', () => {
  const btnGoogle = document.getElementById("btnGoogle");
  
  if (btnGoogle) {
    btnGoogle.addEventListener("click", () => {
      console.log('[Cadastro] Login com Google iniciado');
      
      signInWithPopup(auth, provider)
        .then(result => {
          const user = result.user;
          console.log("[Cadastro] Usuário logado com Google:", user);
          
          // Determinar tipo de usuário
          let tipoUsuario = '';
          const btnCuidadorTemp = document.getElementById('btn-cuidador');
          const btnClienteTemp = document.getElementById('btn-cliente');
          
          if (btnCuidadorTemp && btnCuidadorTemp.classList.contains("active")) {
            tipoUsuario = 'cuidador';
          } else if (btnClienteTemp && btnClienteTemp.classList.contains("active")) {
            tipoUsuario = 'cliente';
          } else {
            alert("Selecione um tipo de usuário antes de continuar.");
            return;
          }

          console.log('[Cadastro] Tipo selecionado:', tipoUsuario);

          // Criar objeto de usuário com dados do Google
          const userData = {
            nome: user.displayName || 'Usuário',
            email: user.email,
            telefone: user.phoneNumber || '',
            senha: user.uid, // Usar UID do Google como "senha" para login
            tipo: tipoUsuario,
            dataCadastro: new Date().toISOString(),
            primeiroNome: (user.displayName || 'Usuário').split(' ')[0],
            photoURL: user.photoURL || '',
            loginGoogle: true // Flag para identificar login do Google
          };

          // Salvar no localStorage
          localStorage.setItem('cuidafast_user', JSON.stringify(userData));
          localStorage.setItem('cuidafast_isLoggedIn', 'true');

          // Salvar na lista de usuários para login posterior
          salvarUsuarioNaLista(userData);

          console.log('[Cadastro] Usuário Google salvo:', userData);

          setTimeout(() => {
            if (tipoUsuario === 'cuidador') {
              console.log('[Cadastro] Redirecionando para complemento cuidador...');
              location.assign("../HTML/cadastroComplementoCuidador.html");
            } else {
              console.log('[Cadastro] Redirecionando para complemento cliente...');
              location.assign("../HTML/cadastroComplemento.html");
            }
          }, 100);
        })
        .catch(error => {
          console.error("[Cadastro] Erro no login com Google:", error);
          alert("Erro no login com Google: " + error.message);
        });
    });
  } else {
    console.error('[Cadastro] Botão do Google não encontrado');
  }
});
let btnCuidador, btnCliente, form, btnSubmit;

window.addEventListener('DOMContentLoaded', () => {
  btnCuidador = document.getElementById('btn-cuidador');
  btnCliente = document.getElementById('btn-cliente');
  form = document.getElementById('form-cadastro'); 
  btnSubmit = document.querySelector("button[type='submit']");

  // Verificar se elementos foram encontrados
  if (!btnCuidador || !btnCliente || !form) {
    console.error('[Cadastro] Elementos não encontrados no DOM');
    return;
  }

  // Cliente ativo por padrão
  btnCliente.classList.add('active');
  btnCliente.classList.remove('inactive');
  btnCuidador.classList.remove('active');
  btnCuidador.classList.add('inactive');
  if (btnSubmit) btnSubmit.textContent = "Continuar";

  // Adicionar event listeners
  btnCuidador.addEventListener('click', ativarCuidador);
  btnCliente.addEventListener('click', ativarCliente);

  // Event listener do formulário
  form.addEventListener("submit", handleFormSubmit);
});
function ativarCuidador() {
  btnCuidador.classList.add('active');
  btnCuidador.classList.remove('inactive');
  btnCliente.classList.remove('active');
  btnCliente.classList.add('inactive');
  if (btnSubmit) btnSubmit.textContent = "Continuar";
}

function ativarCliente() {
  btnCliente.classList.add('active');
  btnCliente.classList.remove('inactive');
  btnCuidador.classList.remove('active');
  btnCuidador.classList.add('inactive');
  if (btnSubmit) btnSubmit.textContent = "Continuar";
}

function handleFormSubmit(event) {
  event.preventDefault();

  console.log('[Cadastro] Formulário submetido');

  // Capturar dados do formulário
  const nome = document.querySelector('input[type="text"]').value.trim();
  const email = document.querySelector('input[type="email"]').value.trim();
  const telefone = document.querySelector('input[type="tel"]').value.trim();
  const senha = document.querySelector('input[type="password"]').value.trim();

  console.log('[Cadastro] Dados capturados:', { nome, email, telefone: telefone ? 'preenchido' : 'vazio' });

  // Validar campos obrigatórios
  if (!nome || !email || !senha) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  // Determinar tipo de usuário
  let tipoUsuario = '';
  if (btnCuidador.classList.contains("active")) {
    tipoUsuario = 'cuidador';
  } else if (btnCliente.classList.contains("active")) {
    tipoUsuario = 'cliente';
  } else {
    alert("Selecione um tipo de usuário antes de continuar.");
    return;
  }

  console.log('[Cadastro] Tipo de usuário:', tipoUsuario);

  // Criar objeto de usuário
  const userData = {
    nome: nome,
    email: email,
    telefone: telefone,
    senha: senha, // Salvar senha (em produção, use hash!)
    tipo: tipoUsuario,
    dataCadastro: new Date().toISOString(),
    primeiroNome: nome.split(' ')[0]
  };

  // Salvar no localStorage
  localStorage.setItem('cuidafast_user', JSON.stringify(userData));
  localStorage.setItem('cuidafast_isLoggedIn', 'true');

  // Salvar na lista de usuários para login posterior
  salvarUsuarioNaLista(userData);

  console.log('[Cadastro] Usuário cadastrado:', userData);

  // Redirecionar para página de complemento
  if (tipoUsuario === 'cuidador') {
    console.log('[Cadastro] Redirecionando para complemento cuidador...');
    window.location.href = "../HTML/cadastroComplementoCuidador.html";
  } else {
    console.log('[Cadastro] Redirecionando para complemento cliente...');
    // Cliente vai para página de complemento (data de nascimento e endereço)
    window.location.href = "../HTML/cadastroComplemento.html";
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.social-icons i').forEach(icon => {
    icon.addEventListener('mouseenter', () => {
      icon.classList.remove('ph-fill');
      icon.classList.add('ph');
    });
    icon.addEventListener('mouseleave', () => {
      icon.classList.add('ph-fill');
      icon.classList.remove('ph');
    });
  });
});

/**
 * Função para salvar usuário na lista de cadastrados
 * Permite que múltiplos usuários possam fazer login
 */
function salvarUsuarioNaLista(userData) {
  let usuarios = [];
  
  const usuariosExistentes = localStorage.getItem('cuidafast_usuarios');
  if (usuariosExistentes) {
    try {
      usuarios = JSON.parse(usuariosExistentes);
    } catch (error) {
      console.error('Erro ao carregar lista de usuários:', error);
      usuarios = [];
    }
  }

  // Verificar se usuário já existe (por email)
  const index = usuarios.findIndex(u => u.email === userData.email);
  if (index !== -1) {
    // Atualizar usuário existente
    usuarios[index] = userData;
    console.log('Usuário atualizado na lista:', userData.email);
  } else {
    // Adicionar novo usuário
    usuarios.push(userData);
    console.log('Novo usuário adicionado à lista:', userData.email);
  }

  localStorage.setItem('cuidafast_usuarios', JSON.stringify(usuarios));
  console.log('Total de usuários cadastrados:', usuarios.length);
}



