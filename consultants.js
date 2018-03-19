const elasticsearch=require('elasticsearch');

const client = new elasticsearch.Client( {
  hosts: [
      //'https://odwwg2ng87:kaf2x3j8be@consultants-dev-8491977555.eu-west-1.bonsaisearch.net',
      'http://localhost:9200',
  ]
})


const indexName = 'consultants'
const type = 'info'

client.indices.create({
     index: indexName
 }, (err, resp, status) => {
     if (err) {
         console.log(err);
     } else {
         console.log("create", resp);
     }
 });


const inputfile = require("./TTAgents.json");
const bulk = [];

const makebulk = (consultantslist, callback) => {
  for (var current in consultantslist){
    bulk.push(
      { index: {_index: indexName, _type: type} },
      {
        'travelAgencyId': consultantslist[current].travelAgencyId,
        'travelConsultantId': consultantslist[current].travelConsultantId,
        'firstName': consultantslist[current].firstName.trim(),
        'lastName': consultantslist[current].lastName.trim(),
        'email': consultantslist[current].email.trim(),
        'organisation': consultantslist[current].organisation.trim(),
        'iatacode': consultantslist[current].iatacode,
        'addressLine1': consultantslist[current].addressLine1.trim(),
        'addresslIne2': consultantslist[current].addressLine2.trim()
      }
    );
  }
  callback(bulk);
}

const indexall = (madebulk, callback) => {
  client.bulk({
    maxRetries: 5,
    index: indexName,
    type,
    body: madebulk
  }, (err, resp, status) => {
      if (err) {
        console.log(err)
      } else {
        callback(resp.items)
      }
  })
}

makebulk(inputfile, (response) => {
  console.log("Bulk content prepared")
  indexall(response, (response) => {
    console.log("Indexing")
  })
});
