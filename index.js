#!/usr/bin/env node

// Example: node index.js ./xxx.srt
const fs = require('fs')
const path = require('path')
const iconv = require('iconv-lite')
const jschardet = require('jschardet')

class Srt23D {
    // type = 'lr' 左右3D / type = 'td' 上下3D
    constructor(filePath, type = 'lr') {
        this.init(filePath, type)
    }

    // 初始化
    init(filePath, type) {
        if (path.extname(filePath) !== '.srt') { return }
        const srtArray = this.getSrt(filePath)
        const newSrtContent = this.mergeSrt(srtArray, type)
        const newSrtPath = this.setSrt(filePath, newSrtContent)

        return
    }

    // 获取文件内容
    getSrt(filePath) {
        const srtBuf = fs.readFileSync(filePath)
        // 编码检测并映射
        let encoding = 'UTF8'
        switch (jschardet.detect(srtBuf).encoding) {
            case 'UTF-8':
                encoding = 'UTF8'
                break
            case 'GB2312':
                encoding = 'GB2312'
                break
        }
        const srtData = iconv.decode(srtBuf, encoding).toString().split('\r\n').join('\n')
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
        let texts = ''
        textSplit.forEach(val => {
            if (val) {
                texts += `${offset}${val}\r\n`
            }
        })

        return `${index}\r\n${time}\r\n${texts}\r\n`
    }

    // 合并两屏内容
    mergeSrt(data, type) {
        let partA = ''
        let partB = ''
        let offsetA = ''
        let offsetB = ''
        let index = 0

        switch (type) {
            case 'lr':
                offsetA = '{\\pos(96,255)\\fscx50}'
                offsetB = '{\\pos(288,255)\\fscx50}'
                break

            case 'td':
                offsetA = '{\\pos(192,268)\\fscy50}'
                offsetB = '{\\pos(192,124)\\fscy50}'
                break
        }

        data.forEach(val => {
            partA += this.formatSrt(++index, val[0], val[1], offsetA)
        })
        data.forEach(val => {
            partB += this.formatSrt(++index, val[0], val[1], offsetB)
        })

        return `${partA}${partB}`
    }
}

// 实例
new Srt23D(
    process.argv.splice(2)[0], 'lr'
)
