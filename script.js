let listaMensagens = [];
let listaUsuarios = [];
let usuarioSelecionado = "";
let visibilidadeSelecionada = "";
let destinatario;
let tipoMsg;
let nome;

function enviarNome(){
    nome = document.querySelector(".nome-usuario").value
    const requisicao = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants',{name: nome})
    requisicao.then(entrar);
    requisicao.catch(tratarErro);
    buscarUsuarios();
}

function entrar() {
    buscarMensagens();
    const nomeUsuario = document.querySelector(".nome-usuario")
    const botao = document.querySelector("button")
    nomeUsuario.classList.add("oculto");
    botao.classList.add("oculto");
    mudarTela()
    setInterval(persistirConexao,5000);
}

function mudarTela(){
    document.querySelector(".pagina-inicial").classList.add("oculto")
    document.querySelector(".geral").classList.remove("oculto")
}

function persistirConexao() {
    axios.post('https://mock-api.driven.com.br/api/v6/uol/status',{name: nome})
}

function tratarErro(erro){
    if(erro.response.status === 400){
        alert("Nome já utilizado!")
    } 
}

function buscarUsuarios(){
    let resposta = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants')
    resposta.then(mostrarUsuarios);
    resposta.catch(erro => console.log(erro.response.data))
}

function buscarMensagens(){
    let resposta = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages')
    resposta.then(mostrarMensagens);
    resposta.catch(erro => console.log(erro.response.data))
    const aparecerNaTela = document.querySelector(".scroll")
    aparecerNaTela.scrollIntoView()
}

function mostrarMensagens(resposta){
    listaMensagens = resposta.data;
    const chat = document.querySelector(".chat")
    chat.innerHTML = ""
    for(let i = 0; i < listaMensagens.length; i++){
        const msg = listaMensagens[i]
        if (msg.to === "Todos" || msg.to === nome || msg.from === nome){
            if (msg.type === "status"){
                chat.innerHTML += `
                <div class="mensagem-box ${msg.type}">
                    <span class="horario">(${msg.time})</span>
                    <span class="nome-do-usuario">${msg.from}</span>
                    <span class="mensagem">${msg.text}</span>
                </div>` 
            }else {
                chat.innerHTML += `
                <div class="mensagem-box ${msg.type}">
                    <span class="horario">(${msg.time})</span>
                    <span class="nome-do-usuario">${msg.from}</span> para <span class="remetente">${msg.to}:</span>
                    <span class="mensagem">${msg.text}</span>
                </div>`
            }  
        }
    }
}

function abrirMenuLateral(){
    const telaUsuarios = document.querySelector(".tela-usuarios");
    telaUsuarios.classList.toggle("oculto");
    verificaTipoMsg();
}

function mostrarUsuarios(resposta) {
    listaUsuarios = resposta.data
    const usuariosAtivosHTML = document.querySelector(".usuarios-ativos")
    for(let i = 0; i < listaUsuarios.length; i++){
        const usuario = listaUsuarios[i];
        if(document.getElementById(`${usuario.name}`) === null){
            usuariosAtivosHTML.innerHTML += ` 
            <div class="usuario" id="${usuario.name}" onclick="selecionar(this)">
                <ion-icon name="person-circle"></ion-icon>
                <span>${usuario.name}</span>
                <img class="check" src="./imgs/selecionado.png">
                
                
            </div>`
                                
        } 
    }
    let usuarioAtivo = listaUsuarios.map(usuario => usuario.name)
    let listsUsuario = document.querySelectorAll(".usuario")
    for(let index = 1; index < listsUsuario.length; index++){
            
        if(usuarioAtivo.indexOf(listsUsuario[index].getAttribute("id"))=== -1){
            let elemento = listsUsuario[index]
            elemento.parentNode.removeChild(elemento);
        }
    }        
} 

function selecionar(elemento) {
    elemento.classList.toggle("selecionado");
    if(elemento.classList.contains("usuario")){
        let listaUsuariosSelecionados = document.querySelectorAll(".usuario.selecionado")
        for(let i=0; i < listaUsuariosSelecionados.length; i++){
            const selecionado = listaUsuariosSelecionados[i];
            if(selecionado !== elemento){
                selecionado.classList.remove("selecionado");
            } 
        }

        if(listaUsuariosSelecionados.length != 0){
            usuarioSelecionado = document.querySelector(".usuario.selecionado span").innerHTML
        }else {
            usuarioSelecionado = "";
        }
    }
    else {
        let listOpcoesSelecionados = document.querySelectorAll(".selecao.selecionado")
        for(let i=0; i < listOpcoesSelecionados.length; i++){
            const selecionado = listOpcoesSelecionados[i];
            if(selecionado !== elemento){
                selecionado.classList.remove("selecionado");
            }
        }
        if(listOpcoesSelecionados.length != 0){
            visibilidadeSelecionada = document.querySelector(".selecao.selecionado span").innerHTML
        }else{
            visibilidadeSelecionada = "";
        } 
    }
    verificaTipoMsg();
}

function enviarMensagem(){
    verificaTipoMsg();
    const texto = document.querySelector(".input-enviar-msg").value;
    document.querySelector(".input-enviar-msg").value = "";
    let mensagem = 
    {
        from: nome,
        to: destinatario,
        text: texto,
        type: tipoMsg
    }
    
    const requisicao = axios.post(`https://mock-api.driven.com.br/api/v6/uol/messages`,mensagem);
    requisicao.then(buscarMensagens);
    requisicao.catch(erro => window.location.reload());

}

function verificaTipoMsg(){
    const frase = document.querySelector(".input-mensagem span")
    if(usuarioSelecionado != "" && visibilidadeSelecionada != ""){
        frase.innerHTML = `Enviando para ${usuarioSelecionado} ${visibilidadeSelecionada}`
        destinatario = usuarioSelecionado
        if(visibilidadeSelecionada === "Reservadamente"){
            tipoMsg = "private_message"
        }else{
            tipoMsg = "message"
        }
    }else{
        destinatario = "Todos"
        tipoMsg = "message"
        frase.innerHTML="";
    }
}

setInterval(buscarMensagens,3000);
setInterval(buscarUsuarios,10000);