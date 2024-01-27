
const CryptoJS = require("crypto-js");

const path = require('path');
const fs = require('fs');

const { getAudioDurationInSeconds } = require('get-audio-duration')

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

    async function pushItem(wavName) {
        const name = wavName.replace('.wav', '')
        const wavFilePath = path.join(soundsFilePath, wavName);

        let item = oldItems.find(item => item.name == name) ?? { name };


        // cover
        const imagePath = soundsFilePath + '/' + name + '.webp'

        if (fs.existsSync(imagePath)) {
            item.cover = name;
        } else if ('cover' in item) {
            if (item.cover == name || !fs.existsSync(soundsFilePath + '/' + item.cover + '.webp')) {
                delete item.cover;
            }
        }

        // duration
        let duration = await getAudioDurationInSeconds(wavFilePath);
        if (isNaN(duration)) {
            console.log('error', duration)
        } else {
            item.duration = Math.round(duration)
        }

        // get size and atime via file stat
        const stat = fs.statSync(wavFilePath)
        item.size = Math.round(stat.size / 1024)
        item.atime = stat.atime
        // console.log(item)


        let tags = item.tags ?? '';
        tags = tags.split(', ');

        // tags
        if (item.name.match(/[\u3400-\u9FBF]/)) {
            if (!tags.includes('Chinese')) {
                tags.push('Chinese');
            }
        }

        const tagsRule = [
            {
                'name': 'Mario',
                'tags': ['Game'],
            },
            {
                'name': 'Star Wars',
                'tags': ['Movie'],
            },
            {
                'name': 'Jarvis',
                'tags': ['Movie'],
            },
            {
                'name': 'Doraemon',
                'tags': ['Cartoon'],
            }
        ];

        tagsRule.forEach(rule => {
            if (item.name.includes(rule.name)) {
                rule.tags.forEach((tag) => {
                    if (!tags.includes(tag)) {
                        tags.push(tag)
                    }
                })
            }
        })

        item.tags = tags.join(', ');

        console.log(item);

        newItems.push(item)
    }

    async function asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array)
        }
    }

    asyncForEach(wavFiles, pushItem).then(() => {
        // console.log(newItems);

        let string = JSON.stringify(newItems);
        // string = CryptoJS.AES.encrypt(string, '不要恐慌');

        // console.log(string);

        fs.writeFileSync(dataFilePath, string, 'utf8');
    })


});