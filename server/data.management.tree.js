/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

// token handling in session
var request = require("request");
// web framework
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser());
var fs = require('fs');
var moment = require('moment');

// var circuits = require('../circuits.json');
// console.log('circuits:');

var oauth = require('./oauth');
// forge
var forgeSDK = require('forge-apis');

router.post('/updatecircuit', function (req, res) {
  var newcircuits = req.body;
  console.log('newcircuits');
  console.log(newcircuits)
  var fs = require('fs');
  var fileName = decodeURIComponent(req.query.name)+'.json';
  fs.writeFile (fileName, JSON.stringify(newcircuits), function(err) {
    if (err) throw err;
    });
  res.contentType('json');
  res.send({ 'status': 'success'});

});

router.get('/circuits', function (req, res) {
  var filename = decodeURIComponent(req.query.name);
  var circuits = require('../'+filename+'.json');
  res.contentType('json');
  res.send(circuits);
});

router.get('/thumbnails', function (req, res) {
  var urn = decodeURIComponent(req.query.id);
  var safeUrn = urn.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  oauth.getTokenInternal().then(function (credentials) {
    request({
      url: 'https://developer.api.autodesk.com/modelderivative/v2/designdata/' + safeUrn +'/thumbnail',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + credentials.access_token
      },
      encoding: null,
      responseType: 'buffer',
      },
      function(error, response, body) {
        if ( error || response.statusCode !== 200 ) {
          fs.readFile(__dirname + '/../www/img/no-access-without-permission-sign.jpg', function (err, data) {
            if (err)
            return (res.status (404).end ());
            res.contentType('image/jpeg');
            res.end(data);
          });
          return ;
        }
        res.contentType('image/png');
        res.end(body);
      });
    });

});

module.exports = router;