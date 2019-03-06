
exports.parseRosTestOutput = function (input){
    let startLineRe = /\[ROSTEST\]\-\-\-/
    let testLineRe = /\[(.*)\]\[(.*)\]/
    let inputLines = input.split('\n')
    let started = false;
    let endLineRe = /^\-*$/
    let testResults = []
    let summary = {};
    for (let x = 0; x < inputLines.length; x++){
        if (started){
            let matches = inputLines[x].match(testLineRe)
            if (matches){
                let resultIndex = testResults.push({name: match[1], result: match[2], error: ""}) -1;
                if (matches[2] == FAILURE){
                    x++;
                    while (!inputLines[x].match(endLineRe)){
                        testResults[resultIndex].error += inputLines[x];
                        x++;
                    }
                }    
            } else if (inputLines[x].match("SUMMARY")){
                summary = {
                    result: inputLines[++x].match(/\* RESULT: (.*)\n/)[1],
                    tests: inputLines[++x].match(/\* TESTS: (.*)\n/)[1],
                    errors: inputLines[++x].match(/\* ERRORS: (.*)\n/)[1],
                    failures: inputLines[++x].match(/\* FAILURES: (.*)\n/)[1],
                }
            }
        }
        if ( inputLines[x].match(startLineRe)){
            started = true;
        } 
    }
    return {
        results: testResults,
        summary
    }
}