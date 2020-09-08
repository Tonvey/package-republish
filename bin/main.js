#!/usr/bin/env node
var program = require('commander');
var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var sep = path.sep;

program.version('v' + require('../package.json').version)
    .description('Package republish util');

program.command('publish <folder contain package.json>')
    .description('Publish a package to current registry')
    .action(function (dir) {
        checkDir(dir);
        backupJson(dir);
        rewriteJson(dir);
        doPublish(dir);
        restoreJson(dir);
    });
function checkDir(dir) {
    var jsonFile = dir + sep + 'package.json';
    if (!fs.existsSync(dir)) {
        console.error("Not a directory : " , dir);
        return false;
    } 
    var stat = fs.statSync(dir);
    if (!stat.isDirectory()) {
        console.error("Not a Directory:" + dir);
        return false;
    }
    if (!fs.existsSync(jsonFile)) {
        console.error("File not exists:" + jsonFile);
        return false;
    }
    stat = fs.statSync(dir);
    if (!stat.isFile()) {
        console.error("Not a file:" + jsonFile);
        return false;
    }
    return true;
}
function backupJson(dir){
    var jsonFile = dir + sep + 'package.json';
    var jsonBakFile = dir + sep + 'package.json.bak';
    fs.copyFileSync(jsonFile,jsonBakFile);
}
function rewriteJson(dir) {
    var jsonFile = dir + sep + 'package.json';
    var rawData = fs.readFileSync(jsonFile);
    var package = JSON.parse(rawData);
    var newPackage = {};
    var needRewrite = false;
    for (var i in package) {
        if (i[0] === '_') {
            //console.log('hahahah:', i);
            needRewrite = true;
        } else {
            newPackage[i] = package[i];
        }
    }
    if (needRewrite){
        var newData = JSON.stringify(newPackage,null,'  ');
        fs.writeFileSync(jsonFile, newData);
    }
}
function doPublish(dir){
    try {
        cp.execFileSync('npm', [
            'publish',
            dir
        ]);
    } catch (error) {
        console.error(error); 
    }
}
function restoreJson(dir){
    var jsonFile = dir + sep + 'package.json';
    var jsonBakFile = dir + sep + 'package.json.bak';
    fs.renameSync(jsonBakFile,jsonFile);
}

function runCommandAndPrint(command,args,options){
    var finalStr = command;
    for (var i in args) {
        finalStr += ' ' + args[i];
    }
    console.log('Run command: ' + finalStr);
    cp.execFileSync(command,args,options);
}

function main() {
    program.parse(process.argv);
}
main();