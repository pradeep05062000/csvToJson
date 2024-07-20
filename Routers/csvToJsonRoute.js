const express = require('express');
const CsvToJsonConvertor = require('../Controllers/csvToJsonCon');
const router = new express.Router()  

// GET route to convert csv data to json
router.get('/csv-to-json' ,CsvToJsonConvertor)


module.exports = router