
exports.parseRosTestOutput = function (input){
    const startLineRe = /\[ROSTEST\]\-\-\-/
    const testLineRe = /\[(.*)\]\[(.*)\]/
    const inputLines = input.split('\n')
    let started = false;
    const endLineRe = /^\-*$/
    let testResults = []
    let summary = {};
    for (let x = 0; x < inputLines.length; x++){
        if (started){
            let matches = inputLines[x].match(testLineRe)
            if (matches){
                let resultIndex = testResults.push({name: matches[1], result: matches[2], error: ""}) -1;
                if (matches[2] == 'FAILURE'){
                    x++;
                    while (!inputLines[x].match(endLineRe)){
                        testResults[resultIndex].error += inputLines[x] + "\n";
                        x++;
                    }
                }    
            } else if (inputLines[x].match("SUMMARY")){
                summary = {
                    result: inputLines[++x].match(/ \* RESULT\: (.*)/)[1],
                    tests: inputLines[++x].match(/ \* TESTS\: (.*)/)[1],
                    errors: inputLines[++x].match(/ \* ERRORS\: (.*)/)[1],
                    failures: inputLines[++x].match(/ \* FAILURES\: (.*)/)[1],
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