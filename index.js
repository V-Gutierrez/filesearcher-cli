const FinderInstance = require("node-find-files")
const fs = require("fs")
const readline = require('readline')


const SEARCH_STRING = process.argv[2]
const SEARCH_RELATIVE_PATH = process.argv[3]

var finder = new FinderInstance({
  rootFolder: SEARCH_RELATIVE_PATH,
  filterFunction: function (filePath) {
    const fileContent = fs.readFileSync(filePath, "utf8")

    if (fileContent.includes(SEARCH_STRING)) {
      return true
    }
  }
})

finder.on("match", async function (strPath, stat) {
  const fileStream = fs.createReadStream(strPath)

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  for await (const line of rl) {
    if (line.includes(SEARCH_STRING)) {
      console.log(strPath, line)

      await fs.appendFile(`./output-${SEARCH_STRING}.txt`, `${line} ~ ${strPath} \n\n\n`, (err) => {
        if (err) throw err
        else console.log('Result Found')
      })
    }
  }

})
finder.on("complete", function () {
  console.log("Finished")
})
finder.on("patherror", function (err, strPath) {
  console.log("Error for Path " + strPath + " " + err)  // Note that an error in accessing a particular file does not stop the whole show
})
finder.on("error", function (err) {
  console.log("Global Error " + err)
})
finder.startSearch()
