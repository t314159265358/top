
const path = require('path');
const fs = require('fs');

const dataFilePath = path.join('data', 'sounds.json');
const backupFilePath = path.join('data', 'sounds.backup.json');

fs.promises.copyFile(dataFilePath, backupFilePath)

const oldItems = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

const soundsFilePath = path.join('sounds');

fs.readdir(soundsFilePath, function (err, files) {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    let newItems = [];

    const wavFiles = files.filter(file => path.extname(file).toLowerCase() === '.wav');
    wavFiles.forEach((wavName) => {
        const name = wavName.replace('.wav', '')

        let item = oldItems.find(item => item.name == name) ?? { name };


        // check image exists with same name
        let cover;
        const imagePath = soundsFilePath + '/' + name + '.webp'

        if (fs.existsSync(imagePath)) {
            item.cover = name;
        } else if ('cover' in item) {
            if (item.cover == name || !fs.existsSync(soundsFilePath + '/' + item.cover + '.webp')) {
                delete item.cover;
            }
        }

        newItems.push(item)
    })

    fs.writeFileSync(dataFilePath, JSON.stringify(newItems), 'utf8');
});