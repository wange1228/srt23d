#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const Srt23D = require('./Srt23D')

inquirer.prompt([{
    type: 'input',
    name: 'srtPath',
    message: 'srt 字幕文件的路径',
    validate: (input) => {
        if (!fs.existsSync(input)) {
            return '输入的文件路径不存在'
        }
        if (path.extname(input) !== '.srt') {
            return '输入的文件路径不是 .srt 字幕格式'
        }

        return true
    }
}, {
    type: 'list',
    name: 'srtType',
    message: 'srt 字幕文件的类型',
    choices: [{
        name: '左右3D',
        value: 'lr'
    }, {
        name: '上下3D',
        value: 'td'
    }]
}]).then((answers) => {
    new Srt23D(answers.srtPath, answers.srtType, (srt) => {
        console.log(`转换已完成：${srt.newPath}`)
    })
})

