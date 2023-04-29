const express = require('express')
const bodyParser = require('body-parser')
const {WebhookClient} = require('dialogflow-fulfillment')
const sql = require('mysql');
const { request } = require('http')
const { response } = require('express')

const app = express()
app.use(bodyParser.json())
const port = process.env.PORT || 3000

app.post("/dialogflow-fulfillment",(request,response)=>{
    dialogflowFulfillment(request,response)
})

app.listen(port,()=>{
    console.log(`Listening on post ${port}`)
})

const dialogflowFulfillment = (request,response) => {
    const agent = new WebhookClient({request,response})

    function connectToDatabase(){
        const connection = sql.createConnection({
          host     : 'mysql-123879-0.cloudclusters.net',
          port     : '10060',
          user     : 'admin',
          password : 'ZZGmnvkJ',
          database : 'CSV_DB'
        });
        return new Promise((resolve,reject) => {
           connection.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
    });
           resolve(connection);
        }).catch((err) => {
            console.error('Failed to load.', err);
            return Promise.reject(err);
          });
      }
      
      function queryDatabase(connection,kind,value){
        return new Promise((resolve, reject) => {
          connection.query(`Select ${kind} from disease where name_disease = '${value}'`, (error, results, fields) => {
            resolve(results);
            console.log(`Select ${kind} from disease where name_disease = '${value}'`);
          });
        })
      }
      
      function ChangeValue(value){
        if(value === "Thông tin")
          return `introduce`;
        if(value === "Nguyên nhân")
          return `reason`;
        if(value === "Triệu chứng")
          return `symptom`;
        if(value === "Ai")
          return `objects`;
        if(value === "Phòng tránh")
          return `prevent`;
        if(value === "Chẩn đoán")
          return `diagnose`;
        if(value === "Giải pháp")
          return `solution`;
      }
      
      
       function handleReadFromMySQL(agent){
         const name_disease = agent.parameters['any'];
         const disease = agent.parameters['disease'];
         const st = ChangeValue(disease);
         console.log("test11111111111");
        return connectToDatabase()
        .then(connection => {
          return queryDatabase(connection,st,name_disease)
          .then(result => {
            console.log(result);
            if(true)
            {
                switch(disease){
                    case "Thông tin":
                        agent.add(`${disease} của bệnh là : ${result[0].introduce}`);
                        break;
                    case "Nguyên nhân":
                        agent.add(`${disease} của bệnh là : ${result[0].reason}`);
                        break;
                    case "Triệu chứng":
                        agent.add(`${disease} của bệnh là : ${result[0].symptom}`);
                        break;
                    case "Ai":    
                        agent.add(`${disease} có thể bị bệnh : ${result[0].objects}`);
                        break;
                    case "Phòng tránh":
                        agent.add(`${disease} bệnh : ${result[0].prevent}`);
                        break;
                    case "Chẩn đoán":
                        agent.add(`${disease} bệnh : ${result[0].diagnose}`);
                        break;
                    case "Giải pháp":  
                        agent.add(`${disease} của bệnh là : ${result[0].solution}`); 
                        break;            
                }
            }
            connection.end();
            console.log(disease);
          });
        });
      }
    let intentMap = new Map();
    intentMap.set('getDataFromSQL', handleReadFromMySQL);
    agent.handleRequest(intentMap);
}