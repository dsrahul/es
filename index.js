const express = require('express')
const es = require('elasticsearch')
var bodyParser = require('body-parser')

const app = express()
const cors = require('cors')
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.use(cors()) // Use this after the variable declaration

app.get('/', (req, response) => {

    const client = new es.Client({
        host: 'localhost:9200',
        log: 'error'
    })

    var data = {
        "query": {
            "match_phrase": {
                "query": req.query.q,
                "type": "cross_fields",
                "fields": [
                    "firstName",
                    "lastName",
                    "organisation",
                    "iatacode"],
                "fuzzy" : {
                    "fuzziness" : 2
                }
            }
        }
    }

    const matcher = {
        query: req.query.q,
        type: "most_fields",
        fields: ["firstName", "lastName", "organisation", "iatacode"],
        operator: "or"
    }
    const query = {
        size: req.query.size || 20,
        query: {
            multi_match: matcher,
        },
        highlight: {
            fields: {
                firstName: {"force_source": true },
                lastName: {"force_source": true },
                organisation: {"force_source": true },
                iatacode: {"force_source": true },
            },
            pre_tags: '<b>',
            post_tags: '</b>',
        },
    }
    client.search({
        index: 'consultants',
        type: 'info',
        body: query
    }).then((res) => {
        response.json(res.hits.hits)
    }, (err) => {
        console.log(JSON.stringify(err, null, 2))
    })
})


app.listen(8080, () => {
    console.log('SERVER HAS STARTED')
})