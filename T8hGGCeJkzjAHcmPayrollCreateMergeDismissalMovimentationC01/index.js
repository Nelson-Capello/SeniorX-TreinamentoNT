
/**
 * Nome da primitiva : createMergeDismissalMovimentation
 * Nome do dominio : hcm
 * Nome do serviço : payroll
 * Nome do tenant : trn07027732
 **/

const axios = require('axios');

exports.handler = async (event) => {
  
  let tokenSeniorX = event.headers['X-Senior-Token'];
  let userSeniorX = event.headers['X-Senior-User'];
  let body = parseBody(event);
  
  const instance = axios.create({
    baseURL: 'https://platform-homologx.senior.com.br/t/senior.com.br/bridge/1.0/rest/',
    headers: {'Authorization': tokenSeniorX}
  });

  // se o colaborador tem cargo de confiança, não permitir cadastrar programação de desligamento, se o usuário não estiver no papel 'admin';
  if (body.employee.id) {
    userSeniorX = userSeniorX.split ('@',1)[0];
    let vUserRoles = await instance.post ('/platform/authorization/queries/getUserDetailRoles', { user: userSeniorX });
    vUserRoles = vUserRoles.data.roles.filter (role => {
      return role.name === 'admin';
    });    
    // se o comprimento de vUserRoles for zero, é porque o usuário não tem o papel de admin; nesse caso, valida usu_carcon;
    if (vUserRoles.length === 0) {
      let vAlfDadosColaborador = await instance.get(`/hcm/payroll/entities/employee/${body.employee.id}`);
      if (vAlfDadosColaborador.data.custom.USU_CarCon == 'S') {
        //return sendRes(400, 'Programação de desligamento não se aplica a Colaboradores com Cargo de confiança;');
        return sendRes(400, "Programação de desligamento não se aplica a Colaboradores com Cargo de Confiança;");
      }
    }
  }
  
  
  // se não houve crítica, retorna o body
  return sendRes(200, body);
  
};

const parseBody = (event) => {
  return typeof event.body === 'string' ?  JSON.parse(event.body) : event.body || {};
};

const sendRes = (status, body) => {
  var response = {
    statusCode: status,
    headers: {
      "Content-Type": "application/json"
    },
    body: typeof body === 'string' ? body : JSON.stringify(body) 
  };

  return response;
};
