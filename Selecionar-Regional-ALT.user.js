// ==UserScript==
// @name         Selecionar Regional GGNET - SZ.CHAT - JoaoAGS/Samuel
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Seletor de regional estilo "Badges" (Apenas Novas)
// @author       João/Samuel
// @icon         https://avatars.githubusercontent.com/u/179055349?v=4
// @match        *://*.ggnet.sz.chat/*
// @match        *://clusterscpr.sz.chat/*
// @grant        none
// @run-at       document-idle
//
// --- ESTRATÉGIA DE ATUALIZAÇÃO ---
// @updateURL    https://raw.githubusercontent.com/joaoAGS/Selecionar-Regional-ALT--SZ.CHAT---JoaoAGS-Samuel/main/Selecionar-Regional-ALT.user.js
// @downloadURL  https://raw.githubusercontent.com/joaoAGS/Selecionar-Regional-ALT--SZ.CHAT---JoaoAGS-Samuel/main/Selecionar-Regional-ALT.user.js
// ==/UserScript==

(function () {
    'use strict';

    // --- CONFIGURAÇÃO (Apenas as novas regionais) ---
    const regionais = [
        { nome: 'Regional CTA', bg: '#fce8b2', text: '#b06000' }, // Laranja Pastel
        { nome: 'Regional CCO', bg: '#fff4bd', text: '#b39500' }, // Amarelo Pastel
        { nome: 'Regional PYE', bg: '#d4edda', text: '#155724' }, // Verde Pastel
        { nome: 'Regional MFA', bg: '#cce5ff', text: '#004085' }, // Azul Pastel
        { nome: 'Regional JBA', bg: '#d1ecf1', text: '#0c5460' }  // Azul Esverdeado
    ];

    // --- ESTILOS CSS ---
    const style = document.createElement('style');
    style.innerHTML = `
        /* O Container agora é Fixed para flutuar sobre tudo */
        #regional-dropdown-portal {
            display: none;
            position: fixed;
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            padding: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 10000;
            width: 230px;
            max-height: 400px;
            overflow-y: auto;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            opacity: 0;
            transform: translateY(-10px);
            transition: opacity 0.2s, transform 0.2s;
        }

        #regional-dropdown-portal.ativo {
            opacity: 1;
            transform: translateY(0);
        }

        .regional-item {
            display: block;
            padding: 8px 16px;
            margin-bottom: 8px;
            border-radius: 50px; /* Formato de Pílula */
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            text-align: center;
            transition: transform 0.1s, filter 0.2s;
            user-select: none;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .regional-item:hover {
            filter: brightness(0.92);
            transform: scale(1.02);
        }

        .regional-search {
            width: 100%;
            padding: 10px;
            margin-bottom: 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-sizing: border-box;
            outline: none;
            font-size: 14px;
        }
        
        .regional-search:focus {
            border-color: #2185d0;
        }

        /* Scrollbar bonitinha */
        #regional-dropdown-portal::-webkit-scrollbar {
            width: 6px;
        }
        #regional-dropdown-portal::-webkit-scrollbar-thumb {
            background-color: #ccc;
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);

    // --- CRIAÇÃO DO MENU FLUTUANTE (PORTAL) ---
    const dropdown = document.createElement('div');
    dropdown.id = 'regional-dropdown-portal';

    // Input de busca
    const inputSearch = document.createElement('input');
    inputSearch.type = 'text';
    inputSearch.placeholder = 'Buscar regional...';
    inputSearch.className = 'regional-search';
    dropdown.appendChild(inputSearch);

    // Container da lista
    const listaContainer = document.createElement('div');
    dropdown.appendChild(listaContainer);

    document.body.appendChild(dropdown);

    // --- FUNÇÕES AUXILIARES ---
    function renderizarLista(filtro = '') {
        listaContainer.innerHTML = '';
        regionais.forEach(reg => {
            if (reg.nome.toLowerCase().includes(filtro.toLowerCase())) {
                const item = document.createElement('div');
                item.className = 'regional-item';
                item.textContent = reg.nome;
                item.style.backgroundColor = reg.bg;
                item.style.color = reg.text;

                item.onclick = () => {
                    localStorage.setItem('sz_regional_selecionada', reg.nome);

                    // Atualiza o texto do botão
                    const labelBtn = document.getElementById('reg-label');
                    if(labelBtn) labelBtn.textContent = reg.nome;

                    fecharDropdown();
                };
                listaContainer.appendChild(item);
            }
        });
    }

    function fecharDropdown() {
        dropdown.classList.remove('ativo');
        setTimeout(() => {
            if (!dropdown.classList.contains('ativo')) {
                dropdown.style.display = 'none';
            }
        }, 200);
    }

    function toggleDropdown(btnElement) {
        if (dropdown.style.display === 'block' && dropdown.classList.contains('ativo')) {
            fecharDropdown();
            return;
        }

        inputSearch.value = '';
        renderizarLista();

        // CÁLCULO DE POSIÇÃO
        const rect = btnElement.getBoundingClientRect();
        let top = rect.bottom + 5;
        let left = rect.left;

        if (top + 400 > window.innerHeight) {
            top = rect.top - 410;
        }

        dropdown.style.top = `${top}px`;
        dropdown.style.left = `${left}px`;
        dropdown.style.display = 'block';

        requestAnimationFrame(() => {
            dropdown.classList.add('ativo');
            inputSearch.focus();
        });
    }

    inputSearch.addEventListener('input', (e) => renderizarLista(e.target.value));

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !e.target.closest('#btn-selecionar-regional')) {
            fecharDropdown();
        }
    });

    // --- OBSERVER ---
    const observer = new MutationObserver(() => {
        const botoes = Array.from(document.querySelectorAll('a.item.text-ellipsis'));
        const btnExistente = document.querySelector('#btn-selecionar-regional');

        const btnModelo = botoes.find(el => el.textContent.includes('Baixar Mídia'));

        if (!btnModelo || btnExistente) return;

        const novoBotao = btnModelo.cloneNode(true);
        novoBotao.id = 'btn-selecionar-regional';
        novoBotao.href = 'javascript:void(0)';

        const salvo = localStorage.getItem('sz_regional_selecionada') || 'Selecionar Regional';
        novoBotao.innerHTML = `<i class="icon map marker alternate"></i> <span id="reg-label">${salvo}</span>`;

        novoBotao.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleDropdown(novoBotao);
        });

        btnModelo.parentElement.insertBefore(novoBotao, btnModelo);
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();