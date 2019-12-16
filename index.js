// Example: node index.js ./xxx.srt
const fs = require('fs')
const path = require('path')

class Srt23D {
    constructor(filePath) {
        this.init(filePath)
    }

    // 初始化
    init(filePath) {
        if (path.extname(filePath) !== '.srt') { return }
        const srtArray = this.getSrt(filePath)
        const newSrtContent = this.mergeSrt(srtArray)
        const newSrtPath = this.setSrt(filePath, newSrtContent)

        return
    }

    // 获取文件内容
    getSrt(filePath) {
        const srtData = fs.readFileSync(filePath).toString().split('\r\n').join('\n')
        // 按空行分割
        const srtSplit = srtData.split(/\n\n/)
        const srtArray = []
        srtSplit.forEach(val => {
            const valSplit = val.split(/\n(\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3})\n/)
            const time = valSplit[1]
            const words = valSplit[2]
            if (time && words) {
                srtArray.push([ time, words ])
            }
        })

        return srtArray
    }

    // 写文件内容
    setSrt(filePath, fileContent) {
        const newSrtPath = path.join(
            path.dirname(filePath),
            path.basename(filePath, '.srt') + '-3D' + '.srt'
        )

        fs.writeFileSync(newSrtPath, fileContent)

        return newSrtPath
    }

    // 格式化内容
    formatSrt(index, time, text, offset) {
        const textSplit = text.split(/\n/)
        const textOffset = `${offset}${textSplit[0]}${textSplit[1] ? '\n' + offset + textSplit[1] : ''}`
        return `${index}\r\n${time}\r\n${textOffset}\r\n\r\n`
    }

    // 合并左右屏内容
    mergeSrt(data) {
        let left = ''
        let right = ''
        let index = 0
        data.forEach(val => {
            left += this.formatSrt(++index, val[0], val[1], '{\\pos(96,255)\\fscx50}')
        })
        data.forEach(val => {
            right += this.formatSrt(++index, val[0], val[1], '{\\pos(288,255)\\fscx50}')
        })

        return `${left}${right}`
    }
}

// 实例
new Srt23D(
    process.argv.splice(2)[0]
)
