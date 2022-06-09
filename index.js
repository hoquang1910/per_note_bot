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
          host     : 'sql6.freemysqlhosting.net',
          user     : 'sql6498706',
          password : 'ztQBhxg8X1',
          database : 'sql6498706'
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
      
      function queryDatabase(connection,value){
        return new Promise((resolve, reject) => {
          connection.query(`Select ${value} from disease`, (error, results, fields) => {
            resolve(results);
            
          });
        });
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
        if(value === "Phòng ngừa")
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
        return connectToDatabase()
        .then(connection => {
          return queryDatabase(connection,st)
          .then(result => {
            console.log(result);
            if(true)
            {
                if(disease === "Thông tin")
                    agent.add(`${name_disease} của bệnh là : ${name_disease.introduce}`);
                if(disease === "Nguyên nhân")
                    agent.add(`${disease} của bệnh là : ${name_disease.reason}`);
                if(disease === "Triệu chứng")
                    agent.add(`${disease} của bệnh là : ${name_disease.symptom}`);
                if(disease === "Ai")
                    agent.add(`${disease} của bệnh là : ${name_disease.objects}`);
                if(disease === "Phòng ngừa")
                    agent.add(`${disease} của bệnh là : ${name_disease.prevent}`);
                if(disease === "Chẩn đoán")
                    agent.add(`${disease} của bệnh là : ${name_disease.diagnose}`);
                if(disease === "Giải pháp")
                    agent.add(`${disease} của bệnh là : ${name_disease.solution}`);
            }
            connection.end();
          });
        });
      }
    let intentMap = new Map();
    intentMap.set('getDataFromSQL', handleReadFromMySQL);
    agent.handleRequest(intentMap);
}