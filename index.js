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
          return "introduce";
        if(value === "Nguyên nhân")
          return "reason";
        if(value === "Triệu chứng")
          return "symptom";
        if(value === "Ai")
          return "objects";
        if(value === "Phòng ngừa")
          return "prevent";
        if(value === "Chẩn đoán")
          return "diagnose";
        if(value === "Giải pháp")
          return "solution";
      }
      
      
       function handleReadFromMySQL(agent){
         const name_disease = agent.parameter.any;
         const disease = agent.parameter.disease;
         const kind = ChangeValue(disease);
        return connectToDatabase()
        .then(connection => {
          return queryDatabase(connection,kind)
          .then(result => {
            console.log(result);
            result.map(name =>{
              if(name_disease === name.name_disease)
              {
                agent.add(`${disease} của bệnh là : ${name.kind}`);
              }
              else{
                  agent.add('a');
              }
            });
            connection.end();
          });
        });
      }
    let intentMap = new Map();
    intentMap.set('getDataFromSQL', handleReadFromMySQL);
    agent.handleRequest(intentMap);
}