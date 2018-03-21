const express = require('express')
const es = require('elasticsearch')
var bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use(express.static('public'))

app.get('/search', (req, response) => {

    const client = new es.Client({
        host: 'http://localhost:9200',
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
                "fuzzy": {
                    "fuzziness": 2
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
    const matcherQuery = {
        size: req.query.size || 20,
        query: {
            multi_match: matcher,
        },
        highlight: {
            fields: {
                firstName: { "force_source": true },
                lastName: { "force_source": true },
                organisation: { "force_source": true },
                iatacode: { "force_source": true },
            },
            pre_tags: '<b>',
            post_tags: '</b>',
        },
    }

    const searchTerm = req.query.q.trim().split(' ').map((ele) => {
        return '*' + ele + '*'}).join(' AND ')
    const wildcardQuery = {
        "query": {
            "query_string": {
                "fields": [
                    "firstName",
                    "lastName",
                    "organisation",
                    "iatacode"
                ],
                "query": searchTerm
            }
        },
        "highlight": {
            "fields": {
                "firstName": {
                    "force_source": true
                },
                "lastName": {
                    "force_source": true
                },
                "organisation": {
                    "force_source": true
                },
                "iatacode": {
                    "force_source": true
                }
            },
            "pre_tags": "<b>",
            "post_tags": "</b>"
        }
    }
    client.search({
        index: 'consultants',
        type: 'info',
        body: wildcardQuery
    }).then((res) => {
        response.json(res.hits.hits)
    }, (err) => {
        console.log(JSON.stringify(err, null, 2))
    })
})


app.listen(8080, () => {
    console.log('SERVER HAS STARTED')
})
