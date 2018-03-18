var elasticsearch=require('elasticsearch');

var client = new elasticsearch.Client( {
  hosts: [
    'http://localhost:9200/',
  ]
})
var inputfile = require("./TTAgents.json");
var bulk = [];

var makebulk = function(consultantslist, callback){
  for (var current in consultantslist){
    bulk.push(
      { index: {_index: 'consultants', _type: 'info'} },
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

var indexall = function(madebulk,callback) {
  client.bulk({
    maxRetries: 5,
    index: 'consultants',
    type: 'info',
    body: madebulk
  },function(err,resp,status) {
      if (err) {
        console.log(err);
      }
      else {
        callback(resp.items);
      }
  })
}

makebulk(inputfile, function(response){
  console.log("Bulk content prepared");
  indexall(response,function(response){
    console.log(response);
  })
});