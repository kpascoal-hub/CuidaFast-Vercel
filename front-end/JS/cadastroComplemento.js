// ---------- cadastroComplemento.js ----------
// Versão com integração ao backend

document.addEventListener('DOMContentLoaded', () => {
  console.log('[cadastroComplemento] Iniciado');

  // Verificar se usuário veio do Google (tem photoURL)
  const userData = JSON.parse(localStorage.getItem('cuidafast_user') || '{}');
  const photoUploadGroup = document.getElementById('photoUploadGroup');
  const photoUpload = document.getElementById('photoUpload');
  const photoPreview = document.getElementById('photoPreview');
  const selectPhotoBtn = document.getElementById('selectPhotoBtn');
  
  let uploadedPhotoURL = null;

  // Mostrar campo de foto apenas se NÃO cadastrou com Google
  if (!userData.photoURL && photoUploadGroup) {
    photoUploadGroup.style.display = 'block';
    console.log('[cadastroComplemento] Campo de foto exibido (sem Google)');
  } else if (userData.photoURL) {
    console.log('[cadastroComplemento] Usando foto do Google:', userData.photoURL);
  }

  // Botão para selecionar foto
  if (selectPhotoBtn && photoUpload) {
    selectPhotoBtn.addEventListener('click', function() {
      photoUpload.click();
    });
  }

  // Preview da foto selecionada
  if (photoUpload && photoPreview) {
    photoUpload.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        // Validar tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Arquivo muito grande. Tamanho máximo: 5MB');
          return;
        }

        // Validar tipo
        if (!file.type.startsWith('image/')) {
          alert('Por favor, selecione uma imagem válida.');
          return;
        }

        // Ler e mostrar preview
        const reader = new FileReader();
        reader.onload = function(event) {
          uploadedPhotoURL = event.target.result;
          photoPreview.innerHTML = `<img src="${uploadedPhotoURL}" alt="Preview da foto">`;
          console.log('[cadastroComplemento] Foto carregada');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // ----------- FUNÇÃO: buscar CEP -----------
  function buscarCEP(cepDigitado) {
    const cepInput = document.getElementById('cep');
    const btnBuscar = document.getElementById('btnBuscarCep');

    const id = cepDigitado || cepInput.value;
    const cepLimpo = id.replace(/\D/g, '');

    if (!id || cepLimpo.length !== 8) {
      alert('CEP inválido. Digite um CEP com 8 dígitos.');
      return;
    }

    const originalHTML = btnBuscar.innerHTML;
    btnBuscar.disabled = true;
    btnBuscar.innerHTML = '<i class="ph ph-spinner ph-spin"></i>';
    btnBuscar.style.opacity = '0.6';

    fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      .then(response => {
        if (!response.ok) throw new Error('Erro ao buscar CEP na API');
        return response.json();
      })
      .then(data => {
        if (data.erro) throw new Error('CEP não encontrado');

        document.getElementById('rua').value = data.logradouro || '';
        document.getElementById('bairro').value = data.bairro || '';
        document.getElementById('cidade').value = data.localidade || '';
        document.getElementById('estado').value = data.uf || '';

        btnBuscar.innerHTML = '<i class="ph ph-check"></i>';
        setTimeout(() => {
          btnBuscar.innerHTML = originalHTML;
          btnBuscar.disabled = false;
          btnBuscar.style.opacity = '1';
        }, 1500);

        document.getElementById('numero').focus();
      })
      .catch(error => {
        console.error('❌ Erro ao buscar CEP:', error);
        alert(error.message || 'Erro ao buscar CEP. Verifique sua conexão.');
        btnBuscar.innerHTML = originalHTML;
        btnBuscar.disabled = false;
        btnBuscar.style.opacity = '1';
      });
  }

  // ----------- FORMATAR CAMPOS -----------
  const cepInput = document.getElementById('cep');
  if (cepInput) {
    cepInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 5) value = value.slice(0, 5) + '-' + value.slice(5, 8);
      e.target.value = value;
    });

    cepInput.addEventListener('blur', (e) => {
      const cep = e.target.value.replace(/\D/g, '');
      if (cep.length === 8) buscarCEP(cep);
    });
  }

  const btnBuscarCep = document.getElementById('btnBuscarCep');
  if (btnBuscarCep) {
    btnBuscarCep.addEventListener('click', (e) => {
      e.preventDefault();
      const cep = document.getElementById('cep').value;
      if (cep && cep.trim() !== '') buscarCEP(cep);
      else alert('Por favor, digite um CEP primeiro.');
    });
  }

  const cpfInput = document.getElementById('cpf');
  if (cpfInput) {
    cpfInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      }
      e.target.value = value;
    });
  }

  // ----------- CARREGAR DADOS SALVOS -----------
  if (Object.keys(userData).length > 0) {
    console.log('[cadastroComplemento] Dados carregados do localStorage:', userData);
    document.getElementById('dataNascimento').value = userData.dataNascimento || '';
    document.getElementById('cpf').value = userData.cpf || '';
    document.getElementById('cep').value = userData.endereco?.cep || '';
    document.getElementById('rua').value = userData.endereco?.rua || '';
    document.getElementById('numero').value = userData.endereco?.numero || '';
    document.getElementById('complemento').value = userData.endereco?.complemento || '';
    document.getElementById('bairro').value = userData.endereco?.bairro || '';
    document.getElementById('cidade').value = userData.endereco?.cidade || '';
    document.getElementById('estado').value = userData.endereco?.estado || '';
  }

  // ----------- SALVAR DADOS AO ENVIAR -----------
  const form = document.getElementById('form-complemento');
  if (form) {
    form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const existingData = JSON.parse(localStorage.getItem('cuidafast_user') || '{}');

  const endereco = {
    cep: document.getElementById('cep').value,
    rua: document.getElementById('rua').value,
    numero: document.getElementById('numero').value,
    complemento: document.getElementById('complemento').value,
    bairro: document.getElementById('bairro').value,
    cidade: document.getElementById('cidade').value,
    estado: document.getElementById('estado').value,
  };

  const updatedData = {
    ...existingData,
    dataNascimento: document.getElementById('dataNascimento').value,
    cpf: document.getElementById('cpf').value,
    endereco: endereco,
    cadastroCompleto: true,
    updatedAt: new Date().toISOString(),
  };

      // Se usuário fez upload de foto (não veio do Google), adicionar
      if (uploadedPhotoURL && !existingData.photoURL) {
        updatedData.photoURL = uploadedPhotoURL;
        console.log('[cadastroComplemento] Foto do upload adicionada');
      }

      // ✅ SALVAR NO BACKEND
      try {
        const response = await fetch('http://localhost:3000/api/cliente/dados-complementares', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: existingData.id, // ID do usuário no banco
            endereco: endereco,
            dataNascimento: updatedData.dataNascimento,
            cpf: updatedData.cpf
          })
        });

        if (!response.ok) {
          throw new Error('Erro ao salvar dados no servidor');
        }

        console.log('✅ Dados salvos no backend');
      } catch (error) {
        console.error('❌ Erro ao salvar no backend:', error);
        alert('Erro ao salvar dados. Tente novamente.');
        return;
      }

      // Salvar também no localStorage (cache local)
      localStorage.setItem('cuidafast_user', JSON.stringify(updatedData));
      atualizarUsuarioNaLista(updatedData);

      alert('✅ Cadastro completado com sucesso!');
      window.location.href = 'homeCliente.html';
    });
  }
});

/**
 * Atualiza o usuário na lista de cadastrados
 */
function atualizarUsuarioNaLista(userData) {
  let usuarios = [];
  
  const usuariosExistentes = localStorage.getItem('cuidafast_usuarios');
  if (usuariosExistentes) {
    try {
      usuarios = JSON.parse(usuariosExistentes);
    } catch (error) {
      console.error('[cadastroComplemento] Erro ao carregar lista:', error);
      usuarios = [];
    }
  }

  // Procurar usuário por email
  const index = usuarios.findIndex(u => u.email === userData.email);
  if (index !== -1) {
    // Atualizar usuário existente
    usuarios[index] = userData;
    localStorage.setItem('cuidafast_usuarios', JSON.stringify(usuarios));
    console.log('[cadastroComplemento] Usuário atualizado na lista');
  }
}