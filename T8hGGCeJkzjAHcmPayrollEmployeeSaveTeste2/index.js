
/**
 * Nome da primitiva : employeeSave
 * Nome do dominio : hcm
 * Nome do serviço : payroll
 * Nome do tenant : trn07027732
 * Exercício desenvolvido por Nelson Capello
 **/

const axios = require('axios');

exports.handler = async (event) => {
  
  let tokenSeniorX = event.headers['X-Senior-Token'];
  let vAlfRetorno = "teste body";
  let vAlfErro = "";
  let body = parseBody(event);
  
  const instance = axios.create({
    baseURL: 'https://platform-homologx.senior.com.br/t/senior.com.br/bridge/1.0/rest/',
    headers: {'Authorization': tokenSeniorX}
  });
  
  //isso imprime no console, dá pra ver pelo F12. Só fiz pra ver funcionar mesmo, declarar, variável, imprimir, testes.
  console.log(vAlfRetorno);
  
  vAlfRetorno = "200";
  
  //validação do apelido do colaborador
  if (body.sheetPersona.nickname) {
    if (body.sheetPersona.nickname == body.sheetInitial.person.name) {
      vAlfRetorno = "400";
      vAlfErro = vAlfErro + `O apelido do colaborador não pode ser igual ao nome;${String.fromCharCode('13')}` + '\\n' + '\\r';
    }
    if (body.sheetPersona.nickname.length > 10) {
      vAlfRetorno = "400";
      vAlfErro = vAlfErro + `O apelido do colaborador não pode ter mais de 10 caracteres;${String.fromCharCode('13')}`;
    }
  } else {
    vAlfRetorno = "400";
    vAlfErro = vAlfErro + "O apelido do colaborador deve ser informado;" + String.fromCharCode('10');
  }
  
  //validação de alteração do CPF do colaborador
  if (body.sheetInitial.employee) {
    let vAlfDadosColaborador = await instance.get(`/hcm/payroll/entities/employee/${body.sheetInitial.employee.tableId}`);
  
    if (vAlfDadosColaborador.data.person.cpf !== body.sheetDocument.cpfNumber) {
      vAlfRetorno = "400";
      vAlfErro = vAlfErro + "Não é permitido alterar o CPF do Colaborador;" + '\n';
    }
  }
  
  //valida a obrigatoriedade da inclusão da foto do colaborador
  if(!body.sheetPersona.attachment) {
    vAlfRetorno = "400";
    vAlfErro = vAlfErro + "A foto do colaborador deve ser informada;" + String.fromCharCode('10');
  }
  
  // Valida Campo customizado em conjunto com campo nativo - Cargo de Confiança x Cartão Ponto
  if ((body.sheetContract.customFieldsEmployee.length !== 0) && (body.sheetComplement.issueDotCard)) {
    let vAlfListaCamposUSU = body.sheetContract.customFieldsEmployee;
    let issueDotCard = body.sheetComplement.issueDotCard;
    //Percorre a lista de campos customizados que a entidade tenha
    for (let vAlfCampoUSU of vAlfListaCamposUSU) {
      if (vAlfCampoUSU.field === 'USU_CarCon') {
         if ((vAlfCampoUSU.value === 'S') && (issueDotCard.key === 'Yes')) {
           vAlfRetorno = "400";
           vAlfErro = vAlfErro + "Colaboradores com Cargo de confiança não emitem cartão Ponto!" + String.fromCharCode('10');
        }
      }
    }
  }
  
  //validação se o colaborador é deficiente
  if ((body.sheetPersona.isDisability == "true") && (body.sheetPersona.isOccupantQuota !== "true")) {
    vAlfRetorno = "400";
    vAlfErro = vAlfErro + "Colaboradores com Deficiência, Preenche Cota tem que ser informado SIM;" + String.fromCharCode('10');
  }
  
  // manda o retorno;
  if (vAlfRetorno === "200") {
    return sendRes(vAlfRetorno, JSON.parse(event.body));
  } else {
    //console.log(vAlfRetorno);
    //console.log("meu texto simples");
    return sendRes(vAlfRetorno, vAlfErro);
  }
    
};


const parseBody = (event) => {
  return typeof event.body === 'string' ?  JSON.parse(event.body) : event.body || {};
};

const sendRes = (status, body) => {
  
  body.helloWorld = "Pronto, executei, isso é um mark pra\ndemonstrar que foi executado pela customização.";
  
  var response = {
    statusCode: status,
    headers: {
      "Content-Type": "application/json"
    },
   body: typeof body === 'string' ? body : JSON.stringify(body) 
  };
  return response;
};