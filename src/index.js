const fs = require('fs');
const path = require('path');
const { app, BrowserWindow, dialog } = require('electron').remote;
const marked = require('marked');
marked.setOptions({
    highlight: code => {
        return require('highlightjs').highlightAuto(code).value;
    },
});

const win = BrowserWindow.getFocusedWindow();
const content = document.getElementById('content');
const settingfile = path.join(app.getPath('userData'), 'setting.json');
document.querySelector('#openFile').addEventListener('click', openFile);
document.querySelector('#saveFile').addEventListener('click', saveFile);
document.querySelector('#editFile').addEventListener('click', editFile);
document.querySelector('#closeWin').addEventListener('click', () => {
    const data = JSON.stringify({
        winsize: win.getSize(),
        defaultfile: filepath,
    });
    fs.writeFileSync(settingfile, data);
    win.close();
});

let filepath = '';
fs.readFile(settingfile, (err, data) => {
    if (err) return;

    setting = JSON.parse(data);
    win.setSize(...setting.winsize);
    filepath = setting.defaultfile;
    try {
        fs.statSync(filepath);
        readMdFile(filepath);
    } catch (err) {}
});

let markdown = '';
function openFile() {
    dialog.showOpenDialog(
        win,
        {
            properties: ['openFile'],
            filters: [
                {
                    name: 'Markdown',
                    extensions: ['md'],
                },
            ],
        },
        fileNames => {
            if (!fileNames) return;

            filepath = fileNames[0];
            readMdFile(filepath);
        }
    );
}

function readMdFile(fname) {
    fs.readFile(fname, (err, data) => {
        if (err) {
            alert('md file open error.');
            return;
        }
        markdown = data.toString();
        content.innerHTML = marked(markdown).replace(
            /disabled=""/g,
            'name="taskList"'
        );
    });
}

function saveFile() {
    if (!filepath || !markdown) return;

    let chbId = 0;
    const tl = document.getElementsByName('taskList');
    const data = markdown.replace(/\n\r?\s*-\s+\[(\s|x)\]/g, match => {
        const converter = {
            true: ['[ ]', '[x]'],
            false: ['[x]', '[ ]'],
        };
        return match.replace(...converter[tl[chbId++].checked]);
    });
    fs.writeFile(filepath, data, err => {
        if (err) {
            alert('md file save error.');
        }
    });
}

function editFile() {
    if (!filepath || !markdown) return;

    const exec = require('child_process').exec;
    exec(filepath, (err, stdout, stderr) => {
        if (err) {
            alert('editor execute err.');
        }
    });
}
