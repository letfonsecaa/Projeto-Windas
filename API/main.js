// Importa os módulos necessários
// não altere!
const serialport = require("serialport"); // Módulo para comunicação serial
const express = require("express"); // Módulo para criar um servidor web
const mysql = require("mysql2"); // Módulo para conectar ao MySQL

// Constantes para configurações
// não altere!
const SERIAL_BAUD_RATE = 9600;

const SERVIDOR_PORTA = 3300;

// Habilita ou desabilita a inserção de dados no banco de dados
// false -> nao insere
// true -> insere
const HABILITAR_OPERACAO_INSERIR = false;

// Função para comunicação serial
const serial = async (
  valoresChave,
  valoresDht11Umidade,
  valoresDht11Temperatura,
  valorfkSensor
) => {
  let poolBancoDados = "";

  // Conexão com o banco de dados MySQL
  poolBancoDados = mysql
    .createPool({
      // altere!
      // Credenciais do banco de dados
      host: "localhost",
      user: "root",
      password: "12345",
      database: "windas",
      port: 3306,
    })
    .promise();

  // Lista as portas seriais disponíveis e procura pelo Arduino
  const portas = await serialport.SerialPort.list();
  const portaArduino = portas.find(
    (porta) => porta.vendorId == 2341 && porta.productId == 43,
  );
  if (!portaArduino) {
    throw new Error("O arduino não foi encontrado em nenhuma porta serial");
  }

  // Configura a porta serial com o baud rate especificado
  const arduino = new serialport.SerialPort({
    path: portaArduino.path,
    baudRate: SERIAL_BAUD_RATE,
  });

  // Evento quando a porta serial é aberta
  arduino.on("open", () => /* Arrow function */ {
    console.log(
      `A leitura do arduino foi iniciada na porta ${portaArduino.path} utilizando Baud Rate de ${SERIAL_BAUD_RATE}`,
    );
  });

  // Processa os dados recebidos do Arduino
  arduino
    .pipe(new serialport.ReadlineParser({ delimiter: "\r\n" }))
    .on("data", async (data) => {
      console.log(data);

      const valores = data.split(","); 
      const chave = parseInt(valores[0]);
      const dht11Umidade = parseFloat(valores[1]); 
      const dht11Temperatura = parseFloat(valores[2]); 
      const fkSensor = parseFloat(valores[3]);

      valoresChave.push(chave);
      valoresDht11Umidade.push(dht11Umidade); 
      valoresDht11Temperatura.push(dht11Temperatura);
      valorfkSensor.push(fkSensor);

      // Insere os dados no banco de dados (se habilitado)
      if (HABILITAR_OPERACAO_INSERIR) {
        // altere!
        // Este insert irá inserir os dados na tabela "medida"
        await poolBancoDados.execute(
          // Valores do banco de dados local                                                                    // Substituição de valores
          "INSERT INTO leitura (dht11_temperatura, dht11_umidade, proximidade, fk_sistema_sensor) VALUES (?,?,?,?)",
          // Estruturar dados atraves de lista
          [dht11Temperatura, dht11Umidade, chave, fkSensor],
        );
        // Mostrar no console os dados inseriodos
        console.log(
          "Valores inseridos no banco: ",
          'Proximidade:', + chave, "," + 
          'Umidade:' + dht11Umidade + "," + 
          'Temperatura:' + dht11Temperatura + "," + 
          'Sistema sensor:' + fkSensor,
        );
      }
    });

  // Evento para lidar com erros na comunicação serial
  arduino.on("error", (mensagem) => {
    console.error(`Erro no arduino (Mensagem: ${mensagem}`);
  });
};
// não altere!
// Função para criar e configurar o servidor web
const servidor = (
  valoresChave,
  valoresDht11Umidade,
  valoresDht11Temperatura,
) => {
  const app = express();

  // Configurações de CORS
  app.use((request, response, next) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept",
    );
    next();
  });

  // Inicia o servidor na porta especificada
  app.listen(SERVIDOR_PORTA, () => {
    console.log(`API executada com sucesso na porta ${SERVIDOR_PORTA}`);
  });

  app.get("/sensores/chave", (_, response) => {
    return response.json(valoresChave);
  });
  // Define os endpoints da API para cada tipo de sensor
  app.get("/sensores/dht11/umidade", (_, response) => {
    return response.json(valoresDht11Umidade);
  });
  app.get("/sensores/dht11/temperatura", (_, response) => {
    return response.json(valoresDht11Temperatura);
  });
  /*     app.get('/sensores/luminosidade', (_, response) => {
        return response.json(valoresLuminosidade);
    });
    app.get('/sensores/lm35/temperatura', (_, response) => {
        return response.json(valoresLm35Temperatura);
    }); */
};

// Função principal assíncrona para iniciar a comunicação serial e o servidor web
(async () => {
  // Arrays para armazenar os valores dos sensores
  const valoresChave = [];
  const valoresDht11Umidade = [];
  const valoresDht11Temperatura = [];
  const valorfkSensor = [];

  // Inicia a comunicação serial
  await serial(valoresChave, valoresDht11Umidade, valoresDht11Temperatura, valorfkSensor);

  // Inicia o servidor web
  servidor(valoresChave, valoresDht11Umidade, valoresDht11Temperatura);
})();
