const parse = require('csv-parse')
const assert = require('assert')

function parseStringToArrays(csvText, delimiter = ',') {
  return new Promise((resolve, reject) => {
    const output = []
    // Create the parser
    const parser = parse({
      delimiter: delimiter
    })
    // Use the readable stream api
    parser.on('readable', function(){
      let record
      while (record = parser.read()) {
        output.push(record)
      }
    })
    // Catch any error
    parser.on('error', function(err){
      // console.error(err.message)
      reject(err);
    })
    // When we are done, test that the parsed output matched what expected
    parser.on('end', function(){
      resolve(output);
    })
    // Write data to the stream
    // parser.write("root:x:0:0:root:/root:/bin/bash\n")
    // parser.write("someone:x:1022:1022::/home/someone:/bin/bash\n")
    parser.write(csvText);
    // Close the readable stream
    parser.end()
  })
}

module.exports.parseStringToArrays = parseStringToArrays;